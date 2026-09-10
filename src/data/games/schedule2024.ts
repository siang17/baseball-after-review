/**
 * 2024 WBSC 十二強（Premier12）Super Round + 獎牌賽 — 真實賽程與比分
 *
 * 全部 8 場對戰組合、日期、比分皆已用網路搜尋查證（東京巨蛋，2024/11/21–24），
 * 以 WBSC 官方賽事報導（wbsc.org）為主要來源。查證於 2026-09（本次 session）。
 */

import { bi } from '@/lib/i18n';
import type { Game } from '@/types/baseball';

const TOKYO_DOME = bi('東京巨蛋', 'Tokyo Dome');
const SUPER_ROUND = bi('複賽 Super Round', 'Super Round');
const MEDAL_GAME = bi('獎牌賽', 'Medal Game');

export const SCHEDULE_2024: Game[] = [
  {
    id: '2024-p12-11-21-jpn-usa',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-21',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'JPN',
    awayTeamCode: 'USA',
    finalScore: { home: 9, away: 1 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
  {
    id: '2024-p12-11-21-ven-tpe',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-21',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'VEN',
    awayTeamCode: 'TPE',
    finalScore: { home: 2, away: 0 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
  {
    id: '2024-p12-11-22-tpe-usa',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-22',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'TPE',
    awayTeamCode: 'USA',
    finalScore: { home: 8, away: 2 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
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
  {
    id: '2024-p12-11-23-jpn-tpe',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-23',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'JPN',
    awayTeamCode: 'TPE',
    finalScore: { home: 9, away: 6 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
  {
    // USA 6, VEN 5 —— 九局上 Ryan Ward 陽春砲致勝。來源：wbsc.org。
    id: '2024-p12-11-23-usa-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-23',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: { home: 6, away: 5 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
  {
    id: '2024-p12-11-24-final-tpe-jpn',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-24',
    venue: TOKYO_DOME,
    round: bi('冠軍賽', 'Championship'),
    homeTeamCode: 'TPE',
    awayTeamCode: 'JPN',
    finalScore: { home: 4, away: 0 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
  {
    // USA 6, VEN 1 —— 殿軍賽，美國奪隊史首面十二強銅牌。來源：wbsc.org。
    id: '2024-p12-11-24-bronze-usa-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-24',
    venue: TOKYO_DOME,
    round: MEDAL_GAME,
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: { home: 6, away: 1 },
    status: 'FINAL',
    boardStatus: bi('已抵達', 'Arrived'),
    pitchLimitPreset: 65,
  },
];
