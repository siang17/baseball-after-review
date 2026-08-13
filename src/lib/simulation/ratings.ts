/**
 * 評價層：把球員數據轉成模擬引擎可用的「每打席結果機率向量」。
 *
 * ── 模型說明（刻意寫清楚，因為每一步都是可被質疑的簡化）────────────
 *
 * 1. 聯盟基準：以國際賽（低得分環境）的每打席結果分布為基準向量。
 * 2. 打者：用 wRC+ 當整體攻擊指數，用 ISO 決定「力量 / 接觸」型態，
 *    用 whiff% 微調三振率。
 * 3. 投手：用 FIP 相對聯盟的比值當壓制指數。
 * 4. 對戰：以 log5（勝算比法）合成打者與投手的上壘成功率，
 *    再依打者的型態向量分配到各結果類別。
 *
 * 這不是 Statcast 等級的逐球模型 —— 它是一個「可解釋、可重現、
 * 對相對比較有效」的中階模型。要升級成逐球模型，替換 `plateAppearanceProbs()`
 * 即可，其餘引擎不需改動。
 */

import type { Era, MatchupGrade, Player, Roster } from '@/types/baseball';
import { clamp } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* 打席結果類別                                                        */
/* ------------------------------------------------------------------ */

export const OUTCOMES = [
  'K',        // 三振
  'BB',       // 保送（含觸身）
  'HR',
  'TRIPLE',
  'DOUBLE',
  'SINGLE',
  'OUT',      // 場內出局
] as const;

export type Outcome = (typeof OUTCOMES)[number];

/** 依 OUTCOMES 順序排列的機率向量。 */
export type OutcomeVector = number[];

/**
 * 國際賽基準分布（每打席）。
 * 相較 MLB 略低的長打率與略高的三振率，對應 `RUN_ENV_FACTOR = 0.92`。
 */
export const LEAGUE: Record<Outcome, number> = {
  K: 0.225,
  BB: 0.085,
  HR: 0.03,
  TRIPLE: 0.005,
  DOUBLE: 0.045,
  SINGLE: 0.145,
  OUT: 0.465,
};

/** 上壘（非出局）總機率 —— log5 合成時的「成功率」。 */
export const LEAGUE_ON_BASE = LEAGUE.BB + LEAGUE.HR + LEAGUE.TRIPLE + LEAGUE.DOUBLE + LEAGUE.SINGLE;

const LEAGUE_ISO = 0.155;
const LEAGUE_WHIFF = 0.24;
const LEAGUE_FIP = 3.9;

/* ------------------------------------------------------------------ */
/* 球員側寫                                                            */
/* ------------------------------------------------------------------ */

export interface BatterProfile {
  playerId: string;
  /** 整體攻擊指數，1.0 = 聯盟平均。 */
  offenseIndex: number;
  /** 力量傾向，1.0 = 聯盟平均 ISO。 */
  powerIndex: number;
  /** 三振傾向，1.0 = 聯盟平均揮空率。 */
  strikeoutIndex: number;
  /** 選球傾向，1.0 = 聯盟平均保送率。 */
  walkIndex: number;
  /** 跑壘速度（ft/s），影響一安進壘與雙殺。 */
  speed: number;
}

export interface PitcherProfile {
  playerId: string;
  /** 壓制指數，>1 表示優於聯盟平均。 */
  suppressionIndex: number;
  /** 三振傾向。 */
  strikeoutIndex: number;
  /** 控球（保送）傾向，>1 表示比平均更容易保送。 */
  walkIndex: number;
  /** 每 25 球的球速衰退（mph），用於疲勞模型。 */
  velocityDeclinePer25: number;
  /** 角色，決定牛棚調度順序。 */
  role: 'SP' | 'RP' | 'CL';
}

/* ------------------------------------------------------------------ */
/* 由 Player 建立側寫                                                  */
/* ------------------------------------------------------------------ */

/**
 * 聯盟／年代校正係數。
 * `applyEraAdjustment` 關閉時一律回傳 1，讓使用者能看到「未校正」的原始對決。
 */
export function adjustmentFactor(
  player: Player,
  domain: 'offense' | 'pitching',
  applyEraAdjustment: boolean,
): number {
  if (!applyEraAdjustment || !player.adjustment) return 1;
  return domain === 'offense'
    ? player.adjustment.offenseFactor
    : player.adjustment.pitchingFactor;
}

/**
 * 年代基準差：2024 十二強的參賽陣容普遍不如 2026 WBC 完全體。
 * 跨年代對決時對 2024 方施加折減，避免兩屆數據被當成同一把尺。
 *
 * ⚠️ 0.96 是可調的預設值，不是實證結果。
 */
export const ERA_BASELINE: Record<Era, number> = {
  2024: 0.96,
  2026: 1.0,
};

export function buildBatterProfile(
  player: Player,
  opts: { applyEraAdjustment: boolean; era: Era },
): BatterProfile {
  const b = player.batting;
  const leagueAdj = adjustmentFactor(player, 'offense', opts.applyEraAdjustment);
  const eraAdj = opts.applyEraAdjustment ? ERA_BASELINE[opts.era] : 1;

  // 攻擊指數：優先用 wRC+，退而求其次用 OPS 相對 0.720 的比值。
  const rawOffense =
    b?.wrcPlus != null
      ? b.wrcPlus / 100
      : b?.ops
        ? b.ops / 0.72
        : 1;

  const iso = b ? Math.max(0, b.slg - b.avg) : LEAGUE_ISO;

  return {
    playerId: player.id,
    offenseIndex: clamp(rawOffense * leagueAdj * eraAdj, 0.35, 2.2),
    powerIndex: clamp((iso || LEAGUE_ISO) / LEAGUE_ISO, 0.3, 2.4),
    strikeoutIndex: clamp((b?.whiffPct ?? LEAGUE_WHIFF) / LEAGUE_WHIFF, 0.4, 2),
    walkIndex: clamp(b?.obp ? b.obp / 0.32 : 1, 0.5, 1.9),
    speed: b?.sprintSpeed ?? 27,
  };
}

export function buildPitcherProfile(
  player: Player,
  opts: { applyEraAdjustment: boolean; era: Era },
): PitcherProfile {
  const p = player.pitching;
  const leagueAdj = adjustmentFactor(player, 'pitching', opts.applyEraAdjustment);
  const eraAdj = opts.applyEraAdjustment ? ERA_BASELINE[opts.era] : 1;

  // FIP 越低越好 → 取倒數比值當壓制指數。缺 FIP 時退回 ERA。
  const fip = p?.fip ?? p?.era ?? LEAGUE_FIP;
  const rawSuppression = LEAGUE_FIP / Math.max(1, fip);

  return {
    playerId: player.id,
    // 校正係數 <1 代表「該聯盟數據要打折」，對投手而言是壓制力下修。
    suppressionIndex: clamp(rawSuppression * leagueAdj * eraAdj, 0.5, 2.0),
    strikeoutIndex: clamp(p?.k9 ? p.k9 / 8.6 : 1, 0.4, 2.0),
    walkIndex: clamp(p?.bb9 ? p.bb9 / 3.1 : 1, 0.4, 2.2),
    velocityDeclinePer25: p?.velocityDeclinePer25 ?? 0.35,
    role: p?.gs && p.gs > 0 ? 'SP' : (player.pitcherRole ?? 'RP'),
  };
}

/* ------------------------------------------------------------------ */
/* log5 對戰合成                                                       */
/* ------------------------------------------------------------------ */

/**
 * log5（勝算比法）：把打者能力、投手能力與聯盟平均合成為單一機率。
 * p = (B·P/L) / (B·P/L + (1−B)(1−P)/(1−L))
 */
export function log5(batter: number, pitcher: number, league: number): number {
  const num = (batter * pitcher) / league;
  const den = num + ((1 - batter) * (1 - pitcher)) / (1 - league);
  return den === 0 ? league : num / den;
}

export interface MatchupModifiers {
  /** TTOP 懲罰（wOBA 點，見 sabermetrics.ttopPenalty）。 */
  ttopPenalty: number;
  /** 疲勞造成的壓制力折減（0–1，0 = 無影響）。 */
  fatigue: number;
  /** 主場優勢對進攻方的乘數。 */
  homeBoost: number;
}

/**
 * 產生單次打席的結果機率向量。
 *
 * 步驟：
 *  1. 以 log5 合成上壘率（打者 vs. 投手 vs. 聯盟）。
 *  2. 套用 TTOP、疲勞、主場修正。
 *  3. 依打者的力量／三振／選球傾向，把上壘率分配到各類別。
 */
export function plateAppearanceProbs(
  batter: BatterProfile,
  pitcher: PitcherProfile,
  mods: MatchupModifiers,
): OutcomeVector {
  // --- 1. 上壘率 ---
  const batterOnBase = clamp(LEAGUE_ON_BASE * batter.offenseIndex, 0.08, 0.72);
  const pitcherOnBase = clamp(LEAGUE_ON_BASE / pitcher.suppressionIndex, 0.08, 0.72);
  let onBase = log5(batterOnBase, pitcherOnBase, LEAGUE_ON_BASE);

  // --- 2. 情境修正 ---
  // TTOP 懲罰以 wOBA 點表示，約略等值於同幅度的上壘率位移。
  onBase += mods.ttopPenalty;
  onBase += mods.fatigue * 0.06;
  onBase *= mods.homeBoost;
  onBase = clamp(onBase, 0.08, 0.75);

  // --- 3. 分配到各類別 ---
  // 三振與保送先從「出局／上壘」兩池各自取走，再把剩餘按型態分配。
  const kShare = clamp(
    LEAGUE.K * batter.strikeoutIndex * pitcher.strikeoutIndex,
    0.05,
    0.55,
  );
  const bbShare = clamp(
    LEAGUE.BB * batter.walkIndex * pitcher.walkIndex,
    0.01,
    0.28,
  );

  // 保送屬於上壘，不能超過總上壘率。
  const bb = Math.min(bbShare, onBase * 0.85);
  const hits = onBase - bb;

  // 安打型態：以力量指數在「接觸型」與「長打型」向量之間插值。
  const contactShape = { HR: 0.1, TRIPLE: 0.03, DOUBLE: 0.22, SINGLE: 0.65 };
  const powerShape = { HR: 0.34, TRIPLE: 0.02, DOUBLE: 0.28, SINGLE: 0.36 };
  const w = clamp((batter.powerIndex - 0.6) / 1.2, 0, 1);

  const hr = hits * (contactShape.HR + (powerShape.HR - contactShape.HR) * w);
  const triple = hits * (contactShape.TRIPLE + (powerShape.TRIPLE - contactShape.TRIPLE) * w);
  const double = hits * (contactShape.DOUBLE + (powerShape.DOUBLE - contactShape.DOUBLE) * w);
  const single = hits - hr - triple - double;

  // 出局池：先扣三振，剩下是場內出局。
  const outTotal = 1 - onBase;
  const k = Math.min(kShare, outTotal * 0.95);
  const out = outTotal - k;

  return [k, bb, hr, triple, double, single, out];
}

/** wOBA 線性權重（2020s 尺度），用於把機率向量換算成單一期望值。 */
const WOBA_WEIGHTS: Record<Outcome, number> = {
  K: 0,
  OUT: 0,
  BB: 0.69,
  SINGLE: 0.89,
  DOUBLE: 1.27,
  TRIPLE: 1.62,
  HR: 2.1,
};

/** 由打席機率向量計算期望 wOBA。 */
export function expectedWoba(probs: OutcomeVector): number {
  let total = 0;
  for (let i = 0; i < OUTCOMES.length; i++) {
    total += probs[i] * WOBA_WEIGHTS[OUTCOMES[i]];
  }
  return Number(total.toFixed(3));
}

/* ------------------------------------------------------------------ */
/* 球隊評比                                                            */
/* ------------------------------------------------------------------ */

function avg(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/** 把一個「1.0 = 平均」的指數映射到 0–100 分。 */
function toGrade(index: number, spread = 0.45): number {
  return Math.round(clamp(50 + ((index - 1) / spread) * 25, 0, 100));
}

/**
 * 由名單計算攻守評比（0–100）。
 * 守備以 UZR 為核心指標，符合 BAR 的設定。
 */
export function gradeRoster(
  roster: Roster,
  opts: { applyEraAdjustment: boolean },
): MatchupGrade {
  const era = roster.era;
  const batters = [...roster.lineup, ...roster.bench];
  const profiles = batters.map((p) => buildBatterProfile(p, { ...opts, era }));

  const rotation = roster.rotation.map((p) => buildPitcherProfile(p, { ...opts, era }));
  const relievers = [...roster.bullpen, ...(roster.closer ? [roster.closer] : [])].map((p) =>
    buildPitcherProfile(p, { ...opts, era }),
  );

  // 守備：先發九人的 UZR/150 總和，每 10 分約等於 1 個評比級距。
  const uzrTotal = roster.lineup.reduce((sum, p) => sum + (p.fielding?.uzr150 ?? 0), 0);

  const offense = toGrade(avg(profiles.map((p) => p.offenseIndex)));
  const contact = toGrade(avg(profiles.map((p) => 2 - p.strikeoutIndex)));
  const power = toGrade(avg(profiles.map((p) => p.powerIndex)), 0.6);
  const defense = Math.round(clamp(50 + uzrTotal * 1.2, 0, 100));
  const rotationGrade = toGrade(avg(rotation.map((p) => p.suppressionIndex)), 0.4);
  const bullpenGrade = toGrade(avg(relievers.map((p) => p.suppressionIndex)), 0.4);
  const baserunning = toGrade(avg(profiles.map((p) => p.speed / 27)), 0.12);

  return {
    offense,
    contact,
    power,
    defense,
    rotation: rotationGrade,
    bullpen: bullpenGrade,
    baserunning,
    // 權重：進攻 30%、輪值 22%、牛棚 18%、守備 18%、跑壘 12%
    overall: Math.round(
      offense * 0.3 +
        rotationGrade * 0.22 +
        bullpenGrade * 0.18 +
        defense * 0.18 +
        baserunning * 0.12,
    ),
  };
}
