/**
 * ⚠️ 示範資料 (PLACEHOLDER)
 *
 * 核心示範專題：2026 WBC 日本 vs. 委內瑞拉。
 * 勝率曲線由決定性 PRNG 生成（同 seed 在 SSR 與 CSR 產生相同結果），
 * 逐球內容與調度節點為手寫示意。正式資料請改由 API / 靜態 JSON 匯入。
 */

import { bi } from '@/lib/i18n';
import { leverageIndex as computeLeverageIndex, re24 as computeRe24, winExpectancy } from '@/lib/sabermetrics';
import { hashString } from '@/lib/utils';
import type {
  BaseState,
  Bilingual,
  CrucialPlay,
  DecisionPoint,
  Game,
  GameReview,
  MatchState,
  PitchData,
  Side,
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
/* 真實結果                                                            */
/*                                                                     */
/* `DEMO_GAME` 這個「總教練模式」情境是假設日本在七局下換投／續投的      */
/* 另一種劇本，最終比分（JPN 4-3 主場守住）是虛構的。真實世界裡，這場    */
/* 2026 WBC 八強賽（2026-03-14, loanDepot park, Miami）委內瑞拉在六局   */
/* 靠 Maikel García、Wilyer Abreu 的長打逆轉，淘汰衛冕軍日本。          */
/* 已用網路搜尋查證（ESPN boxscore gameId 401845798，並與 MLB.com /     */
/* CBS Sports / Yahoo Sports / Olympics.com 等交叉確認）。              */
/* ------------------------------------------------------------------ */
export const REAL_RESULT = {
  date: '2026-03-14',
  venue: bi('邁阿密 loanDepot park', 'loanDepot park, Miami'),
  finalScore: { home: 5, away: 8 },
  winner: 'VEN' as const,
  summary: bi(
    '真實結果：委內瑞拉八強賽 8-5 逆轉淘汰衛冕軍日本。五局 Maikel García 兩分砲追到 4-5，六局 Wilyer Abreu 三分砲反超為 7-5，委內瑞拉晉級四強並在冠軍賽 3-2 擊敗美國，首度奪下 WBC 冠軍。',
    'Real result: Venezuela came back to beat defending champion Japan 8-5 in the quarterfinal. Maikel García’s two-run homer in the 5th cut it to 4-5, then Wilyer Abreu’s three-run homer in the 6th put Venezuela ahead 7-5. Venezuela went on to beat the USA 3-2 in the final for its first WBC title.',
  ),
};

/** 真實逐局比分（同一份 ESPN/CBS 查證來源，兩隊加總與最終比分 8-5 對得上）。 */
export const REAL_LINE_SCORE: Array<{ inning: number; away: number; home: number }> = [
  { inning: 1, away: 1, home: 1 },
  { inning: 2, away: 1, home: 0 },
  { inning: 3, away: 0, home: 4 },
  { inning: 4, away: 0, home: 0 },
  { inning: 5, away: 2, home: 0 },
  { inning: 6, away: 3, home: 0 },
  { inning: 7, away: 0, home: 0 },
  { inning: 8, away: 1, home: 0 },
  { inning: 9, away: 0, home: 0 },
];

/* ------------------------------------------------------------------ */
/* 真實關鍵事件                                                        */
/*                                                                     */
/* 6 個真實事件（5 支全壘打＋1 次偷本壘），球員與比分皆已查證（同         */
/* REAL_RESULT 的 ESPN/CBS 來源）。leverageIndex / re24 用當下真實的     */
/* 局數、出局數、壘上狀況、比分餵進 `@/lib/sabermetrics` 現成的函式      */
/* 算出——出局數／壘上跑者「身分」等文字沒明講的細節，用最合理的估計      */
/* 補上並在此註明，數值本身不是杜撰，是依真實比分/敘述推算的近似值。     */
/* ------------------------------------------------------------------ */

function realState(input: {
  inning: number;
  half: 'TOP' | 'BOTTOM';
  outs: 0 | 1 | 2;
  bases: BaseState;
  score: { home: number; away: number };
  offense: Side;
}): MatchState {
  return {
    gameId: 'wbc2026-jpn-ven-real',
    inning: input.inning,
    half: input.half,
    outs: input.outs,
    balls: 0,
    strikes: 0,
    bases: input.bases,
    score: input.score,
    batterId: '',
    pitcherId: '',
    catcherId: '',
    offense: input.offense,
    pitcherPitchCount: 0,
    timesThroughOrder: 1,
    winProbabilityHome: 0,
    leverageIndex: 0,
    challengesRemaining: { home: 1, away: 1 },
  };
}

interface RealPlaySpec {
  id: string;
  category: CrucialPlay['category'];
  inning: number;
  half: 'TOP' | 'BOTTOM';
  before: { outs: 0 | 1 | 2; bases: BaseState; score: { home: number; away: number } };
  runsScored: number;
  beneficiary: Side;
  title: Bilingual;
  description: Bilingual;
  breakdown: Bilingual[];
  severity: CrucialPlay['severity'];
}

function buildRealPlay(spec: RealPlaySpec): CrucialPlay {
  const offense: Side = spec.half === 'TOP' ? 'AWAY' : 'HOME';
  const before = realState({ inning: spec.inning, half: spec.half, outs: spec.before.outs, bases: spec.before.bases, score: spec.before.score, offense });
  const scoreAfter = {
    home: spec.before.score.home + (offense === 'HOME' ? spec.runsScored : 0),
    away: spec.before.score.away + (offense === 'AWAY' ? spec.runsScored : 0),
  };
  // 全壘打／偷本壘成功後壘上清空；兩種事件都不會增加出局數，出局數沿用打席前的值。
  const afterBases: BaseState = [null, null, null];
  const after = realState({ inning: spec.inning, half: spec.half, outs: spec.before.outs, bases: afterBases, score: scoreAfter, offense });

  const wpBefore = winExpectancy(before);
  const wpAfter = winExpectancy(after);
  const deltaWinProbability = Number((wpAfter - wpBefore).toFixed(3));

  return {
    id: spec.id,
    gameId: 'wbc2026-jpn-ven-real',
    pitchId: null,
    decisionPointId: null,
    category: spec.category,
    inning: spec.inning,
    half: spec.half,
    deltaWinProbability,
    leverageIndex: computeLeverageIndex(before),
    re24: computeRe24({ bases: before.bases, outs: before.outs }, { bases: after.bases, outs: after.outs }, spec.runsScored),
    beneficiary: spec.beneficiary,
    title: spec.title,
    description: spec.description,
    breakdown: spec.breakdown,
    severity: spec.severity,
    videoUrl: null,
  };
}

export const REAL_CRUCIAL_PLAYS: CrucialPlay[] = [
  buildRealPlay({
    id: 'real-t1-acuna-hr',
    category: 'PLAY',
    inning: 1,
    half: 'TOP',
    before: { outs: 0, bases: [null, null, null], score: { home: 0, away: 0 } },
    runsScored: 1,
    beneficiary: 'AWAY',
    title: bi('一局上 Acuña Jr. 首打席開局全壘打', 'Acuña Jr. leads off the game with a homer'),
    description: bi(
      'Ronald Acuña Jr. 對山本由伸首打席開局全壘打（右中外野, 401 英尺）。',
      "Ronald Acuña Jr. led off the game with a home run to right-center (401 ft) off Yoshinobu Yamamoto.",
    ),
    breakdown: [
      bi('全場第一球打席就先馳得點，委內瑞拉 1-0 領先。', 'First pitch of the game becomes a lead-off run — Venezuela up 1-0.'),
      bi('大谷翔平緊接著在一局下回敬開局砲，這是 WBC 史上首次單場雙方都開局全壘打。', "Shohei Ohtani answered with his own leadoff homer in the bottom half — the first time in WBC history both teams opened a game with a leadoff home run."),
    ],
    severity: 'WARNING',
  }),
  buildRealPlay({
    id: 'real-b1-ohtani-hr',
    category: 'PLAY',
    inning: 1,
    half: 'BOTTOM',
    before: { outs: 0, bases: [null, null, null], score: { home: 0, away: 1 } },
    runsScored: 1,
    beneficiary: 'HOME',
    title: bi('一局下 大谷翔平開局全壘打追平', 'Ohtani ties it with his own leadoff homer'),
    description: bi(
      '大谷翔平首打席開局全壘打（中外野, 427 英尺），扳平 1-1。',
      'Shohei Ohtani led off the bottom of the 1st with a 427-foot home run to center, tying the game 1-1.',
    ),
    breakdown: [
      bi('史上首次 WBC 單場兩隊都開局全壘打。', 'The first-ever WBC game with leadoff homers from both teams.'),
    ],
    severity: 'WARNING',
  }),
  buildRealPlay({
    id: 'real-b3-morishita-hr',
    category: 'PLAY',
    inning: 3,
    half: 'BOTTOM',
    before: { outs: 1, bases: ['x', 'x', 'x'], score: { home: 2, away: 2 } },
    runsScored: 3,
    beneficiary: 'HOME',
    title: bi('三局下 森下翔太滿貫砲，日本 5-2 領先', 'Morishita’s bases-loaded homer puts Japan up 5-2'),
    description: bi(
      '佐藤先以二壘打攻下一分，森下翔太接著轟出三分砲（左外野, 388 英尺），日本 5-2 領先。',
      'A Sato RBI double set the table, then Shota Morishita hit a three-run homer to left (388 ft), putting Japan up 5-2.',
    ),
    breakdown: [
      bi('壘上狀況依真實得分敘述（"Ohtani 得分、Sato 得分" 皆隨此轟回本壘）推算為滿壘，非逐球查證數字。', 'Base state (bases loaded) is inferred from the reporting that both Ohtani and Sato scored on the play — an estimate, not a pitch-by-pitch verified state.'),
    ],
    severity: 'CRITICAL',
  }),
  buildRealPlay({
    id: 'real-t5-garcia-hr',
    category: 'PLAY',
    inning: 5,
    half: 'TOP',
    before: { outs: 1, bases: [null, 'x', null], score: { home: 5, away: 2 } },
    runsScored: 2,
    beneficiary: 'AWAY',
    title: bi('五局上 Maikel García 兩分砲追到 4-5', 'García’s two-run homer cuts it to 4-5'),
    description: bi(
      'Maikel García 兩分砲（左中外野, 406 英尺），Jackson Chourio 一併回本壘，追到 4-5。',
      'Maikel García hit a two-run homer to left-center (406 ft), scoring Jackson Chourio, to cut Japan’s lead to 4-5.',
    ),
    breakdown: [
      bi('委內瑞拉牛棚接管比賽前的關鍵追分，扭轉了場上氣勢。', 'The key at-bat that started Venezuela’s comeback momentum before their bullpen took over.'),
    ],
    severity: 'WARNING',
  }),
  buildRealPlay({
    id: 'real-t6-abreu-hr',
    category: 'PLAY',
    inning: 6,
    half: 'TOP',
    before: { outs: 1, bases: ['x', 'x', null], score: { home: 5, away: 4 } },
    runsScored: 3,
    beneficiary: 'AWAY',
    title: bi('六局上 Wilyer Abreu 三分砲反超，委內瑞拉 7-5', 'Abreu’s go-ahead three-run homer puts Venezuela up 7-5'),
    description: bi(
      'Wilyer Abreu 三分砲（右外野, 409 英尺），Ezequiel Tovar 與 Gleyber Torres 一併回本壘，委內瑞拉 7-5 反超。',
      'Wilyer Abreu launched a three-run homer to right (409 ft), scoring Ezequiel Tovar and Gleyber Torres, and Venezuela took a 7-5 lead.',
    ),
    breakdown: [
      bi('這支全壘打把整場比賽的優勢徹底交給委內瑞拉，日本再也沒能追平。', 'This swing handed the advantage to Venezuela for good — Japan never tied it again.'),
    ],
    severity: 'CRITICAL',
  }),
  buildRealPlay({
    id: 'real-t8-tovar-steal-home',
    category: 'BASERUNNING',
    inning: 8,
    half: 'TOP',
    before: { outs: 2, bases: [null, null, 'x'], score: { home: 5, away: 7 } },
    runsScored: 1,
    beneficiary: 'AWAY',
    title: bi('八局上 Ezequiel Tovar 牽制失誤偷回本壘', 'Tovar scores on a pickoff-throw error'),
    description: bi(
      '種市篤暉牽制三壘失誤，Ezequiel Tovar 趁機衝回本壘，委內瑞拉 8-5。',
      'Atsuki Taneichi’s pickoff throw to third got away, and Ezequiel Tovar raced home to make it 8-5.',
    ),
    breakdown: [
      bi('這一分是全場最終比分的最後一塊拼圖，最終定格 8-5。', 'This run set the final margin at 8-5.'),
    ],
    severity: 'INFO',
  }),
];

/** 真實得分時間軸（給「比賽過程」逐項列表用，跟 REAL_LINE_SCORE 是同一份查證來源）。 */
export const REAL_SCORING_TIMELINE: Array<{ label: Bilingual; scoreAfter: { away: number; home: number } }> = [
  { label: bi('一局上 · Acuña Jr. 開局全壘打', 'Top 1st · Acuña Jr. leadoff homer'), scoreAfter: { away: 1, home: 0 } },
  { label: bi('一局下 · 大谷翔平開局全壘打追平', 'Bottom 1st · Ohtani ties it with a leadoff homer'), scoreAfter: { away: 1, home: 1 } },
  { label: bi('二局上 · 委內瑞拉再得 1 分', 'Top 2nd · Venezuela adds a run'), scoreAfter: { away: 2, home: 1 } },
  { label: bi('三局下 · 佐藤二壘打、森下翔太三分砲', 'Bottom 3rd · Sato RBI double, Morishita 3-run homer'), scoreAfter: { away: 2, home: 5 } },
  { label: bi('五局上 · Maikel García 兩分砲', 'Top 5th · Maikel García 2-run homer'), scoreAfter: { away: 4, home: 5 } },
  { label: bi('六局上 · Wilyer Abreu 三分砲反超', 'Top 6th · Wilyer Abreu 3-run go-ahead homer'), scoreAfter: { away: 7, home: 5 } },
  { label: bi('八局上 · Ezequiel Tovar 偷本壘', 'Top 8th · Ezequiel Tovar steals home'), scoreAfter: { away: 8, home: 5 } },
];

/** 真實投球紀錄——只列查證到姓名與局數的投手；雙方牛棚其餘未點名投手不編造。 */
export const REAL_PITCHING_USAGE: Array<{
  playerId: string;
  side: Side;
  ip: number;
  hitsAllowed: number;
  runsAllowed: number;
  strikeouts: number;
  walks: number;
  homeRunsAllowed: number;
  decision: 'W' | 'L' | 'S' | null;
}> = [
  { playerId: '2026-ven-rp10', side: 'AWAY', ip: 2.2, hitsAllowed: 3, runsAllowed: 5, strikeouts: 4, walks: 3, homeRunsAllowed: 2, decision: null },
  { playerId: '2026-ven-sp5', side: 'AWAY', ip: 2.1, hitsAllowed: 1, runsAllowed: 0, strikeouts: 0, walks: 0, homeRunsAllowed: 0, decision: 'W' },
  { playerId: '2026-ven-rp6', side: 'AWAY', ip: 1.0, hitsAllowed: 0, runsAllowed: 0, strikeouts: 0, walks: 0, homeRunsAllowed: 0, decision: 'S' },
  { playerId: '2026-jpn-sp6', side: 'HOME', ip: 4.0, hitsAllowed: 4, runsAllowed: 2, strikeouts: 5, walks: 1, homeRunsAllowed: 1, decision: null },
  { playerId: '2026-jpn-sp2', side: 'HOME', ip: 1.0, hitsAllowed: 3, runsAllowed: 3, strikeouts: 0, walks: 0, homeRunsAllowed: 0, decision: 'L' },
];

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
  bases: ['2026-jpn-ss1', '2026-jpn-cf1', null],
  score: { home: 2, away: 3 },
  batterId: '2026-jpn-cf1',
  pitcherId: '2026-ven-sp1',
  catcherId: '2026-ven-c1',
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
    pitcherId: '2026-ven-sp1',
    batterId: '2026-jpn-cf1',
    catcherId: '2026-ven-c1',
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
      bases: ['2026-jpn-ss1', '2026-jpn-cf1', null],
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
    pitcherId: '2026-jpn-sp1',
    batterId: '2026-ven-3b1',
    catcherId: '2026-ven-c1',
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
      bases: [null, '2026-ven-c1', null],
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
        targetPlayerId: '2026-jpn-cl1',
        replacedPlayerId: '2026-ven-sp1',
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
        targetPlayerId: '2026-jpn-cl1',
        replacedPlayerId: '2026-ven-sp1',
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
      pitcherId: '2026-ven-sp1',
      side: 'AWAY',
      pitches: 63,
      battersFaced: 24,
      ip: 6.2,
      removedAtPitch: 63,
      removalReason: 'PERFORMANCE',
      mandatoryRestDays: 4,
    },
    {
      pitcherId: '2026-jpn-sp1',
      side: 'HOME',
      pitches: 65,
      battersFaced: 22,
      ip: 6.0,
      removedAtPitch: 65,
      removalReason: 'PITCH_LIMIT',
      mandatoryRestDays: 4,
    },
    {
      pitcherId: '2026-jpn-cl1',
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
      playerId: '2026-jpn-sp1',
      penalty: bi('自動增加一壞球，形成保送。', 'Automatic ball — the walk is awarded.'),
    },
  ],
};
