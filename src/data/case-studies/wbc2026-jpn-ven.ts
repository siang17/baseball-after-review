/**
 * 核心示範專題：2026 WBC 日本 vs. 委內瑞拉 戰術復盤
 *
 * ⚠️ 節奏控制／牛棚銜接兩節的球員一律採用 `src/data/rosters` 的真實 2026 名單 id，
 * 但節奏、槓桿、UZR 等數值本身仍是示範情境的虛構數字，僅供版面與計算邏輯驗證。
 * `sources` 一律留空 —— 未經查證的新聞連結不應憑空產生，請於接上真實資料時補齊。
 */

import { bi } from '@/lib/i18n';
import type { BullpenBridgePlan, TempoImpact } from '@/types/baseball';

/** UZR 跨聯盟折算後的建議區間（示範係數 0.78）。 */
export const NPB_DEFENSE_DISCOUNT = 0.78;

/* ------------------------------------------------------------------ */
/* 1. 節奏控制影響（Pitch Timer × PitchCom）                           */
/* ------------------------------------------------------------------ */

export const CASE_TEMPO: TempoImpact[] = [
  {
    pitcherId: '2026-jpn-sp1',
    side: 'HOME',
    avgTempoSec: 16.8,
    avgTempoRunnersOnSec: 19.4,
    rushedPitchRate: 0.24,
    clockViolations: 1,
    pitchComChanges: 11,
    avgAckLatencyMs: 1180,
    malfunctionEvents: 1,
    splits: [
      {
        bucket: 'FAST',
        label: bi('剩餘 ≥ 5 秒出手', 'Released with ≥5s left'),
        pitches: 49,
        whiffPct: 0.298,
        xwoba: 0.271,
        avgVelocity: 95.9,
      },
      {
        bucket: 'SLOW',
        label: bi('剩餘 < 3 秒出手（被逼快）', 'Released with <3s left (rushed)'),
        pitches: 16,
        whiffPct: 0.188,
        xwoba: 0.348,
        avgVelocity: 94.6,
      },
    ],
    note: bi(
      '被計時器逼到剩餘 3 秒內出手的 16 球，揮空率掉 11 個百分點、xwOBA 升 0.077，且平均球速低 1.3 mph。六局上的違規保送就發生在 PitchCom 兩度改訊號之後 —— 節奏損失並非隨機，而是集中在配球猶豫的打席。',
      'The 16 pitches released inside the final three seconds lost 11 points of whiff rate, gave up 0.077 more xwOBA, and came in 1.3 mph slower. The violation walk in the top of the 6th followed two PitchCom changes — the tempo cost is not random noise, it clusters in at-bats where the battery hesitated.',
    ),
  },
  {
    pitcherId: '2026-ven-sp1',
    side: 'AWAY',
    avgTempoSec: 14.2,
    avgTempoRunnersOnSec: 17.1,
    rushedPitchRate: 0.09,
    clockViolations: 0,
    pitchComChanges: 4,
    avgAckLatencyMs: 640,
    malfunctionEvents: 0,
    splits: [
      {
        bucket: 'FAST',
        label: bi('剩餘 ≥ 5 秒出手', 'Released with ≥5s left'),
        pitches: 57,
        whiffPct: 0.246,
        xwoba: 0.302,
        avgVelocity: 95.1,
      },
      {
        bucket: 'SLOW',
        label: bi('剩餘 < 3 秒出手（被逼快）', 'Released with <3s left (rushed)'),
        pitches: 6,
        whiffPct: 0.167,
        xwoba: 0.361,
        avgVelocity: 94.4,
      },
    ],
    note: bi(
      '節奏控制明顯較穩，PitchCom 僅改訊號 4 次、無故障。但這也意味著七局下的失投不能歸因於節奏 —— 它是用球數與第三輪打序的結果，是純粹的調度問題。',
      'Far steadier tempo: only four PitchCom changes and no faults. That also means the 7th-inning mistake pitch cannot be blamed on rhythm — it was a function of pitch count and the third time through the order, which makes it purely a managerial issue.',
    ),
  },
];

/* ------------------------------------------------------------------ */
/* 2. 牛棚銜接檢討（65 球限制）                                        */
/* ------------------------------------------------------------------ */

export const CASE_BULLPEN: BullpenBridgePlan[] = [
  {
    side: 'AWAY',
    legs: [
      {
        pitcherId: '2026-ven-sp1',
        fromInning: 1,
        toInning: 6.2,
        pitches: 63,
        battersFaced: 24,
        runsAllowed: 4,
        avgLeverageIndex: 1.31,
        restDaysIncurred: 4,
        deltaWp: -0.221,
        removalReason: 'PERFORMANCE',
      },
    ],
    alternative: {
      label: bi(
        '七局下開局即換上左投，先發止步於 52 球',
        'Go to the lefty to start the bottom of the 7th; cap the starter at 52 pitches',
      ),
      rationale: bi(
        '52 球退場同樣落在「50 球以上休 4 天」的級距，休息代價完全相同，卻避開了第三輪打序與 LI 3.41 的高槓桿情境。模擬顯示勝率可提升約 8.4 個百分點。',
        'Pulling him at 52 pitches lands in the same "50+ pitches → 4 days rest" tier, so the rest cost is identical — but it skips the third time through the order at an LI of 3.41. The simulation projects a gain of roughly 8.4 percentage points of win probability.',
      ),
      projectedDeltaWp: 0.084,
    },
    nextGameImpact: bi(
      '無論 52 球或 63 球退場，該先發都需休息 4 天，下一輪無法登板 —— 續投的 11 球等於零邊際成本、卻承擔了全場最高的邊際風險。',
      'At either 52 or 63 pitches the starter owes four days of rest and misses the next round. Those extra 11 pitches carried zero marginal cost in availability — and the highest marginal risk of the game.',
    ),
    note: bi(
      '委內瑞拉的問題不是「用球數超標」，而是「休息級距的錯覺」：教練團把 65 球視為可用額度，忽略了 50 球以上休息天數已經觸頂，續投的保留價值其實是零。',
      'Venezuela\'s problem was not exceeding the limit — it was misreading the rest tiers. The staff treated 65 pitches as budget to spend, missing that past 50 pitches the rest penalty is already maxed out, so there was nothing left to preserve.',
    ),
  },
  {
    side: 'HOME',
    legs: [
      {
        pitcherId: '2026-jpn-sp1',
        fromInning: 1,
        toInning: 6.0,
        pitches: 65,
        battersFaced: 22,
        runsAllowed: 3,
        avgLeverageIndex: 1.18,
        restDaysIncurred: 4,
        deltaWp: 0.062,
        removalReason: 'PITCH_LIMIT',
      },
      {
        pitcherId: '2026-jpn-cl1',
        fromInning: 8.0,
        toInning: 9.0,
        pitches: 18,
        battersFaced: 5,
        runsAllowed: 0,
        avgLeverageIndex: 2.64,
        restDaysIncurred: 0,
        deltaWp: 0.113,
        removalReason: 'END_OF_GAME',
      },
    ],
    alternative: null,
    nextGameImpact: bi(
      '終結者 18 球未達 30 球門檻，無強制休息，下一場仍可續用；先發則休息 4 天。牛棚深度在下一輪維持完整。',
      'The closer\'s 18 pitches fall under the 30-pitch threshold, so no mandatory rest — he stays available for the next game. The starter takes four days. Bullpen depth going into the next round stays intact.',
    ),
    note: bi(
      '日本隊的先發正好投滿 65 球被強制退場，銜接得以按計畫執行；七、八局的高槓桿段落由最佳戰力承擔（平均 LI 2.64），與委內瑞拉的處理形成直接對照。',
      'Japan\'s starter hit the 65-pitch wall exactly on schedule, so the planned bridge ran as designed, and the highest-leverage stretch (average LI 2.64) went to their best arm — the direct counterpoint to how Venezuela handled the same constraint.',
    ),
  },
];

/* ------------------------------------------------------------------ */
/* 專題章節目錄                                                        */
/* ------------------------------------------------------------------ */

export const CASE_SECTIONS = [
  { id: 'gameflow', label: bi('比賽過程', 'Game Flow') },
  { id: 'snubs', label: bi('球員遺珠評估', 'Roster Snubs') },
  { id: 'defense', label: bi('日本隊守備論證', 'Japan Defense Argument') },
  { id: 'crucial', label: bi('最關鍵 Play 與調度', 'Crucial Play & Call') },
  { id: 'tempo', label: bi('節奏控制影響', 'Tempo Control') },
  { id: 'bullpen', label: bi('65 球與牛棚銜接', '65 Pitches & the Bridge') },
  { id: 'interactive', label: bi('總教練模式體驗', 'Manager Mode & Sim') },
] as const;
