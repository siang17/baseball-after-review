/**
 * ⚠️ 示範資料 (PLACEHOLDER)
 *
 * 核心示範專題：2026 WBC 日本 vs. 委內瑞拉。
 * 勝率曲線由決定性 PRNG 生成（同 seed 在 SSR 與 CSR 產生相同結果），
 * 逐球內容與調度節點為手寫示意。正式資料請改由 API / 靜態 JSON 匯入。
 */

import { bi } from '@/lib/i18n';
import { hashString } from '@/lib/utils';
import type {
  CrucialPlay,
  DecisionPoint,
  Game,
  GameReview,
  MatchState,
  PitchData,
  WinProbabilityPoint,
} from '@/types/baseball';

export const DEMO_GAME: Game = {
  id: 'wbc2026-jpn-ven',
  tournamentId: 'WBC_2026',
  era: 2026,
  date: '2026-03-15',
  venue: bi('示範球場', 'Demo Ballpark'),
  round: bi('複賽', 'Quarterfinal'),
  homeTeamCode: 'JPN',
  awayTeamCode: 'VEN',
  finalScore: { home: 4, away: 3 },
  status: 'FINAL',
  boardStatus: bi('已抵達 ARRIVED', 'ARRIVED'),
  pitchLimitPreset: 65,
};

/* ------------------------------------------------------------------ */
/* 勝率曲線                                                            */
/* ------------------------------------------------------------------ */

/** 決定性 PRNG（mulberry32），確保 SSR / CSR 結果一致。 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWinProbability(): WinProbabilityPoint[] {
  const rand = mulberry32(hashString(DEMO_GAME.id));
  const points: WinProbabilityPoint[] = [];

  let home = 0.54; // 主隊（日本）開局微幅領先
  let scoreHome = 0;
  let scoreAway = 0;
  let index = 0;

  for (let inning = 1; inning <= 9; inning++) {
    for (const half of ['TOP', 'BOTTOM'] as const) {
      const batters = 3 + Math.floor(rand() * 3);
      for (let b = 0; b < batters; b++) {
        // 越後段局數，單一打席的勝率位移越大。
        const volatility = 0.012 + inning * 0.004;
        home += (rand() - 0.5) * volatility * 2;
        home = Math.min(0.97, Math.max(0.03, home));

        points.push({
          index: index++,
          inning,
          half,
          home: Number(home.toFixed(4)),
          leverageIndex: Number((0.6 + rand() * (0.5 + inning * 0.22)).toFixed(2)),
          score: { home: scoreHome, away: scoreAway },
          label: bi(`第 ${inning} 局${half === 'TOP' ? '上' : '下'}`, `Inning ${inning} ${half === 'TOP' ? 'top' : 'bottom'}`),
          crucialPlayId: null,
        });
      }

      // 依腳本安排得分。
      if (inning === 3 && half === 'TOP') scoreAway += 2;
      if (inning === 4 && half === 'BOTTOM') scoreHome += 1;
      if (inning === 6 && half === 'TOP') scoreAway += 1;
      if (inning === 7 && half === 'BOTTOM') scoreHome += 2;
      if (inning === 8 && half === 'BOTTOM') scoreHome += 1;
    }
  }

  // 收斂到最終結果（主隊 4-3 獲勝）。
  const tail = points.slice(-6);
  tail.forEach((p, i) => {
    p.home = Number((p.home + ((0.99 - p.home) * (i + 1)) / tail.length).toFixed(4));
  });

  return points;
}

export const DEMO_WIN_PROBABILITY: WinProbabilityPoint[] = buildWinProbability();

/* ------------------------------------------------------------------ */
/* 關鍵轉折點                                                          */
/* ------------------------------------------------------------------ */

/** 7 局下的逆轉點：取曲線中段偏後的一個 index 作為錨點。 */
const CRUCIAL_INDEX = Math.floor(DEMO_WIN_PROBABILITY.length * 0.78);
const CLOCK_INDEX = Math.floor(DEMO_WIN_PROBABILITY.length * 0.62);
const DEFENSE_INDEX = Math.floor(DEMO_WIN_PROBABILITY.length * 0.44);

export const DEMO_CRUCIAL_PLAYS: CrucialPlay[] = [
  {
    id: 'cp-7th-go-ahead',
    gameId: DEMO_GAME.id,
    pitchId: 'p-7b-05',
    decisionPointId: 'dp-7th-pitching-change',
    category: 'PLAY',
    inning: 7,
    half: 'BOTTOM',
    deltaWinProbability: 0.264,
    leverageIndex: 3.41,
    re24: 1.72,
    beneficiary: 'HOME',
    title: bi('七局下二出局滿壘的逆轉二壘打', 'Two-out, bases-loaded go-ahead double in the 7th'),
    description: bi(
      '委內瑞拉續投已達 58 球的先發投手面對第三輪打序，第 5 球失投偏高，被掃出左中外野兩分打點二壘打。',
      'Venezuela stayed with a starter at 58 pitches facing the order a third time; pitch five leaked up in the zone and was driven into the left-center gap for two runs.',
    ),
    breakdown: [
      bi('決策當下 LI 3.41，屬全場最高槓桿情境。', 'Leverage index of 3.41 — the highest of the game.'),
      bi('該投手第三輪打序被壓制率下滑，TTOP 懲罰約 +20 wOBA 點。', 'Third time through the order carries roughly a +20 wOBA-point penalty.'),
      bi('用球數 58 球已進入 65 球上限的警示區，牛棚僅一人熱身。', 'At 58 pitches he was inside the warning band for the 65-pitch limit, with only one arm up.'),
      bi('若於此打席前換上左投對決左打，模擬 WP 可提升約 8.4%。', 'Bringing in the lefty before this at-bat projects to a 8.4% win-probability gain.'),
    ],
    severity: 'CRITICAL',
    videoUrl: null,
  },
  {
    id: 'cp-clock-violation',
    gameId: DEMO_GAME.id,
    pitchId: 'p-6t-03',
    decisionPointId: null,
    category: 'PITCH_CLOCK',
    inning: 6,
    half: 'TOP',
    deltaWinProbability: -0.061,
    leverageIndex: 1.92,
    re24: -0.31,
    beneficiary: 'AWAY',
    title: bi('投球計時器違規送出保送', 'Pitch clock violation forces a walk'),
    description: bi(
      'PitchCom 訊號兩度變更導致節奏拖延，滿球數下計時器歸零判罰一壞球，直接保送形成得點圈危機。',
      'Two PitchCom changes stalled the tempo; with a full count the timer expired, the automatic ball walked the batter and put the tying run in scoring position.',
    ),
    breakdown: [
      bi('該打席 PitchCom 改訊號 2 次，平均確認延遲拉長至 1.9 秒。', 'Two sign changes in the at-bat stretched average ack latency to 1.9 seconds.'),
      bi('壘上有人時計時器為 20 秒，實際剩餘僅 0.4 秒。', 'With runners on, the 20-second clock was down to 0.4 seconds.'),
      bi('違規保送使該半局期望得分由 0.42 升至 0.88。', 'The automatic walk lifted half-inning run expectancy from 0.42 to 0.88.'),
    ],
    severity: 'WARNING',
    videoUrl: null,
  },
  {
    id: 'cp-uzr-save',
    gameId: DEMO_GAME.id,
    pitchId: 'p-5t-04',
    decisionPointId: null,
    category: 'DEFENSE',
    inning: 5,
    half: 'TOP',
    deltaWinProbability: 0.118,
    leverageIndex: 2.14,
    re24: -0.94,
    beneficiary: 'HOME',
    title: bi('游擊手深遠美技化解一二壘危機', 'Deep play by the shortstop erases a first-and-second threat'),
    description: bi(
      '游擊手於三游之間深處反手接殺並完成傳殺，該區域平均出局率僅 34%。',
      'A backhand deep in the hole and an on-the-run throw converted a ball fielded at a 34% average out rate.',
    ),
    breakdown: [
      bi('該守位球員本季 UZR/150 為 +15.8，守備範圍分項貢獻最高。', 'The fielder carries a +15.8 UZR/150, driven mainly by range runs.'),
      bi('若形成安打，一三壘無人出局期望得分將達 1.78。', 'A hit there creates first-and-third, none out — a 1.78 run expectancy.'),
      bi('此守備約值 0.94 期望失分，佔全場守備價值最大單一 Play。', 'Worth roughly 0.94 runs prevented — the largest single defensive play of the game.'),
    ],
    severity: 'WARNING',
    videoUrl: null,
  },
];

// 把關鍵轉折點掛到曲線上。
[
  [CRUCIAL_INDEX, 'cp-7th-go-ahead'],
  [CLOCK_INDEX, 'cp-clock-violation'],
  [DEFENSE_INDEX, 'cp-uzr-save'],
].forEach(([idx, id]) => {
  const point = DEMO_WIN_PROBABILITY[idx as number];
  if (point) point.crucialPlayId = id as string;
});

/* ------------------------------------------------------------------ */
/* 逐球資料（示意）                                                    */
/* ------------------------------------------------------------------ */

const baseState: MatchState = {
  gameId: DEMO_GAME.id,
  inning: 7,
  half: 'BOTTOM',
  outs: 2,
  balls: 1,
  strikes: 2,
  bases: ['jpn-ss', 'jpn-cf', null],
  score: { home: 2, away: 3 },
  batterId: 'jpn-cf',
  pitcherId: 'ven-sp',
  catcherId: 'ven-c',
  offense: 'HOME',
  pitcherPitchCount: 58,
  timesThroughOrder: 3,
  winProbabilityHome: 0.47,
  leverageIndex: 3.41,
  challengesRemaining: { home: 1, away: 0 },
};

export const DEMO_STATE: MatchState = baseState;

export const DEMO_PITCHES: PitchData[] = [
  {
    id: 'p-7b-05',
    gameId: DEMO_GAME.id,
    atBatIndex: 52,
    pitchNumber: 5,
    cumulativePitchCount: 58,
    inning: 7,
    half: 'BOTTOM',
    pitcherId: 'ven-sp',
    batterId: 'jpn-cf',
    catcherId: 'ven-c',
    pitchType: 'FF',
    velocity: 93.1,
    spinRate: 2280,
    location: { x: -0.15, z: 3.42 },
    result: 'IN_PLAY_HIT',
    battedBall: { type: 'LD', exitVelocity: 104.6, launchAngle: 19, zone: 'LC-GAP' },
    stateBefore: {
      inning: 7,
      half: 'BOTTOM',
      outs: 2,
      balls: 1,
      strikes: 2,
      bases: ['jpn-ss', 'jpn-cf', null],
      score: { home: 2, away: 3 },
    },
    deltaWinProbability: 0.264,
    leverageIndex: 3.41,
    re24: 1.72,
    pitchClockRemainingSec: 6.2,
    pitchClockViolation: false,
    pitchCom: {
      sender: 'CATCHER',
      sentAtMs: 620,
      acknowledgedAtMs: 1180,
      requestedPitch: 'SL',
      requestedLocation: { x: 0.55, z: 1.85 },
      changed: true,
      changeCount: 1,
      malfunctionDelayMs: 0,
      malfunctionNote: null,
    },
    description: bi(
      '速球偏高失投，被掃向左中外野形成兩分打點二壘打。',
      'Fastball up and out of the intended location, driven to the left-center gap for a two-run double.',
    ),
  },
  {
    id: 'p-6t-03',
    gameId: DEMO_GAME.id,
    atBatIndex: 44,
    pitchNumber: 6,
    cumulativePitchCount: 47,
    inning: 6,
    half: 'TOP',
    pitcherId: 'jpn-sp',
    batterId: 'ven-3b',
    catcherId: 'ven-c',
    pitchType: 'FF',
    velocity: 95.8,
    spinRate: 2410,
    location: { x: 0, z: 0 },
    result: 'PITCH_CLOCK_VIOLATION',
    battedBall: null,
    stateBefore: {
      inning: 6,
      half: 'TOP',
      outs: 1,
      balls: 3,
      strikes: 2,
      bases: [null, 'ven-c', null],
      score: { home: 1, away: 2 },
    },
    deltaWinProbability: -0.061,
    leverageIndex: 1.92,
    re24: -0.31,
    pitchClockRemainingSec: 0,
    pitchClockViolation: true,
    pitchCom: {
      sender: 'PITCHER',
      sentAtMs: 980,
      acknowledgedAtMs: 2880,
      requestedPitch: 'FS',
      requestedLocation: { x: -0.2, z: 1.6 },
      changed: true,
      changeCount: 2,
      malfunctionDelayMs: 740,
      malfunctionNote: bi(
        '接收器訊號中斷 0.74 秒，投手需重新確認配球。',
        'Receiver dropped the signal for 0.74s; the pitcher had to re-confirm the call.',
      ),
    },
    description: bi(
      '滿球數下計時器歸零，判罰一壞球形成保送。',
      'The clock expired on a full count — automatic ball, and the batter walks.',
    ),
  },
];

/* ------------------------------------------------------------------ */
/* 總教練決策節點                                                      */
/* ------------------------------------------------------------------ */

export const DEMO_DECISION_POINTS: DecisionPoint[] = [
  {
    id: 'dp-7th-pitching-change',
    gameId: DEMO_GAME.id,
    beforePitchId: 'p-7b-05',
    state: baseState,
    side: 'AWAY',
    triggerReason: ['HIGH_LEVERAGE', 'PITCH_LIMIT', 'TTOP', 'LATE_INNING'],
    situation: bi(
      '七局下二出局一二壘，客隊領先 1 分。先發投手已投 58 球（上限 65 球），正面對第三輪打序的對方第一棒。',
      'Bottom 7, two outs, runners on first and second, away team up by one. The starter sits at 58 pitches (65-pitch limit) facing the leadoff hitter a third time.',
    ),
    // 注意：projectedDeltaWp / deltaWp 一律為「主隊（日本）視角」。
    // 客隊總教練的視角由 UI 端以 deltaForSide() 轉換。
    options: [
      {
        id: 'opt-hold',
        type: 'HOLD',
        label: bi('維持現狀：續投先發', 'Hold — stay with the starter'),
        detail: bi('剩餘 7 球額度，賭一個出局數收尾。', 'Seven pitches of headroom left; ride him for one more out.'),
        targetPlayerId: null,
        replacedPlayerId: null,
        projectedDeltaWp: 0.084,
        projectedRe24: 0.51,
        confidence: { low: 0.04, high: 0.13 },
      },
      {
        id: 'opt-change-lhp',
        type: 'PITCHING_CHANGE',
        label: bi('換投：左投對決左打', 'Pitching change — lefty on lefty'),
        detail: bi('牛棚左投已熱身完成，對左打壓制率佳。', 'The lefty is loose and holds a strong platoon split.'),
        targetPlayerId: 'jpn-cl',
        replacedPlayerId: 'ven-sp',
        projectedDeltaWp: -0.061,
        projectedRe24: -0.28,
        confidence: { low: -0.1, high: -0.02 },
      },
      {
        id: 'opt-ibb',
        type: 'IBB',
        label: bi('敬遠：填滿壘包製造封殺', 'Intentional walk — load the bases'),
        detail: bi('對下一棒的滾地球率較高，可製造封殺點。', 'The next hitter carries a higher ground-ball rate; sets up a force at every base.'),
        targetPlayerId: null,
        replacedPlayerId: null,
        projectedDeltaWp: 0.019,
        projectedRe24: 0.34,
        confidence: { low: -0.03, high: 0.07 },
      },
    ],
    historical: {
      source: 'HISTORICAL',
      option: {
        id: 'opt-hold',
        type: 'HOLD',
        label: bi('維持現狀：續投先發', 'Hold — stay with the starter'),
        detail: bi('教練團選擇相信先發投手的球威。', 'The staff backed their starter to finish the inning.'),
        targetPlayerId: null,
        replacedPlayerId: null,
        projectedDeltaWp: 0.084,
        projectedRe24: 0.51,
        confidence: null,
      },
      deltaWp: 0.264,
      actualResult: bi(
        '第 5 球被掃出左中外野兩分打點二壘打，比數遭逆轉。',
        'Pitch five went for a two-run double to left-center; the lead flipped.',
      ),
      rationale: bi(
        '牛棚前一日已消耗，教練團傾向保留戰力並相信 65 球額度尚有餘裕。',
        'The bullpen had been taxed the day before, and the staff read the remaining pitch allowance as enough cushion.',
      ),
    },
    aiOptimal: {
      source: 'AI_OPTIMAL',
      option: {
        id: 'opt-change-lhp',
        type: 'PITCHING_CHANGE',
        label: bi('換投：左投對決左打', 'Pitching change — lefty on lefty'),
        detail: bi('以 RE24 與對戰左右差為依據的最高期望值選擇。', 'Highest expected value by RE24 and platoon split.'),
        targetPlayerId: 'jpn-cl',
        replacedPlayerId: 'ven-sp',
        projectedDeltaWp: -0.061,
        projectedRe24: -0.28,
        confidence: { low: -0.1, high: -0.02 },
      },
      deltaWp: -0.061,
      actualResult: null,
      rationale: bi(
        'LI 3.41 為全場最高，此時投入最佳牛棚戰力的邊際報酬遠高於保留至九局；第三輪打序的 TTOP 懲罰再扣約 20 wOBA 點。',
        'At an LI of 3.41 — the game high — spending the best reliever now beats saving him for the ninth, and the third-time-through penalty costs the starter roughly 20 wOBA points.',
      ),
    },
  },
];

/* ------------------------------------------------------------------ */

export const DEMO_GAME_REVIEW: GameReview = {
  game: DEMO_GAME,
  pitches: DEMO_PITCHES,
  winProbability: DEMO_WIN_PROBABILITY,
  crucialPlays: DEMO_CRUCIAL_PLAYS,
  decisionPoints: DEMO_DECISION_POINTS,
  pitcherUsage: [
    {
      pitcherId: 'ven-sp',
      side: 'AWAY',
      pitches: 63,
      battersFaced: 24,
      ip: 6.2,
      removedAtPitch: 63,
      removalReason: 'PERFORMANCE',
      mandatoryRestDays: 4,
    },
    {
      pitcherId: 'jpn-sp',
      side: 'HOME',
      pitches: 65,
      battersFaced: 22,
      ip: 6.0,
      removedAtPitch: 65,
      removalReason: 'PITCH_LIMIT',
      mandatoryRestDays: 4,
    },
    {
      pitcherId: 'jpn-cl',
      side: 'HOME',
      pitches: 18,
      battersFaced: 5,
      ip: 1.2,
      removedAtPitch: null,
      removalReason: 'END_OF_GAME',
      mandatoryRestDays: 0,
    },
  ],
  clockViolations: [
    {
      pitchId: 'p-6t-03',
      offender: 'PITCHER',
      playerId: 'jpn-sp',
      penalty: bi('自動增加一壞球，形成保送。', 'Automatic ball — the walk is awarded.'),
    },
  ],
};
