/**
 * 單場比賽模擬：以打席為最小單位推進，含壘包推進、用球數限制與牛棚調度。
 *
 * 刻意保留的規則細節（因為它們正是 BAR 想討論的東西）：
 *  - 用球數上限：達標的投手可投完當前打者，之後強制退場。
 *  - TTOP：同一投手第 N 次面對同一輪打者的壓制力衰退。
 *  - 疲勞：用球數推升的球速衰退轉為壓制力折減。
 *  - 提前結束比賽（run rule）與延長賽突破僵局制。
 */

import type { Era, HalfInning, TeamCode } from '@/types/baseball';
import { ttopPenalty } from '@/lib/sabermetrics';
import { gaussian, sampleIndex } from './random';
import {
  OUTCOMES,
  plateAppearanceProbs,
  type BatterProfile,
  type Outcome,
  type PitcherProfile,
} from './ratings';

/* ------------------------------------------------------------------ */
/* 輸入結構                                                            */
/* ------------------------------------------------------------------ */

export interface SimTeam {
  code: TeamCode;
  era: Era;
  /** 先發打序 9 人。 */
  lineup: BatterProfile[];
  /** 投手使用順序：先發 → 中繼 → 終結者（最後一位）。 */
  pitchers: PitcherProfile[];
}

export interface GameSimOptions {
  /** 用球數上限；null 為無限制。 */
  pitchLimit: number | null;
  /** 主隊進攻乘數（中立球場為 1）。 */
  homeBoost: number;
  /** 延長賽突破僵局制（10 局起二壘有人）。 */
  extraInningRunner: boolean;
  /** 提前結束比賽規則。 */
  mercyRule: boolean;
  /** 最多延長到第幾局，避免極端情況下無限迴圈。 */
  maxInnings: number;
}

export const DEFAULT_SIM_OPTIONS: GameSimOptions = {
  pitchLimit: 65,
  homeBoost: 1,
  extraInningRunner: true,
  mercyRule: true,
  maxInnings: 15,
};

/* ------------------------------------------------------------------ */
/* 輸出結構                                                            */
/* ------------------------------------------------------------------ */

export interface GameResult {
  homeScore: number;
  awayScore: number;
  innings: number;
  /** 每個半局結束時的比分，用於彙總勝率曲線。 */
  timeline: Array<{ inning: number; half: HalfInning; home: number; away: number }>;
  /** 先發投手的用球數。 */
  starterPitches: { home: number; away: number };
  /** 因達用球數上限而被迫換投的次數。 */
  limitForcedChanges: { home: number; away: number };
  /** 使用的投手人次。 */
  pitchersUsed: { home: number; away: number };
  endedByMercy: boolean;
}

/* ------------------------------------------------------------------ */
/* 每支球隊的比賽中狀態                                                */
/* ------------------------------------------------------------------ */

interface TeamGameState {
  team: SimTeam;
  lineupIndex: number;
  pitcherIndex: number;
  /** 現任投手的用球數。 */
  pitchCount: number;
  /** 現任投手面對過的打者數（用於 TTOP）。 */
  battersFacedByCurrent: number;
  /** 現任投手的失分。 */
  runsByCurrent: number;
  starterPitches: number;
  limitForcedChanges: number;
  pitchersUsed: number;
}

function initTeamState(team: SimTeam): TeamGameState {
  return {
    team,
    lineupIndex: 0,
    pitcherIndex: 0,
    pitchCount: 0,
    battersFacedByCurrent: 0,
    runsByCurrent: 0,
    starterPitches: 0,
    limitForcedChanges: 0,
    pitchersUsed: 1,
  };
}

/* ------------------------------------------------------------------ */
/* 用球數模型                                                          */
/* ------------------------------------------------------------------ */

/** 各結果的平均用球數 —— 三振與保送最耗球，全壘打與安打通常較早出現。 */
const PITCHES_BY_OUTCOME: Record<Outcome, number> = {
  K: 4.8,
  BB: 5.3,
  HR: 3.9,
  TRIPLE: 3.6,
  DOUBLE: 3.6,
  SINGLE: 3.5,
  OUT: 3.6,
};

function pitchesFor(outcome: Outcome, rand: () => number): number {
  return Math.max(1, Math.round(gaussian(rand, PITCHES_BY_OUTCOME[outcome], 1.2)));
}

/* ------------------------------------------------------------------ */
/* 壘包推進                                                            */
/* ------------------------------------------------------------------ */

/** 壘包：[一壘, 二壘, 三壘]，1 = 有人。 */
type Bases = [number, number, number];

interface AdvanceResult {
  runs: number;
  outs: number;
}

/**
 * 依打席結果推進壘包。
 * 額外進壘（一安上二壘、二安回本壘）帶有機率，並受打者速度微調。
 */
function applyOutcome(
  bases: Bases,
  outs: number,
  outcome: Outcome,
  speed: number,
  rand: () => number,
): AdvanceResult {
  let runs = 0;
  let newOuts = outs;
  // 速度修正：以 27 ft/s 為基準，每快 1 ft/s 額外進壘機率 +4%。
  const speedEdge = (speed - 27) * 0.04;

  switch (outcome) {
    case 'BB': {
      // 只有被擠壓時才推進。
      if (!bases[0]) bases[0] = 1;
      else if (!bases[1]) bases[1] = 1;
      else if (!bases[2]) bases[2] = 1;
      else runs += 1; // 滿壘保送擠回一分
      break;
    }

    case 'SINGLE': {
      if (bases[2]) {
        runs += 1;
        bases[2] = 0;
      }
      if (bases[1]) {
        // 二壘跑者是否回本壘
        if (rand() < 0.55 + speedEdge) runs += 1;
        else bases[2] = 1;
        bases[1] = 0;
      }
      if (bases[0]) {
        // 一壘跑者上三壘（若三壘已被佔用則只能到二壘）
        if (!bases[2] && rand() < 0.28 + speedEdge) bases[2] = 1;
        else bases[1] = 1;
        bases[0] = 0;
      }
      bases[0] = 1;
      break;
    }

    case 'DOUBLE': {
      runs += bases[1] + bases[2];
      bases[1] = 0;
      bases[2] = 0;
      if (bases[0]) {
        if (rand() < 0.45 + speedEdge) runs += 1;
        else bases[2] = 1;
        bases[0] = 0;
      }
      bases[1] = 1;
      break;
    }

    case 'TRIPLE': {
      runs += bases[0] + bases[1] + bases[2];
      bases[0] = 0;
      bases[1] = 0;
      bases[2] = 1;
      break;
    }

    case 'HR': {
      runs += 1 + bases[0] + bases[1] + bases[2];
      bases[0] = 0;
      bases[1] = 0;
      bases[2] = 0;
      break;
    }

    case 'K': {
      newOuts += 1;
      break;
    }

    case 'OUT': {
      // 雙殺：一壘有人且不滿兩出局
      const dpChance = Math.max(0.04, 0.13 - speedEdge);
      if (newOuts < 2 && bases[0] && rand() < dpChance) {
        newOuts += 2;
        bases[0] = 0;
        // 二壘跑者常趁機推進
        if (bases[1] && rand() < 0.4) {
          bases[1] = 0;
          bases[2] = 1;
        }
      } else {
        newOuts += 1;
        if (newOuts < 3 && bases[2] && rand() < 0.32) {
          // 高飛犧牲打
          runs += 1;
          bases[2] = 0;
        } else if (newOuts < 3 && bases[0] && !bases[1] && rand() < 0.25) {
          // 滾地推進
          bases[0] = 0;
          bases[1] = 1;
        }
      }
      break;
    }
  }

  return { runs, outs: newOuts };
}

/* ------------------------------------------------------------------ */
/* 投手調度                                                            */
/* ------------------------------------------------------------------ */

/** 疲勞折減：以球速衰退為代理，換算成壓制力損失（0–1）。 */
function fatigueOf(state: TeamGameState): number {
  const p = state.team.pitchers[state.pitcherIndex];
  const veloLost = (state.pitchCount / 25) * p.velocityDeclinePer25;
  // 每損失 1 mph 約等於 3.5% 的壓制力折減。
  return Math.min(0.35, veloLost * 0.035);
}

/**
 * 是否換投。
 *
 * 優先序：
 *  1. 用球數達上限（強制，WBC 規則）。
 *  2. 第九局（或延長）換上終結者。
 *  3. 先發進入第三輪打序且已過六局，或失分過多。
 *  4. 中繼投手投滿一局以上且用球數偏高。
 */
function shouldChangePitcher(
  state: TeamGameState,
  opts: GameSimOptions,
  inning: number,
  atInningBoundary: boolean,
): { change: boolean; forcedByLimit: boolean; toCloser: boolean } {
  const lastIndex = state.team.pitchers.length - 1;
  const hasNext = state.pitcherIndex < lastIndex;
  if (!hasNext) return { change: false, forcedByLimit: false, toCloser: false };

  if (opts.pitchLimit !== null && state.pitchCount >= opts.pitchLimit) {
    return { change: true, forcedByLimit: true, toCloser: false };
  }

  if (!atInningBoundary) return { change: false, forcedByLimit: false, toCloser: false };

  const current = state.team.pitchers[state.pitcherIndex];
  const timesThrough = Math.floor(state.battersFacedByCurrent / 9) + 1;

  // 九局起直接跳到名單最後一位（終結者），而不是往下一棒中繼順推。
  if (inning >= 9) {
    return { change: true, forcedByLimit: false, toCloser: true };
  }

  if (current.role === 'SP') {
    if (timesThrough >= 3 && inning >= 6) return { change: true, forcedByLimit: false, toCloser: false };
    if (state.runsByCurrent >= 4) return { change: true, forcedByLimit: false, toCloser: false };
  } else {
    if (state.pitchCount >= 28 || state.battersFacedByCurrent >= 7) {
      return { change: true, forcedByLimit: false, toCloser: false };
    }
  }

  return { change: false, forcedByLimit: false, toCloser: false };
}

/**
 * 換投。`toCloser` 為真時直接跳到名單最後一位，中間的中繼視為未登板。
 * 名單見底時只能續投現任投手 —— 這是刻意保留的懲罰：
 * 過緊的用球數上限會把牛棚榨乾，並在深度不足時付出代價。
 */
function changePitcher(state: TeamGameState, forcedByLimit: boolean, toCloser = false): void {
  const lastIndex = state.team.pitchers.length - 1;
  if (state.pitcherIndex >= lastIndex) return;

  if (state.pitcherIndex === 0) state.starterPitches = state.pitchCount;
  if (forcedByLimit) state.limitForcedChanges += 1;
  state.pitcherIndex = toCloser ? lastIndex : state.pitcherIndex + 1;
  state.pitchCount = 0;
  state.battersFacedByCurrent = 0;
  state.runsByCurrent = 0;
  state.pitchersUsed += 1;
}

/* ------------------------------------------------------------------ */
/* 半局模擬                                                            */
/* ------------------------------------------------------------------ */

function simulateHalfInning(
  offense: TeamGameState,
  defense: TeamGameState,
  opts: GameSimOptions,
  inning: number,
  isHomeOffense: boolean,
  /** 領先方需要的分數上限：主隊再見安打時提前結束。 */
  walkOffTarget: number | null,
  rand: () => number,
): number {
  let outs = 0;
  let runs = 0;
  const bases: Bases = [0, 0, 0];

  // 延長賽突破僵局制：二壘先放一名跑者。
  if (opts.extraInningRunner && inning > 9) bases[1] = 1;

  while (outs < 3) {
    const batter = offense.team.lineup[offense.lineupIndex % 9];
    const pitcher = defense.team.pitchers[defense.pitcherIndex];

    const timesThrough = Math.floor(defense.battersFacedByCurrent / 9) + 1;
    const probs = plateAppearanceProbs(batter, pitcher, {
      ttopPenalty: ttopPenalty(timesThrough),
      fatigue: fatigueOf(defense),
      homeBoost: isHomeOffense ? opts.homeBoost : 1,
    });

    const outcome = OUTCOMES[sampleIndex(probs, rand)];

    // 用球數與打者數先累計，因為達上限的投手可投完當前打者。
    defense.pitchCount += pitchesFor(outcome, rand);
    defense.battersFacedByCurrent += 1;
    offense.lineupIndex += 1;

    const applied = applyOutcome(bases, outs, outcome, batter.speed, rand);
    outs = applied.outs;
    runs += applied.runs;
    defense.runsByCurrent += applied.runs;

    // 再見分：主隊在九局下（含延長）超前即結束。
    if (walkOffTarget !== null && runs >= walkOffTarget) return runs;

    if (outs < 3) {
      const decision = shouldChangePitcher(defense, opts, inning, false);
      if (decision.change) changePitcher(defense, decision.forcedByLimit, decision.toCloser);
    }
  }

  return runs;
}

/* ------------------------------------------------------------------ */
/* 全場模擬                                                            */
/* ------------------------------------------------------------------ */

/** 提前結束比賽規則（WBC）：5 局後領先 15 分、7 局後領先 10 分。 */
function mercyReached(inning: number, home: number, away: number): boolean {
  const lead = Math.abs(home - away);
  if (inning >= 7 && lead >= 10) return true;
  if (inning >= 5 && lead >= 15) return true;
  return false;
}

export function simulateGame(
  home: SimTeam,
  away: SimTeam,
  opts: GameSimOptions,
  rand: () => number,
): GameResult {
  const homeState = initTeamState(home);
  const awayState = initTeamState(away);

  let homeScore = 0;
  let awayScore = 0;
  let endedByMercy = false;
  const timeline: GameResult['timeline'] = [];

  let inning = 1;
  for (; inning <= opts.maxInnings; inning++) {
    // ---- 上半局：客隊進攻 ----
    awayScore += simulateHalfInning(awayState, homeState, opts, inning, false, null, rand);
    timeline.push({ inning, half: 'TOP', home: homeScore, away: awayScore });

    if (opts.mercyRule && mercyReached(inning, homeScore, awayScore)) {
      endedByMercy = true;
      break;
    }

    // 九局上結束後主隊已領先 → 不需再打下半局。
    if (inning >= 9 && homeScore > awayScore) break;

    // ---- 下半局：主隊進攻 ----
    // 九局下（含延長）只要超前就結束（再見）。
    const walkOff = inning >= 9 ? Math.max(1, awayScore - homeScore + 1) : null;
    homeScore += simulateHalfInning(homeState, awayState, opts, inning, true, walkOff, rand);
    timeline.push({ inning, half: 'BOTTOM', home: homeScore, away: awayScore });

    if (opts.mercyRule && mercyReached(inning, homeScore, awayScore)) {
      endedByMercy = true;
      break;
    }

    if (inning >= 9 && homeScore !== awayScore) break;

    // 局間換投判斷
    for (const state of [homeState, awayState]) {
      const decision = shouldChangePitcher(state, opts, inning + 1, true);
      if (decision.change) changePitcher(state, decision.forcedByLimit, decision.toCloser);
    }
  }

  // 先發若未被換下，補記用球數。
  if (homeState.pitcherIndex === 0) homeState.starterPitches = homeState.pitchCount;
  if (awayState.pitcherIndex === 0) awayState.starterPitches = awayState.pitchCount;

  return {
    homeScore,
    awayScore,
    innings: Math.min(inning, opts.maxInnings),
    timeline,
    starterPitches: { home: homeState.starterPitches, away: awayState.starterPitches },
    limitForcedChanges: {
      home: homeState.limitForcedChanges,
      away: awayState.limitForcedChanges,
    },
    pitchersUsed: { home: homeState.pitchersUsed, away: awayState.pitchersUsed },
    endedByMercy,
  };
}
