/**
 * 2024 WBSC 十二強（Premier12）Super Round + 獎牌賽 — 真實賽程
 *
 * 對戰組合與日期已用網路搜尋查證（東京巨蛋，2024/11/21–24）。
 * 兩場未查到確切比分的 Super Round 場次（JPN vs VEN、USA vs VEN）
 * 以 `finalScore: null` / `status: 'SCHEDULED'` 標記為「已知有此場但比分未查證」，
 * 正式上線前請以 WBSC 官方戰績為準替換。
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
    // ⚠️ 確有此場（同批次賽程），但確切比分未查證。
    id: '2024-p12-11-22-jpn-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-22',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'JPN',
    awayTeamCode: 'VEN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
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
    // ⚠️ 確有此場（同批次賽程），但確切比分未查證。
    id: '2024-p12-11-23-usa-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-23',
    venue: TOKYO_DOME,
    round: SUPER_ROUND,
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
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
    // ⚠️ 確有殿軍賽，但確切比分未查證。
    id: '2024-p12-11-24-bronze-usa-ven',
    tournamentId: 'PREMIER12_2024',
    era: 2024,
    date: '2024-11-24',
    venue: TOKYO_DOME,
    round: MEDAL_GAME,
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
    pitchLimitPreset: 65,
  },
];
