import type { Bilingual, Lang } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 語言與路徑                                                        */
/*                                                                     */
/* 語言的唯一來源是網址的第一個區段（/zh/... 或 /en/...）。        */
/* 這樣 Server Component 可以直接從 params 讀到語言，不必為了取語言  */
/* 而變成 Client Component；兩種語言也都能在 build 時靜態預先產生。     */
/* ------------------------------------------------------------------ */

export const LANGS = ['zh', 'en'] as const;

/** 網址沒帶語言時的預設。 */
export const DEFAULT_LANG: Lang = 'zh';

/** 寫進 `<html lang>` 的值。 */
export const HTML_LANG: Record<Lang, string> = {
  zh: 'zh-Hant',
  en: 'en',
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/**
 * 幫站內路徑加上語言前綴：`localePath('en', '/replay')` → `/en/replay`。
 * 首頁傳 '/' 時會得到 `/en`（而不是 `/en/`）。
 */
export function localePath(lang: Lang, path: string): string {
  if (path === '/') return `/${lang}`;
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * 把一個已帶語言前綴的路徑換成另一種語言，並保留剩下的路徑。
 * 用在導覽列的中英切換：`/zh/replay` → `/en/replay`。
 */
export function swapLangInPath(pathname: string, next: Lang): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLang(segments[0])) {
    segments[0] = next;
    return `/${segments.join('/')}`;
  }
  return localePath(next, pathname);
}

export function t(text: Bilingual, lang: Lang): string {
  return text[lang];
}

/** 建立 Bilingual 的簡寫。 */
export function bi(zh: string, en: string): Bilingual {
  return { zh, en };
}

/** 全站共用文案。 */
export const UI = {
  brand: bi('棒球復盤室', 'Baseball After Review'),
  tagline: bi(
    '重新審視每一顆球的調度潛能',
    'Boarding for Game Analysis',
  ),
  nav: {
    home: bi('登機大廳', 'Terminal'),
    rosters: bi('旅客名單', 'Rosters'),
    matchup: bi('夢幻對決', 'Matchup'),
    replay: bi('比賽復盤', 'Replay'),
    caseStudy: bi('示範專題', 'Case Study'),
    scatter: bi('數據散佈圖', 'Scatter Studio'),
  },
  cabin: {
    STARTER: bi('先發 · 頭等艙', 'Starter · First'),
    BENCH: bi('替補 · 經濟艙', 'Bench · Economy'),
    ROTATION: bi('先發輪值 · 商務艙', 'Rotation · Business'),
    BULLPEN: bi('牛棚 · 商務艙', 'Bullpen · Business'),
    CLOSER: bi('終結者 · 頭等艙', 'Closer · First'),
    MANAGER: bi('總教練 · 機組員', 'Manager · Crew'),
    SNUB: bi('遺珠 · 候補', 'Snub · Standby'),
  },
  boardingPass: {
    passenger: bi('旅客姓名 PASSENGER', 'PASSENGER'),
    flight: bi('航班 FLIGHT', 'FLIGHT'),
    gate: bi('登機門 GATE', 'GATE'),
    seat: bi('座位 SEAT', 'SEAT'),
    cabinClass: bi('艙等 CLASS', 'CLASS'),
    boarding: bi('登機時間 BOARDING', 'BOARDING'),
    stub: bi('存根聯', 'PASSENGER COUPON'),
    club: bi('母隊 CLUB', 'CLUB'),
    country: bi('國家 COUNTRY', 'COUNTRY'),
    position: bi('守備 POS', 'POS'),
    playerStats: bi('球員數據', 'Player Stats'),
    ticketTab: bi('登機證', 'Boarding Pass'),
    batsThrows: bi('打／投', 'Bats/Throws'),
    league: bi('聯盟', 'League'),
    age: bi('年齡', 'Age'),
    heightWeight: bi('身高體重', 'Ht/Wt'),
  },
  matchup: {
    title: bi('夢幻對決訂位', 'Matchup Booking'),
    step1: bi('步驟一 · 選擇年代模式', 'Step 1 · Select Era Mode'),
    step2: bi('步驟二 · 選擇對戰隊伍', 'Step 2 · Select Teams'),
    step3: bi('步驟三 · 確認行程', 'Step 3 · Confirm Itinerary'),
    departure: bi('出發 (客隊)', 'DEPARTURE (AWAY)'),
    arrival: bi('抵達 (主隊)', 'ARRIVAL (HOME)'),
    next: bi('下一步', 'Continue'),
    back: bi('上一步', 'Back'),
    confirm: bi('確認開賽', 'Confirm & Simulate'),
    swap: bi('主客互換', 'Swap sides'),
  },
  manager: {
    modeOn: bi('總教練模式', 'Manager Mode'),
    side: bi('執掌球隊', 'Managing'),
    home: bi('主隊', 'Home'),
    away: bi('客隊', 'Away'),
    yourCall: bi('你的決策', 'Your Call'),
    historical: bi('歷史真實選擇', 'Historical Call'),
    optimal: bi('AI 數據最佳解', 'Optimal Sabermetric Call'),
    submit: bi('送出決策', 'Submit Decision'),
    deltaWp: bi('勝率變化', 'Win Prob. Δ'),
  },
  hud: {
    pitchTimer: bi('投球計時器', 'Pitch Timer'),
    pitchCom: bi('PitchCom 通訊', 'PitchCom'),
    pitchCount: bi('用球數', 'Pitch Count'),
    limit: bi('上限', 'Limit'),
    unlimited: bi('無限制', 'Unlimited'),
    overweight: bi('行李超重 · 強制退場', 'Overweight Baggage · Mandatory Removal'),
    restDays: bi('強制休息天數', 'Mandatory Rest'),
    ttop: bi('第三輪打序預警', 'Third Time Through Order'),
    violation: bi('計時器違規', 'Clock Violation'),
  },
  crucial: {
    title: bi('關鍵轉折點', 'Crucial Play'),
    blackBox: bi('黑匣子解構', 'Black Box Breakdown'),
    biggestSwing: bi('全場最大勝率位移', 'Largest Win Probability Swing'),
  },
  chart: {
    winProbability: bi('勝率曲線', 'Win Probability'),
    leverage: bi('槓桿指數', 'Leverage Index'),
    inning: bi('局數', 'Inning'),
  },
  rosters: {
    selectEra: bi('選擇賽事年份', 'Select a tournament year'),
    selectTeam: bi('選擇隊伍', 'Select a team'),
    changeEra: bi('切換年份', 'Change year'),
    changeTeam: bi('切換隊伍', 'Change team'),
    coachingStaff: bi('教練團', 'Coaching Staff'),
    lineup: bi('先發九棒', 'Starting Lineup'),
    bench: bi('替補', 'Bench'),
    rotation: bi('先發輪值', 'Rotation'),
    bullpen: bi('牛棚', 'Bullpen'),
    closer: bi('終結者', 'Closer'),
    snubs: bi('遺珠專區', 'Snubs'),
    noSnubs: bi('遺珠名單尚未提供', 'Snub list not yet provided'),
  },
  replay: {
    selectGame: bi('選擇比賽', 'Select a Game'),
    changeGame: bi('重選比賽', 'Change game'),
    editLineup: bi('選/編輯打線', 'Edit Lineups'),
    chooseModeTitle: bi('先發打線怎麼決定？', 'How should the lineups be set?'),
    currentModeTitle: bi('當下選擇', 'Actual Starters'),
    currentModeDesc: bi('直接採用該隊真實先發九棒與投手，不做任何調整。', 'Use each team\'s real starting lineup and pitcher as-is, no changes.'),
    customModeTitle: bi('自訂模式', 'Custom Mode'),
    customModeDesc: bi('可自訂棒次、投手，也能把遺珠球員換上場。', 'Customize the batting order, pitcher, and optionally swap in a snub player.'),
    changeMode: bi('重選模式', 'Change mode'),
    startingLineup: bi('先發打線', 'Starting Lineup'),
    startingPitcher: bi('先發投手', 'Starting Pitcher'),
    snubTab: bi('遺珠', 'Snubs'),
    generate: bi('產生逐球復盤', 'Generate Pitch-by-Pitch Review'),
    regenerate: bi('重新產生（換一組結果）', 'Regenerate (new roll)'),
    back: bi('上一步', 'Back'),
    currentBatter: bi('目前打者', 'At Bat'),
    currentPitcher: bi('目前投手', 'On the Mound'),
    prevPitch: bi('上一球', 'Prev pitch'),
    nextPitch: bi('下一球', 'Next pitch'),
    decisionPoints: bi('調度決策點', 'Decision Points'),
    jumpToDecision: bi('跳至決策點', 'Jump to decision'),
    noDecisionPoints: bi('這場比賽沒有偵測到高槓桿調度時刻。', 'No high-leverage decision moments detected in this game.'),
  },
  scatter: {
    xAxis: bi('X 軸', 'X axis'),
    yAxis: bi('Y 軸', 'Y axis'),
    bubbleSize: bi('氣泡大小', 'Bubble size'),
    none: bi('無', 'None'),
    trendLine: bi('顯示趨勢線', 'Trend line'),
    highlightSnubs: bi('標註遺珠', 'Highlight snubs'),
    filters: bi('篩選條件', 'Filters'),
    era: bi('賽事年份', 'Era'),
    team: bi('球隊', 'Team'),
    position: bi('守位', 'Position'),
    rosterClass: bi('陣容分級', 'Roster class'),
    minInnings: bi('最低守備局數', 'Min. innings'),
    minPa: bi('最低打席數', 'Min. plate appearances'),
    reset: bi('重設篩選', 'Reset filters'),
    noPoints: bi(
      '目前的 X/Y 軸組合與篩選條件下沒有符合的球員（例如打者指標配投手指標不會有交集）。',
      'No players match this X/Y pair and filter combination (e.g. a batting metric paired with a pitching metric has no overlap).',
    ),
    pointCount: bi('筆資料', 'players'),
  },
} as const;
