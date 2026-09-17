/**
 * 逐球復盤產生器 —— 把一份（可能是使用者自訂過的）先發打線／守備／投手輪值
 * 跑過一整場比賽，產出 `GameReview`：包含每一球的 `PitchData`、勝率曲線、
 * 關鍵轉折點、代打/代跑/換投等決策節點、投手使用紀錄。
 *
 * 設計上是「整場一次算完存成陣列」，不是即時互動的產生器——這樣才能直接餵給
 * 既有的 `useReplayStore.cursor` + `GameReview.pitches[]` 捲動介面，
 * `TacticalControlHUD`/`WinProbabilityChart`/`CrucialPlayList`/`ManagerDecisionModal`
 * 完全不用改。
 *
 * ⚠️ 換投/代打的「AI 最佳解」是用球員能力指數（`buildBatterProfile`/
 * `buildPitcherProfile`）直接比較出的估計值，不是真的把賽局重跑一次分岔——
 * 跟現有 `DecisionOption.projectedDeltaWp` 的既有用法一致。
 */

import { bi } from '@/lib/i18n';
import { createPitchLimitConfig, restDaysFor } from '@/lib/constants';
import { leverageIndex as computeLeverageIndex, isHighLeverage, re24 as computeRe24, severityFromSwing, winExpectancy } from '@/lib/sabermetrics';
import { synthesizePitches } from './pitchSynthesizer';
import { simulateGame, type Bases, type PlateAppearanceEvent } from './gameSim';
import { seedFrom, makeRng } from './random';
import { buildBatterProfile, buildPitcherProfile, type BatterProfile, type PitcherProfile } from './ratings';
import type {
  CrucialPlay,
  DecisionOption,
  DecisionPoint,
  Game,
  GameReview,
  MatchState,
  PitchData,
  Player,
  Roster,
  Side,
  TeamCode,
  WinProbabilityPoint,
} from '@/types/baseball';
import type { SimTeam } from './gameSim';

/* ------------------------------------------------------------------ */
/* 隊伍轉換                                                            */
/* ------------------------------------------------------------------ */

function buildSimTeam(roster: Roster): SimTeam {
  const era = roster.era;
  const starter = roster.rotation[0] ?? roster.bullpen[0];
  const pitchers: Player[] = [starter, ...roster.bullpen.filter((p) => p.id !== starter?.id), ...(roster.closer ? [roster.closer] : [])].filter(
    (p): p is Player => Boolean(p),
  );

  return {
    code: roster.teamCode,
    era,
    lineup: roster.lineup.map((p) => buildBatterProfile(p, { applyEraAdjustment: false, era })),
    pitchers: pitchers.map((p) => buildPitcherProfile(p, { applyEraAdjustment: false, era })),
  };
}

function findCatcherId(roster: Roster): string {
  const catcher = roster.lineup.find((p) => p.positions.includes('C')) ?? roster.bench.find((p) => p.positions.includes('C'));
  return catcher?.id ?? roster.lineup[0].id;
}

/* ------------------------------------------------------------------ */
/* MatchState 建構                                                     */
/* ------------------------------------------------------------------ */

function buildMatchState(params: {
  gameId: string;
  inning: number;
  half: 'TOP' | 'BOTTOM';
  outs: 0 | 1 | 2 | 3;
  bases: Bases;
  score: { home: number; away: number };
  offense: Side;
  batterId: string;
  pitcherId: string;
  catcherId: string;
  pitcherPitchCount: number;
  timesThroughOrder: number;
}): MatchState {
  const partial: MatchState = {
    gameId: params.gameId,
    inning: params.inning,
    half: params.half,
    outs: params.outs,
    balls: 0,
    strikes: 0,
    bases: params.bases,
    score: params.score,
    batterId: params.batterId,
    pitcherId: params.pitcherId,
    catcherId: params.catcherId,
    offense: params.offense,
    pitcherPitchCount: params.pitcherPitchCount,
    timesThroughOrder: params.timesThroughOrder,
    winProbabilityHome: 0.5,
    leverageIndex: 1,
    challengesRemaining: { home: 2, away: 2 },
  };
  partial.winProbabilityHome = winExpectancy(partial);
  partial.leverageIndex = computeLeverageIndex(partial);
  return partial;
}

/* ------------------------------------------------------------------ */
/* 逐打席紀錄（中介資料，跑完全場後再整理成 GameReview 各區塊）           */
/* ------------------------------------------------------------------ */

interface PaRecord {
  event: PlateAppearanceEvent;
  pitches: PitchData[];
  wpBefore: number;
  wpAfter: number;
  li: number;
  re24: number;
  scoreBefore: { home: number; away: number };
  scoreAfter: { home: number; away: number };
}

/* ------------------------------------------------------------------ */
/* 主函式                                                              */
/* ------------------------------------------------------------------ */

export interface GameReviewResult {
  review: GameReview;
  /** 每一球所屬打席的最終結果（K/BB/HR/…），供打擊軌跡圖等需要「這球後來是不是全壘打」的元件使用。 */
  outcomeByPitchId: Record<string, PlateAppearanceEvent['outcome']>;
}

/** 只需要 `GameReview` 本身時的簡便包裝。 */
export function generateGameReview(homeRoster: Roster, awayRoster: Roster, game: Game, seed: string): GameReview {
  return generateGameReviewDetailed(homeRoster, awayRoster, game, seed).review;
}

export function generateGameReviewDetailed(homeRoster: Roster, awayRoster: Roster, game: Game, seed: string): GameReviewResult {
  const homeTeam = buildSimTeam(homeRoster);
  const awayTeam = buildSimTeam(awayRoster);

  const pitcherProfileById = new Map<string, PitcherProfile>();
  for (const p of [...homeTeam.pitchers, ...awayTeam.pitchers]) pitcherProfileById.set(p.playerId, p);
  const batterProfileById = new Map<string, BatterProfile>();
  for (const b of [...homeTeam.lineup, ...awayTeam.lineup]) batterProfileById.set(b.playerId, b);

  const catcherIdByTeam: Record<TeamCode, string> = {
    [homeRoster.teamCode]: findCatcherId(homeRoster),
    [awayRoster.teamCode]: findCatcherId(awayRoster),
  } as Record<TeamCode, string>;

  const rand = makeRng(seedFrom(seed, game.id));
  const pitchLimit = game.pitchLimitPreset === 'UNLIMITED' ? null : game.pitchLimitPreset;

  let homeScore = 0;
  let awayScore = 0;
  let globalPitchIndex = 0;
  let atBatIndex = 0;
  const records: PaRecord[] = [];

  simulateGame(
    homeTeam,
    awayTeam,
    { pitchLimit, homeBoost: 1, extraInningRunner: true, mercyRule: true, maxInnings: 15 },
    rand,
    (event) => {
      const offenseIsHome = event.offenseCode === game.homeTeamCode;
      const scoreBefore = { home: homeScore, away: awayScore };

      const pitcherProfile = pitcherProfileById.get(event.pitcherId);
      if (!pitcherProfile) return; // 理論上不會發生，型別安全用的守衛。

      const catcherId = catcherIdByTeam[event.defenseCode];
      const cumulativePitchCountBefore = event.cumulativePitchCount - event.pitchesThrown;

      const pitches = synthesizePitches({
        event,
        pitcher: pitcherProfile,
        cumulativePitchCountBefore,
        catcherId,
        gameId: game.id,
        atBatIndex,
        globalPitchIndexStart: globalPitchIndex,
        stateBefore: {
          inning: event.inning,
          half: event.half,
          outs: event.outsBefore as 0 | 1 | 2 | 3,
          bases: event.basesBefore,
          score: scoreBefore,
        },
        rand,
      });
      globalPitchIndex += pitches.length;
      atBatIndex += 1;

      if (offenseIsHome) homeScore += event.runsScored;
      else awayScore += event.runsScored;
      const scoreAfter = { home: homeScore, away: awayScore };

      const offenseSide: Side = offenseIsHome ? 'HOME' : 'AWAY';
      const stateBeforeMs = buildMatchState({
        gameId: game.id,
        inning: event.inning,
        half: event.half,
        outs: event.outsBefore as 0 | 1 | 2 | 3,
        bases: event.basesBefore,
        score: scoreBefore,
        offense: offenseSide,
        batterId: event.batterId,
        pitcherId: event.pitcherId,
        catcherId,
        pitcherPitchCount: cumulativePitchCountBefore,
        timesThroughOrder: event.timesThroughOrder,
      });
      const stateAfterMs = buildMatchState({
        gameId: game.id,
        inning: event.inning,
        half: event.half,
        outs: Math.min(3, event.outsAfter) as 0 | 1 | 2 | 3,
        bases: event.basesAfter,
        score: scoreAfter,
        offense: offenseSide,
        batterId: event.batterId,
        pitcherId: event.pitcherId,
        catcherId,
        pitcherPitchCount: event.cumulativePitchCount,
        timesThroughOrder: event.timesThroughOrder,
      });

      const wpBefore = stateBeforeMs.winProbabilityHome;
      const wpAfter = stateAfterMs.winProbabilityHome;
      const re24Value = computeRe24(
        { bases: event.basesBefore, outs: event.outsBefore },
        { bases: event.basesAfter, outs: event.outsAfter },
        event.runsScored,
      );

      // 把算好的勝率/槓桿/RE24 回填到這個打席最後一球（其餘球維持中性值）。
      const lastPitch = pitches[pitches.length - 1];
      lastPitch.deltaWinProbability = wpAfter - wpBefore;
      lastPitch.leverageIndex = stateBeforeMs.leverageIndex;
      lastPitch.re24 = re24Value;
      for (const p of pitches) if (p !== lastPitch) p.leverageIndex = stateBeforeMs.leverageIndex;

      records.push({
        event,
        pitches,
        wpBefore,
        wpAfter,
        li: stateBeforeMs.leverageIndex,
        re24: re24Value,
        scoreBefore,
        scoreAfter,
      });
    },
  );

  const allPitches = records.flatMap((r) => r.pitches);

  /* ---------------- 勝率曲線 ---------------- */
  const winProbability: WinProbabilityPoint[] = records.map((r, i) => ({
    index: i,
    inning: r.event.inning,
    half: r.event.half,
    home: r.wpAfter,
    leverageIndex: r.li,
    score: r.scoreAfter,
    label: paLabel(r, homeRoster, awayRoster),
    crucialPlayId: null,
  }));

  /* ---------------- 關鍵轉折點 ---------------- */
  const byAbsDelta = [...records]
    .map((r, i) => ({ r, i, delta: r.wpAfter - r.wpBefore }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const crucialPlays: CrucialPlay[] = byAbsDelta.slice(0, 4).map(({ r, i, delta }) => {
    const id = `${game.id}-crucial-${i}`;
    winProbability[i].crucialPlayId = id;
    const beneficiary: Side = delta >= 0 ? 'HOME' : 'AWAY';
    return {
      id,
      gameId: game.id,
      pitchId: r.pitches[r.pitches.length - 1].id,
      decisionPointId: null,
      category: 'PLAY',
      inning: r.event.inning,
      half: r.event.half,
      deltaWinProbability: delta,
      leverageIndex: r.li,
      re24: r.re24,
      beneficiary,
      title: bi(`${r.event.inning} 局 · ${outcomeLabel(r.event.outcome).zh}`, `Inning ${r.event.inning} · ${outcomeLabel(r.event.outcome).en}`),
      description: bi(
        `${resolveName(r.event.batterId, homeRoster, awayRoster).zh} 面對 ${resolveName(r.event.pitcherId, homeRoster, awayRoster).zh}，勝率變化 ${(delta * 100).toFixed(1)}%。`,
        `${resolveName(r.event.batterId, homeRoster, awayRoster).en} vs. ${resolveName(r.event.pitcherId, homeRoster, awayRoster).en} — win probability shifted ${(delta * 100).toFixed(1)}%.`,
      ),
      breakdown: [
        bi(`打席結果：${outcomeLabel(r.event.outcome).zh}`, `Outcome: ${outcomeLabel(r.event.outcome).en}`),
        bi(`槓桿指數 ${r.li.toFixed(2)}`, `Leverage index ${r.li.toFixed(2)}`),
        bi(`RE24 ${r.re24 >= 0 ? '+' : ''}${r.re24.toFixed(2)}`, `RE24 ${r.re24 >= 0 ? '+' : ''}${r.re24.toFixed(2)}`),
      ],
      severity: severityFromSwing(delta),
      videoUrl: null,
    };
  });

  /* ---------------- 決策節點：換投／代打 ---------------- */
  const decisionPoints = buildDecisionPoints(records, homeRoster, awayRoster, game);

  /* ---------------- 投手使用紀錄 ---------------- */
  const pitcherUsage = buildPitcherUsage(records, game);

  /* ---------------- 逐球結果對照（打擊軌跡圖等用） ---------------- */
  const outcomeByPitchId: Record<string, PlateAppearanceEvent['outcome']> = {};
  for (const r of records) for (const p of r.pitches) outcomeByPitchId[p.id] = r.event.outcome;

  return {
    review: {
      game,
      pitches: allPitches,
      winProbability,
      crucialPlays,
      decisionPoints,
      pitcherUsage,
      clockViolations: [],
    },
    outcomeByPitchId,
  };
}

/* ------------------------------------------------------------------ */
/* 輔助：文字標籤                                                       */
/* ------------------------------------------------------------------ */

function resolveName(playerId: string, homeRoster: Roster, awayRoster: Roster) {
  for (const roster of [homeRoster, awayRoster]) {
    for (const list of [roster.lineup, roster.bench, roster.rotation, roster.bullpen, roster.closer ? [roster.closer] : []]) {
      const found = list.find((p) => p.id === playerId);
      if (found) return found.name;
    }
  }
  return bi(playerId, playerId);
}

const OUTCOME_LABELS: Record<PlateAppearanceEvent['outcome'], { zh: string; en: string }> = {
  K: { zh: '三振', en: 'Strikeout' },
  BB: { zh: '保送', en: 'Walk' },
  HR: { zh: '全壘打', en: 'Home run' },
  TRIPLE: { zh: '三壘安打', en: 'Triple' },
  DOUBLE: { zh: '二壘安打', en: 'Double' },
  SINGLE: { zh: '一壘安打', en: 'Single' },
  OUT: { zh: '出局', en: 'Out' },
};

function outcomeLabel(outcome: PlateAppearanceEvent['outcome']) {
  return OUTCOME_LABELS[outcome];
}

function paLabel(r: PaRecord, homeRoster: Roster, awayRoster: Roster) {
  const batter = resolveName(r.event.batterId, homeRoster, awayRoster);
  const outcome = outcomeLabel(r.event.outcome);
  return bi(`${batter.zh} · ${outcome.zh}`, `${batter.en} · ${outcome.en}`);
}

/* ------------------------------------------------------------------ */
/* 輔助：投手使用紀錄                                                    */
/* ------------------------------------------------------------------ */

function buildPitcherUsage(records: PaRecord[], game: Game): GameReview['pitcherUsage'] {
  const usage = new Map<
    string,
    { side: Side; pitches: number; battersFaced: number; outsRecorded: number; lastCumulative: number; lastGlobalPitchIndex: number }
  >();

  records.forEach((r, i) => {
    const side: Side = r.event.offenseCode === game.homeTeamCode ? 'AWAY' : 'HOME';
    const entry = usage.get(r.event.pitcherId) ?? { side, pitches: 0, battersFaced: 0, outsRecorded: 0, lastCumulative: 0, lastGlobalPitchIndex: 0 };
    entry.pitches += r.event.pitchesThrown;
    entry.battersFaced += 1;
    entry.outsRecorded += r.event.outsAfter - r.event.outsBefore;
    entry.lastCumulative = r.event.cumulativePitchCount;
    entry.lastGlobalPitchIndex = i;
    usage.set(r.event.pitcherId, entry);
  });

  const limitConfig = createPitchLimitConfig(game.pitchLimitPreset, true);

  return Array.from(usage.entries()).map(([pitcherId, u]) => {
    const nearLimit = limitConfig.limit !== null && u.lastCumulative >= limitConfig.limit - 2;
    return {
      pitcherId,
      side: u.side,
      pitches: u.pitches,
      battersFaced: u.battersFaced,
      ip: Number((u.outsRecorded / 3).toFixed(1)),
      removedAtPitch: u.lastCumulative,
      removalReason: nearLimit ? ('PITCH_LIMIT' as const) : ('PERFORMANCE' as const),
      mandatoryRestDays: restDaysFor(u.lastCumulative, limitConfig),
    };
  });
}

/* ------------------------------------------------------------------ */
/* 輔助：代跑候選——壘上跑者跟板凳球員的離壘速度差                      */
/* ------------------------------------------------------------------ */

interface PinchRunCandidate {
  benchPlayer: Player;
  incumbentRunner: Player;
  edge: number;
}

/**
 * 壘上有人、且板凳有離壘速度明顯較快的球員時，回傳最值得代跑的組合；
 * 否則回傳 null（沒有跑者、沒有板凳、或速度差不夠明顯）。
 * 門檻 1.0 ft/s 是經驗值，避免每次壘上有人就跳代跑卡。
 */
function findPinchRunCandidate(offenseRoster: Roster, bases: Bases): PinchRunCandidate | null {
  const benchWithSpeed = offenseRoster.bench.filter((p) => p.batting?.sprintSpeed != null);
  if (benchWithSpeed.length === 0) return null;

  const allPlayers = [...offenseRoster.lineup, ...offenseRoster.bench];
  let best: PinchRunCandidate | null = null;

  for (const runnerId of bases) {
    if (!runnerId) continue;
    const incumbentRunner = allPlayers.find((p) => p.id === runnerId);
    const incumbentSpeed = incumbentRunner?.batting?.sprintSpeed;
    if (!incumbentRunner || incumbentSpeed == null) continue;

    for (const benchPlayer of benchWithSpeed) {
      const edge = benchPlayer.batting!.sprintSpeed! - incumbentSpeed;
      if (edge > 1.0 && (!best || edge > best.edge)) {
        best = { benchPlayer, incumbentRunner, edge };
      }
    }
  }

  return best;
}

/* ------------------------------------------------------------------ */
/* 輔助：換投／代打／代跑決策節點                                        */
/* ------------------------------------------------------------------ */

function buildDecisionPoints(records: PaRecord[], homeRoster: Roster, awayRoster: Roster, game: Game): DecisionPoint[] {
  const highLeverage = records
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => isHighLeverage(r.li) && r.event.inning >= 6)
    .sort((a, b) => b.r.li - a.r.li)
    .slice(0, 5);

  const points: DecisionPoint[] = [];

  highLeverage.forEach(({ r, i }, order) => {
    const offenseIsHome = r.event.offenseCode === game.homeTeamCode;
    const offenseRoster = offenseIsHome ? homeRoster : awayRoster;
    const defenseRoster = offenseIsHome ? awayRoster : homeRoster;
    const pinchRunCandidate = findPinchRunCandidate(offenseRoster, r.event.basesBefore);
    const wantsPinchRun = pinchRunCandidate !== null;
    const wantsPinchHit = !wantsPinchRun && order % 2 === 1 && offenseRoster.bench.length > 0;

    const beforePitchId = r.pitches[0].id;
    const state = buildMatchState({
      gameId: game.id,
      inning: r.event.inning,
      half: r.event.half,
      outs: r.event.outsBefore as 0 | 1 | 2 | 3,
      bases: r.event.basesBefore,
      score: r.scoreBefore,
      offense: offenseIsHome ? 'HOME' : 'AWAY',
      batterId: r.event.batterId,
      pitcherId: r.event.pitcherId,
      catcherId: findCatcherId(defenseRoster),
      pitcherPitchCount: r.event.cumulativePitchCount - r.event.pitchesThrown,
      timesThroughOrder: r.event.timesThroughOrder,
    });

    const holdOption: DecisionOption = {
      id: `${game.id}-dp${i}-hold`,
      type: 'HOLD',
      label: bi('維持現狀', 'Hold'),
      detail: bi('不更動打線或投手，按原計畫進行。', 'No substitution — stick with the current plan.'),
      targetPlayerId: null,
      replacedPlayerId: null,
      projectedDeltaWp: 0,
      projectedRe24: 0,
      confidence: null,
    };

    let altOption: DecisionOption;
    let side: Side;

    if (wantsPinchRun && pinchRunCandidate) {
      side = offenseIsHome ? 'HOME' : 'AWAY';
      const { benchPlayer, incumbentRunner, edge } = pinchRunCandidate;
      // 代跑影響的是盜壘/滾地球推進的期望值，不是整個打席的攻擊產能，係數比代打/換投小很多。
      const deltaWp = Number((edge * 0.006).toFixed(3));
      altOption = {
        id: `${game.id}-dp${i}-pinch-runner`,
        type: 'PINCH_RUNNER',
        label: bi(`代跑 ${benchPlayer.name.zh}`, `Pinch run: ${benchPlayer.name.en}`),
        detail: bi(
          `用離壘速度較快的 ${benchPlayer.name.zh} 換下 ${incumbentRunner.name.zh}，提升盜壘與推進期望值。`,
          `Swap in the faster ${benchPlayer.name.en} for ${incumbentRunner.name.en} to improve steal/advancement odds.`,
        ),
        targetPlayerId: benchPlayer.id,
        replacedPlayerId: incumbentRunner.id,
        projectedDeltaWp: deltaWp,
        projectedRe24: Number((deltaWp * 2).toFixed(2)),
        confidence: { low: deltaWp - 0.01, high: deltaWp + 0.01 },
      };
    } else if (wantsPinchHit) {
      side = offenseIsHome ? 'HOME' : 'AWAY';
      const bench = offenseRoster.bench[0];
      const incumbent = [...offenseRoster.lineup, ...offenseRoster.bench].find((p) => p.id === r.event.batterId);
      const benchProfile = buildBatterProfile(bench, { applyEraAdjustment: false, era: offenseRoster.era });
      const incumbentProfile = incumbent ? buildBatterProfile(incumbent, { applyEraAdjustment: false, era: offenseRoster.era }) : null;
      const edge = incumbentProfile ? (benchProfile.offenseIndex - incumbentProfile.offenseIndex) * 0.05 : 0;
      altOption = {
        id: `${game.id}-dp${i}-pinch-hitter`,
        type: 'PINCH_HITTER',
        label: bi(`代打 ${bench.name.zh}`, `Pinch hit: ${bench.name.en}`),
        detail: bi(`用板凳打者 ${bench.name.zh} 代替現在的打者上場。`, `Send bench bat ${bench.name.en} up in place of the current hitter.`),
        targetPlayerId: bench.id,
        replacedPlayerId: r.event.batterId,
        projectedDeltaWp: Number(edge.toFixed(3)),
        projectedRe24: Number((edge * 4).toFixed(2)),
        confidence: { low: edge - 0.02, high: edge + 0.02 },
      };
    } else {
      side = offenseIsHome ? 'AWAY' : 'HOME';
      const nextReliever = defenseRoster.bullpen.find((p) => p.id !== r.event.pitcherId) ?? defenseRoster.closer;
      const incumbentProfile = buildPitcherProfile(
        [...defenseRoster.rotation, ...defenseRoster.bullpen, ...(defenseRoster.closer ? [defenseRoster.closer] : [])].find(
          (p) => p.id === r.event.pitcherId,
        ) ?? defenseRoster.bullpen[0],
        { applyEraAdjustment: false, era: defenseRoster.era },
      );
      const relieverProfile = nextReliever
        ? buildPitcherProfile(nextReliever, { applyEraAdjustment: false, era: defenseRoster.era })
        : incumbentProfile;
      const edge = (relieverProfile.suppressionIndex - incumbentProfile.suppressionIndex) * 0.04;
      altOption = {
        id: `${game.id}-dp${i}-pitching-change`,
        type: 'PITCHING_CHANGE',
        label: bi(`換上 ${nextReliever?.name.zh ?? '牛棚投手'}`, `Bring in ${nextReliever?.name.en ?? 'a reliever'}`),
        detail: bi('提前換投，避免現任投手繼續面對高槓桿打席。', 'Make an early pitching change to avoid a high-leverage at-bat with the current arm.'),
        targetPlayerId: nextReliever?.id ?? null,
        replacedPlayerId: r.event.pitcherId,
        projectedDeltaWp: Number(edge.toFixed(3)),
        projectedRe24: Number((edge * 4).toFixed(2)),
        confidence: { low: edge - 0.02, high: edge + 0.02 },
      };
    }

    const historicalBetter = Math.abs(altOption.projectedDeltaWp) <= 0.002;
    const aiPicksAlt = !historicalBetter && altOption.projectedDeltaWp * (side === 'HOME' ? 1 : -1) > 0;

    points.push({
      id: `${game.id}-dp${i}`,
      gameId: game.id,
      beforePitchId,
      state,
      side,
      triggerReason: ['HIGH_LEVERAGE', 'LATE_INNING'],
      situation: bi(
        `第 ${r.event.inning} 局 ${r.event.half === 'TOP' ? '上' : '下'}，槓桿指數 ${r.li.toFixed(2)}，高張力情境。`,
        `Inning ${r.event.inning} (${r.event.half}), leverage index ${r.li.toFixed(2)} — a high-tension moment.`,
      ),
      options: [holdOption, altOption],
      historical: {
        source: 'HISTORICAL',
        option: holdOption,
        deltaWp: r.wpAfter - r.wpBefore,
        actualResult: bi(`實際結果：${outcomeLabel(r.event.outcome).zh}`, `What actually happened: ${outcomeLabel(r.event.outcome).en}`),
        rationale: bi('這是模擬中實際發生的選擇。', 'This is what the simulation actually did.'),
      },
      aiOptimal: {
        source: 'AI_OPTIMAL',
        option: aiPicksAlt ? altOption : holdOption,
        deltaWp: aiPicksAlt ? altOption.projectedDeltaWp : 0,
        actualResult: null,
        rationale: aiPicksAlt
          ? bi('依球員能力指數推算，更動打線/投手預期能取得較高勝率。', 'Player-index projections favor making the change here.')
          : bi('依球員能力指數推算，維持現狀已是較佳選擇。', 'Player-index projections favor staying put.'),
      },
    });
  });

  return points;
}
