/**
 * 簡化版賽伯計量學核心：RE24 / Win Expectancy / Leverage Index。
 *
 * ⚠️ 說明：
 *  - RE24 使用公開的 base-out run expectancy 矩陣（2010s MLB 平均），
 *    國際賽得分環境較低，可透過 `RUN_ENV_FACTOR` 縮放。
 *  - Win Expectancy 採用常態近似（剩餘得分視為 Poisson→Normal），
 *    非查表法，屬於「可解釋的近似值」而不是官方 WE 表。
 *    若日後接上真實 WE table，只需替換 `winExpectancy()` 實作。
 */

import type { BaseCode, BaseState, MatchState, Side } from '@/types/baseball';
import { clamp } from './utils';

/** 國際賽得分環境相對 MLB 的縮放係數。 */
export const RUN_ENV_FACTOR = 0.92;

/** base-out run expectancy：[outs][baseCode]。 */
const RE_MATRIX: Record<BaseCode, [number, number, number]> = {
  //          0 out   1 out   2 out
  '___': [0.481, 0.254, 0.098],
  '1__': [0.859, 0.509, 0.224],
  '_2_': [1.1, 0.664, 0.319],
  '__3': [1.35, 0.95, 0.353],
  '12_': [1.437, 0.884, 0.429],
  '1_3': [1.784, 1.13, 0.478],
  '_23': [1.964, 1.376, 0.58],
  '123': [2.292, 1.541, 0.752],
};

export function baseCode(bases: BaseState): BaseCode {
  const [b1, b2, b3] = bases.map((r) => (r ? 1 : 0));
  const key = `${b1 ? '1' : '_'}${b2 ? '2' : '_'}${b3 ? '3' : '_'}` as BaseCode;
  return key;
}

/** 目前壘包／出局數下的期望得分。 */
export function runExpectancy(bases: BaseState, outs: number): number {
  if (outs >= 3) return 0;
  return RE_MATRIX[baseCode(bases)][outs] * RUN_ENV_FACTOR;
}

/**
 * RE24 = (轉換後 RE − 轉換前 RE) + 本次打席實際得分。
 */
export function re24(
  before: { bases: BaseState; outs: number },
  after: { bases: BaseState; outs: number },
  runsScored: number,
): number {
  return (
    runExpectancy(after.bases, after.outs) -
    runExpectancy(before.bases, before.outs) +
    runsScored
  );
}

/** 標準常態 CDF（Abramowitz & Stegun 近似）。 */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/** 一局的平均得分（單方）。 */
const RUNS_PER_INNING = 0.48 * RUN_ENV_FACTOR;

/**
 * 主隊勝率近似值。
 *
 * 思路：把「剩餘比賽」視為兩隊各自的隨機得分，其差值近似常態；
 * 再把目前壘包／出局的期望得分加進當前半局的進攻方。
 */
export function winExpectancy(state: MatchState): number {
  const { inning, half, outs, score } = state;

  // 剩餘完整局數（雙方各自）。
  const inningsPlayed = inning - 1 + (half === 'BOTTOM' ? 0.5 : 0);
  const regulation = 9;
  const remainingHome = Math.max(0, regulation - Math.ceil(inningsPlayed));
  const remainingAway = Math.max(0, regulation - Math.floor(inningsPlayed));

  // 當前半局尚未實現的期望得分歸給進攻方。
  const inProgress = outs >= 3 ? 0 : runExpectancy(state.bases, outs);
  const offenseIsHome = state.offense === 'HOME';

  const muHome = remainingHome * RUNS_PER_INNING + (offenseIsHome ? inProgress : 0);
  const muAway = remainingAway * RUNS_PER_INNING + (offenseIsHome ? 0 : inProgress);

  const diffMean = score.home - score.away + muHome - muAway;
  // 得分變異近似 Poisson：var ≈ mean，兩隊相加；最低值避免除以 0。
  const variance = Math.max(0.35, muHome + muAway);
  const sd = Math.sqrt(variance);

  // 主隊只需領先（同分進延長 → 視為各半）。
  const pWin = 1 - normalCdf((0.5 - diffMean) / sd);
  const pTie = normalCdf((0.5 - diffMean) / sd) - normalCdf((-0.5 - diffMean) / sd);

  return clamp(pWin + pTie * 0.5, 0.001, 0.999);
}

/**
 * 槓桿指數 (Leverage Index)。
 *
 * 定義：本打席各種可能結果造成的 |ΔWP| 期望值，除以整場比賽的平均值。
 * 這裡用一組代表性結果（三振／保送／一安／長打／雙殺）加權估算。
 */
const OUTCOME_WEIGHTS: Array<{ runs: number; outs: number; p: number }> = [
  { runs: 0, outs: 1, p: 0.62 }, // 出局
  { runs: 0, outs: 0, p: 0.09 }, // 保送
  { runs: 0.35, outs: 0, p: 0.2 }, // 一安
  { runs: 1.4, outs: 0, p: 0.06 }, // 長打
  { runs: 0, outs: 2, p: 0.03 }, // 雙殺
];

/** 整場平均 |ΔWP|，作為 LI 的分母（經驗值）。 */
const AVERAGE_SWING = 0.032;

export function leverageIndex(state: MatchState): number {
  const base = winExpectancy(state);
  const offenseIsHome = state.offense === 'HOME';

  let expectedSwing = 0;
  for (const outcome of OUTCOME_WEIGHTS) {
    const outs = Math.min(3, state.outs + outcome.outs) as MatchState['outs'];
    const runs = outcome.runs;
    const next: MatchState = {
      ...state,
      outs,
      score: {
        home: state.score.home + (offenseIsHome ? runs : 0),
        away: state.score.away + (offenseIsHome ? 0 : runs),
      },
    };
    expectedSwing += outcome.p * Math.abs(winExpectancy(next) - base);
  }

  return Number((expectedSwing / AVERAGE_SWING).toFixed(2));
}

/** 是否為高槓桿情境（FanGraphs 定義：LI ≥ 1.5）。 */
export function isHighLeverage(li: number): boolean {
  return li >= 1.5;
}

/**
 * TTOP 懲罰：投手第 N 次面對同一輪打者的 wOBA 增幅（經驗值）。
 * 第 2 輪 +0.008、第 3 輪 +0.020、第 4 輪以上 +0.031。
 */
export function ttopPenalty(timesThroughOrder: number): number {
  if (timesThroughOrder <= 1) return 0;
  if (timesThroughOrder === 2) return 0.008;
  if (timesThroughOrder === 3) return 0.02;
  return 0.031;
}

/**
 * 用球數導致的球速衰退（mph），線性近似。
 * `declinePer25` 由球員數據提供，缺值時用聯盟平均 0.35 mph / 25 球。
 */
export function velocityAfterPitches(
  baseVelocity: number,
  pitchCount: number,
  declinePer25: number | null,
): number {
  const rate = declinePer25 ?? 0.35;
  return baseVelocity - (pitchCount / 25) * rate;
}

/** 由 ΔWP 推導警報等級。 */
export function severityFromSwing(deltaWp: number): 'INFO' | 'WARNING' | 'CRITICAL' {
  const swing = Math.abs(deltaWp);
  if (swing >= 0.2) return 'CRITICAL';
  if (swing >= 0.1) return 'WARNING';
  return 'INFO';
}

/** 從一串勝率點中找出位移最大的一點。 */
export function findLargestSwing<T extends { home: number }>(
  points: T[],
): { index: number; delta: number } | null {
  if (points.length < 2) return null;
  let best = { index: 1, delta: 0 };
  for (let i = 1; i < points.length; i++) {
    const delta = points[i].home - points[i - 1].home;
    if (Math.abs(delta) > Math.abs(best.delta)) best = { index: i, delta };
  }
  return best.delta === 0 ? null : best;
}

/** 主隊視角的 ΔWP 轉換成「執掌方視角」。 */
export function deltaForSide(deltaHome: number, side: Side): number {
  return side === 'HOME' ? deltaHome : -deltaHome;
}
