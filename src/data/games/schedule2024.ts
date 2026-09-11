/**
 * 2024 WBSC 十二強（Premier12）Super Round — 真實賽程與比分
 *
 * 範圍縮減為 4 隊（日本／委內瑞拉，2024／2026）後，只保留兩隊在 2024 屆
 * 唯一的直接對戰。日期、比分已用網路搜尋查證（東京巨蛋，2024/11/22），
 * 以 WBSC 官方賽事報導（wbsc.org）為主要來源。查證於 2026-09（本次 session）。
 */

import { bi } from '@/lib/i18n';
import type { Game } from '@/types/baseball';

const TOKYO_DOME = bi('東京巨蛋', 'Tokyo Dome');
const SUPER_ROUND = bi('複賽 Super Round', 'Super Round');

export const SCHEDULE_2024: Game[] = [
  {
    // JPN 9, VEN 6 —— 牧秀悟七局下滿貫砲逆轉。來源：wbsc.org。
    id: '2024-p12-11-22-jpn-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-22',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'JPN',
    awayTeamCode: 'VEN',
    finalScore: { home: 9, away: 6 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
];
