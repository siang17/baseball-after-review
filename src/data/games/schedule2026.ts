/**
 * 2026 World Baseball Classic 八強賽 — 真實賽程
 *
 * 對戰組合、日期、地點已用網路搜尋查證（Houston / Miami，2026/3/13–17）。
 * 準決賽與冠軍賽的對戰組合已知（USA vs DOM、VEN vs ITA、VEN 奪冠），
 * 但比分未查證，以 `finalScore: null` / `status: 'SCHEDULED'` 標記。
 */

import { bi } from '@/lib/i18n';
import type { Game } from '@/types/baseball';

const HOUSTON = bi('休士頓', 'Houston');
const MIAMI = bi('邁阿密', 'Miami');
const QUARTERFINAL = bi('八強賽', 'Quarterfinal');
const SEMIFINAL = bi('準決賽', 'Semifinal');

export const SCHEDULE_2026: Game[] = [
  {
    id: '2026-wbc-03-13-dom-kor',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-13',
    venue: HOUSTON,
    round: QUARTERFINAL,
    homeTeamCode: 'DOM',
    awayTeamCode: 'KOR',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
    pitchLimitPreset: 65,
  },
  {
    id: '2026-wbc-03-13-usa-can',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-13',
    venue: HOUSTON,
    round: QUARTERFINAL,
    homeTeamCode: 'USA',
    awayTeamCode: 'CAN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
    pitchLimitPreset: 65,
  },
  {
    id: '2026-wbc-03-14-ita-pur',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-14',
    venue: MIAMI,
    round: QUARTERFINAL,
    homeTeamCode: 'ITA',
    awayTeamCode: 'PUR',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
    pitchLimitPreset: 65,
  },
  {
    // JPN 敗給 VEN，VEN 晉級 —— 已查證的唯一一場確切結果。
    id: '2026-wbc-03-14-jpn-ven',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-14',
    venue: MIAMI,
    round: QUARTERFINAL,
    homeTeamCode: 'JPN',
    awayTeamCode: 'VEN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('VEN 晉級（比分待查證）', 'VEN advances (score unverified)'),
    pitchLimitPreset: 65,
  },
  {
    id: '2026-wbc-03-15-usa-dom',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-15',
    venue: MIAMI,
    round: SEMIFINAL,
    homeTeamCode: 'USA',
    awayTeamCode: 'DOM',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('比分待查證', 'Score unverified'),
    pitchLimitPreset: 65,
  },
  {
    // VEN 晉級冠軍賽 —— 對戰組合已查證，比分未查證。
    id: '2026-wbc-03-16-ven-ita',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-16',
    venue: MIAMI,
    round: SEMIFINAL,
    homeTeamCode: 'VEN',
    awayTeamCode: 'ITA',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('VEN 晉級（比分待查證）', 'VEN advances (score unverified)'),
    pitchLimitPreset: 65,
  },
  {
    // 冠軍賽：VEN 擊敗 USA 奪冠 —— 對戰組合與結果已查證，比分未查證。
    id: '2026-wbc-03-17-final-usa-ven',
    tournamentId: 'WBC_2026',
    era: 2026,
    date: '2026-03-17',
    venue: MIAMI,
    round: bi('冠軍賽', 'Championship'),
    homeTeamCode: 'USA',
    awayTeamCode: 'VEN',
    finalScore: null,
    status: 'SCHEDULED',
    boardStatus: bi('VEN 奪冠（比分待查證）', 'VEN champion (score unverified)'),
    pitchLimitPreset: 65,
  },
];
