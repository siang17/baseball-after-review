/**
 * 2026 World Baseball Classic 八強賽 — 真實賽程與比分
 *
 * 全部 7 場淘汰賽（八強、準決賽、冠軍賽）的對戰組合、主客場、比分、場地皆已
 * 用網路搜尋查證，並以 ESPN 逐場 boxscore（espn.com/world-baseball-classic/game/_/gameId/…）
 * 交叉比對主客場與比分，MLB.com / CBS Sports / Yahoo Sports / WBSC.org / Olympics.com
 * 等至少兩個獨立來源交叉確認比分本身。查證於 2026-09（本次 session）。
 *
 * 場地：八強賽在 Daikin Park（Houston）與 loanDepot park（Miami）兩地分開進行，
 * 準決賽與冠軍賽全部在 loanDepot park（Miami）。
 *
 * 主客場注意：WBC 淘汰賽在中立場地進行，主客場是賽程編排指定，不代表地主優勢；
 * 三場（USA-CAN、USA-DOM、VEN-ITA）主客場與原本假設的方向相反，這裡的
 * `homeTeamCode`/`awayTeamCode` 已依 ESPN boxscore 校正。
 */

import { bi } from '@/lib/i18n';
import type { Game } from '@/types/baseball';

const HOUSTON = bi('休士頓', 'Houston');
const MIAMI = bi('邁阿密', 'Miami');
const QUARTERFINAL = bi('八強賽', 'Quarterfinal');
const SEMIFINAL = bi('準決賽', 'Semifinal');
const ARRIVED = bi('已抵達 ARRIVED', 'ARRIVED');

export const SCHEDULE_2026: Game[] = [
  {
    // DOM 10, KOR 0（7 局，提前結束規則）。ESPN gameId 401845795。
    id: '2026-wbc-03-13-dom-kor',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-13',
    venue: MIAMI,
    round: QUARTERFINAL,
    homeTeamCode: 'DOM',
    awayTeamCode: 'KOR',
    finalScore: { home: 10, away: 0 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // USA 5, CAN 3；ESPN/Fox Sports boxscore 確認主場是 CAN、客場是 USA。
    // ESPN gameId 401845796。
    id: '2026-wbc-03-13-can-usa',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-13',
    venue: HOUSTON,
    round: QUARTERFINAL,
    homeTeamCode: 'CAN',
    awayTeamCode: 'USA',
    finalScore: { home: 3, away: 5 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // ITA 8, PUR 6。ESPN gameId 401845797。
    id: '2026-wbc-03-14-ita-pur',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-14',
    venue: HOUSTON,
    round: QUARTERFINAL,
    homeTeamCode: 'ITA',
    awayTeamCode: 'PUR',
    finalScore: { home: 8, away: 6 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // VEN 8, JPN 5 —— 衛冕軍日本遭委內瑞拉逆轉淘汰。ESPN gameId 401845798。
    id: '2026-wbc-03-14-jpn-ven',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-14',
    venue: MIAMI,
    round: QUARTERFINAL,
    homeTeamCode: 'JPN',
    awayTeamCode: 'VEN',
    finalScore: { home: 5, away: 8 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // USA 2, DOM 1；ESPN boxscore 確認主場是 DOM、客場是 USA。ESPN gameId 401845799。
    id: '2026-wbc-03-15-dom-usa',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-15',
    venue: MIAMI,
    round: SEMIFINAL,
    homeTeamCode: 'DOM',
    awayTeamCode: 'USA',
    finalScore: { home: 1, away: 2 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // VEN 4, ITA 2；ESPN boxscore 確認主場是 ITA、客場是 VEN。ESPN gameId 401845800。
    id: '2026-wbc-03-16-ita-ven',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-16',
    venue: MIAMI,
    round: SEMIFINAL,
    homeTeamCode: 'ITA',
    awayTeamCode: 'VEN',
    finalScore: { home: 2, away: 4 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
  {
    // 冠軍賽：VEN 3, USA 2（九局上 Eugenio Suárez 二壘打奠定勝局）—— 委內瑞拉首奪 WBC 冠軍。
    // ESPN gameId 401845801。
    id: '2026-wbc-03-17-final-usa-ven',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-17',
    venue: MIAMI,
    round: bi('冠軍賽', 'Championship'),
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: { home: 2, away: 3 },
    status: 'FINAL',
    boardStatus: ARRIVED,
    pitchLimitPreset: 65,
  },
];
