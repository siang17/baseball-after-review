/**
 * 2026 World Baseball Classic 八強賽 — 真實賽程與比分
 *
 * 範圍縮減為 4 隊（日本／委內瑞拉，2024／2026）後，只保留兩隊在 2026 屆
 * 唯一的直接對戰（八強賽）。對戰組合、比分、場地皆已用網路搜尋查證，並以
 * ESPN 逐場 boxscore（espn.com/world-baseball-classic/game/_/gameId/…）
 * 交叉比對主客場與比分，MLB.com / CBS Sports / Yahoo Sports / WBSC.org /
 * Olympics.com 等至少兩個獨立來源交叉確認比分本身。查證於 2026-09（本次 session）。
 */

import { bi } from '@/lib/i18n';
import type { Game } from '@/types/baseball';

const MIAMI = bi('邁阿密', 'Miami');
const QUARTERFINAL = bi('八強賽', 'Quarterfinal');
const ARRIVED = bi('已抵達 ARRIVED', 'ARRIVED');

export const SCHEDULE_2026: Game[] = [
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
];
