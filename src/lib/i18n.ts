import type { Bilingual, Lang } from '@/types/baseball';

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
} as const;
