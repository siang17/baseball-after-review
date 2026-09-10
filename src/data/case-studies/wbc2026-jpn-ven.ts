/**
 * 核心示範專題：2026 WBC 日本 vs. 委內瑞拉 戰術復盤
 *
 * ⚠️ 全部為示範資料 (PLACEHOLDER)
 * 球員一律採用「示範 XX」的代稱，數值為虛構，僅供版面與計算邏輯驗證。
 * `sources` 一律留空 —— 未經查證的新聞連結不應憑空產生，請於接上真實資料時補齊。
 */

import { bi } from '@/lib/i18n';
import type {
  BullpenBridgePlan,
  Player,
  Position,
  RosterSnub,
  TeamCode,
  TempoImpact,
} from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 建構工具                                                            */
/* ------------------------------------------------------------------ */

interface DefenderSpec {
  id: string;
  zh: string;
  en: string;
  jersey: number;
  order: number;
  position: Position;
  club: [string, string];
  uzr: number;
  uzr150: number;
  rngR: number;
  errR: number;
  armR: number;
  dpr: number;
  drs: number;
  oaa: number;
  innings: number;
  attendance: number;
  wrcPlus: number;
  scouting: [string, string];
}

function defender(spec: DefenderSpec, teamCode: TeamCode = 'JPN'): Player {
  return {
    id: spec.id,
    era: 2026,
    teamCode,
    name: bi(spec.zh, spec.en),
    jersey: spec.jersey,
    positions: [spec.position],
    pitcherRole: null,
    bats: 'R',
    throws: 'R',
    age: null,
    heightCm: null,
    weightKg: null,
    club: bi(spec.club[0], spec.club[1]),
    leagueOrigin: 'NPB',
    rosterClass: 'STARTER',
    battingOrder: spec.order,
    batting: {
      g: 0, pa: 0, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0, so: 0,
      avg: 0, obp: 0, slg: 0, ops: 0,
      wrcPlus: spec.wrcPlus,
      opsPlus: spec.wrcPlus,
      war: null,
      whiffPct: null,
      exitVelocity: null,
      sprintSpeed: null,
    },
    pitching: null,
    fielding: {
      primaryPosition: spec.position,
      innings: spec.innings,
      uzr: spec.uzr,
      uzr150: spec.uzr150,
      uzrComponents: {
        rngR: spec.rngR,
        errR: spec.errR,
        armR: spec.armR,
        dpr: spec.dpr,
      },
      drs: spec.drs,
      oaa: spec.oaa,
      fieldingPct: null,
      attendanceRate: spec.attendance,
    },
    adjustment: {
      sourceLeague: 'NPB',
      offenseFactor: 0.9,
      pitchingFactor: 0.95,
      note: bi(
        'NPB → MLB 尺度校正（示範係數）。守備分項另受 NPB 球場尺寸與打球分布影響，需以逐球落點資料重算。',
        'NPB → MLB scale adjustment (placeholder factors). Fielding components also need recomputing from batted-ball locations because NPB park dimensions differ.',
      ),
    },
    boardingPass: {
      gate: 'C',
      seat: `${spec.order}-${spec.position}`,
      cabin: bi('—', '—'),
      flightNo: 'WBC 026',
      barcodeSeed: spec.id,
    },
    scoutingNote: bi(spec.scouting[0], spec.scouting[1]),
    photoUrl: null,
  };
}

/* ------------------------------------------------------------------ */
/* 1. 日本隊守備核心（NPB 校正論證）                                   */
/* ------------------------------------------------------------------ */

export const CASE_JPN_DEFENDERS: Player[] = [
  defender({
    id: 'case-jpn-ss',
    zh: '示範 游擊手 A',
    en: 'Demo Shortstop A',
    jersey: 4,
    order: 2,
    position: 'SS',
    club: ['示範 NPB 球團', 'Demo NPB Club'],
    uzr: 12.4,
    uzr150: 15.8,
    rngR: 9.1,
    errR: 1.4,
    armR: 0.6,
    dpr: 1.3,
    drs: 14,
    oaa: 11,
    innings: 1180,
    attendance: 0.93,
    wrcPlus: 124,
    scouting: [
      '守備範圍分項（RngR +9.1）貢獻了整體 UZR 的七成三，代表價值來自「接到別人接不到的球」，而非低失誤率的假象。這類型的守備價值在跨聯盟時衰減較小。',
      'Range runs (+9.1) account for 73% of his total UZR — the value comes from converting balls others do not reach, not from a low error rate. That profile travels across leagues better than error-avoidance value.',
    ],
  }),
  defender({
    id: 'case-jpn-cf',
    zh: '示範 中堅手 B',
    en: 'Demo Center Fielder B',
    jersey: 51,
    order: 1,
    position: 'CF',
    club: ['示範 NPB 球團', 'Demo NPB Club'],
    uzr: 8.6,
    uzr150: 11.2,
    rngR: 7.8,
    errR: 0.3,
    armR: 0.9,
    dpr: 0,
    drs: 9,
    oaa: 8,
    innings: 1150,
    attendance: 0.96,
    wrcPlus: 158,
    scouting: [
      'NPB 中外野平均守備距離較 MLB 短，UZR 的機會樣本結構不同；以每 150 場換算後仍有 +11.2，但跨聯盟折算後建議視為 +7 至 +9 區間。',
      'NPB center field plays shallower than MLB, so the opportunity mix behind UZR differs. The +11.2 per 150 games likely translates to a +7 to +9 range once league context is applied.',
    ],
  }),
  defender({
    id: 'case-jpn-3b',
    zh: '示範 三壘手 C',
    en: 'Demo Third Baseman C',
    jersey: 8,
    order: 5,
    position: '3B',
    club: ['示範 NPB 球團', 'Demo NPB Club'],
    uzr: 3.1,
    uzr150: 4.4,
    rngR: 0.8,
    errR: 2.1,
    armR: 0.2,
    dpr: 0,
    drs: 2,
    oaa: 1,
    innings: 1060,
    attendance: 0.88,
    wrcPlus: 111,
    scouting: [
      '整體 UZR 為正，但分項顯示價值主要來自低失誤（ErrR +2.1）而非範圍（RngR +0.8）。面對 MLB 等級的擊球初速，這種組成最容易失真，是本隊守備佈陣的風險點。',
      'His UZR is positive, but the split shows it comes from avoiding errors (+2.1) rather than range (+0.8). That composition is the most fragile against MLB-level exit velocities and is this roster\'s defensive risk point.',
    ],
  }),
];

/** UZR 跨聯盟折算後的建議區間（示範係數 0.78）。 */
export const NPB_DEFENSE_DISCOUNT = 0.78;

/* ------------------------------------------------------------------ */
/* 2. 球員遺珠評估                                                     */
/* ------------------------------------------------------------------ */

function snubPlayer(
  id: string,
  zh: string,
  en: string,
  jersey: number,
  position: Position,
  teamCode: TeamCode,
): Player {
  return {
    id,
    era: 2026,
    teamCode,
    name: bi(zh, en),
    jersey,
    positions: [position],
    pitcherRole: position === 'P' ? 'RP' : null,
    bats: 'R',
    throws: 'R',
    age: null,
    heightCm: null,
    weightKg: null,
    club: bi('示範所屬球團', 'Demo Club'),
    leagueOrigin: teamCode === 'JPN' ? 'NPB' : 'MLB',
    rosterClass: 'SNUB',
    battingOrder: null,
    batting: null,
    pitching: null,
    fielding: null,
    adjustment: null,
    boardingPass: {
      gate: teamCode === 'JPN' ? 'C' : 'A',
      seat: 'STBY',
      cabin: bi('—', '—'),
      flightNo: 'WBC 026',
      barcodeSeed: id,
    },
    scoutingNote: null,
    photoUrl: null,
  };
}

export const CASE_SNUBS: RosterSnub[] = [
  {
    player: snubPlayer('snub-jpn-2b', '示範 二壘手 X', 'Demo Second Baseman X', 37, '2B', 'JPN'),
    comparedToPlayerId: 'case-jpn-3b',
    argument: bi(
      '守備分項全面領先入選的三壘手 C，尤其守備範圍（RngR）差距達 6.4 分。落選的主因被認為是打擊產能較低，但在 65 球限制、比賽普遍低比分的賽制下，守備價值的邊際報酬更高。',
      'He leads the selected third baseman across every fielding component, with a 6.4-run gap in range runs alone. He was reportedly left off for weaker offense — but under a 65-pitch, low-scoring format, defensive value carries a higher marginal return.',
    ),
    deltas: [
      { metric: 'uzr150', label: bi('UZR/150', 'UZR/150'), snubValue: 13.6, selectedValue: 4.4, delta: 9.2, higherIsBetter: true },
      { metric: 'rngR', label: bi('守備範圍 RngR', 'Range runs'), snubValue: 7.2, selectedValue: 0.8, delta: 6.4, higherIsBetter: true },
      { metric: 'oaa', label: bi('OAA', 'OAA'), snubValue: 9, selectedValue: 1, delta: 8, higherIsBetter: true },
      { metric: 'wrcPlus', label: bi('wRC+', 'wRC+'), snubValue: 96, selectedValue: 111, delta: -15, higherIsBetter: true },
      { metric: 'sprintSpeed', label: bi('離壘速度', 'Sprint speed'), snubValue: 28.4, selectedValue: 26.1, delta: 2.3, higherIsBetter: true },
    ],
    sources: [],
  },
  {
    player: snubPlayer('snub-jpn-rp', '示範 中繼投手 Y', 'Demo Reliever Y', 46, 'P', 'JPN'),
    comparedToPlayerId: 'jpn-cl',
    argument: bi(
      '對左打的壓制數據明顯優於入選牛棚，且單場 20 球以內的短局數使用最能發揮。本場七局下正是「缺一個左投」的情境，遺珠與實際戰況直接相關。',
      'His numbers against left-handed hitters clearly beat the selected bullpen arms, and he is best deployed in sub-20-pitch bursts. The bottom of the 7th in this game was exactly the "no lefty available" scenario — this snub maps directly onto what went wrong.',
    ),
    deltas: [
      { metric: 'k9', label: bi('K/9', 'K/9'), snubValue: 12.6, selectedValue: 13.1, delta: -0.5, higherIsBetter: true },
      { metric: 'bb9', label: bi('BB/9', 'BB/9'), snubValue: 1.9, selectedValue: 2.4, delta: -0.5, higherIsBetter: false },
      { metric: 'fip', label: bi('FIP', 'FIP'), snubValue: 2.31, selectedValue: 1.98, delta: 0.33, higherIsBetter: false },
      { metric: 'vsLhhOps', label: bi('對左打 OPS', 'OPS vs. LHH'), snubValue: 0.508, selectedValue: 0.671, delta: -0.163, higherIsBetter: false },
      { metric: 'velocityDeclinePer25', label: bi('球速下滑 /25 球', 'Velo drop /25'), snubValue: 0.28, selectedValue: 0.55, delta: -0.27, higherIsBetter: false },
    ],
    sources: [],
  },
  {
    player: snubPlayer('snub-ven-of', '示範 外野手 Z', 'Demo Outfielder Z', 29, 'RF', 'VEN'),
    comparedToPlayerId: 'ven-c',
    argument: bi(
      '打擊產能與入選者接近，但守備與跑壘明顯領先。委內瑞拉最終名單偏重打擊火力，代價是外野守備範圍不足 —— 本場五局上讓日本隊游擊手的美技成為對比。',
      'Comparable offense to the selected player, with a clear edge in defense and baserunning. Venezuela\'s final roster leaned toward bat-first players at the cost of outfield range — a contrast the Japanese shortstop\'s play in the top of the 5th made vivid.',
    ),
    deltas: [
      { metric: 'wrcPlus', label: bi('wRC+', 'wRC+'), snubValue: 121, selectedValue: 118, delta: 3, higherIsBetter: true },
      { metric: 'uzr150', label: bi('UZR/150', 'UZR/150'), snubValue: 9.8, selectedValue: 6.1, delta: 3.7, higherIsBetter: true },
      { metric: 'sprintSpeed', label: bi('離壘速度', 'Sprint speed'), snubValue: 29.1, selectedValue: 25.1, delta: 4.0, higherIsBetter: true },
      { metric: 'whiffPct', label: bi('揮空率', 'Whiff%'), snubValue: 0.196, selectedValue: 0.241, delta: -0.045, higherIsBetter: false },
      { metric: 'war', label: bi('WAR', 'WAR'), snubValue: 3.8, selectedValue: 3.2, delta: 0.6, higherIsBetter: true },
    ],
    sources: [],
  },
];

/* ------------------------------------------------------------------ */
/* 3. 節奏控制影響（Pitch Timer × PitchCom）                           */
/* ------------------------------------------------------------------ */

export const CASE_TEMPO: TempoImpact[] = [
  {
    pitcherId: 'jpn-sp',
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
    pitcherId: 'ven-sp',
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
/* 4. 牛棚銜接檢討（65 球限制）                                        */
/* ------------------------------------------------------------------ */

export const CASE_BULLPEN: BullpenBridgePlan[] = [
  {
    side: 'AWAY',
    legs: [
      {
        pitcherId: 'ven-sp',
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
        pitcherId: 'jpn-sp',
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
        pitcherId: 'jpn-cl',
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
