// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'USA';
const ERA = 2024;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2024-usa-sp1', teamCode: TEAM, era: ERA, zh: 'Eric Adler', en: 'Eric Adler', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2024-usa-sp2', teamCode: TEAM, era: ERA, zh: 'Dan Altavilla', en: 'Dan Altavilla', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2024-usa-sp3', teamCode: TEAM, era: ERA, zh: 'Sam Benschoter', en: 'Sam Benschoter', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2024-usa-sp4', teamCode: TEAM, era: ERA, zh: 'Austin Drury', en: 'Austin Drury', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2024-usa-sp5', teamCode: TEAM, era: ERA, zh: 'Anthony Gose', en: 'Anthony Gose', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2024-usa-rp1', teamCode: TEAM, era: ERA, zh: 'Zac Grotz', en: 'Zac Grotz', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Rich Hill：known 左投（MLB 資深左投）。
const rp2 = pitcher({ id: '2024-usa-rp2', teamCode: TEAM, era: ERA, zh: 'Rich Hill', en: 'Rich Hill', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp3 = pitcher({ id: '2024-usa-rp3', teamCode: TEAM, era: ERA, zh: 'Casey Lawrence', en: 'Casey Lawrence', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2024-usa-rp4', teamCode: TEAM, era: ERA, zh: 'Antonio Menendez', en: 'Antonio Menendez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2024-usa-rp5', teamCode: TEAM, era: ERA, zh: 'Zane Mills', en: 'Zane Mills', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2024-usa-rp6', teamCode: TEAM, era: ERA, zh: 'Spencer Patton', en: 'Spencer Patton', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2024-usa-rp7', teamCode: TEAM, era: ERA, zh: 'Darrell Thompson', en: 'Darrell Thompson', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2024-usa-rp8', teamCode: TEAM, era: ERA, zh: 'Touki Toussaint', en: 'Touki Toussaint', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2024-usa-rp9', teamCode: TEAM, era: ERA, zh: 'Austin Vernon', en: 'Austin Vernon', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2024-usa-cl1', teamCode: TEAM, era: ERA, zh: 'Cam Vieaux', en: 'Cam Vieaux', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2024-usa-c1', teamCode: TEAM, era: ERA, zh: 'Drake Baldwin', en: 'Drake Baldwin', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2024-usa-c2', teamCode: TEAM, era: ERA, zh: 'Willie MacIver', en: 'Willie MacIver', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const c3 = batter({ id: '2024-usa-c3', teamCode: TEAM, era: ERA, zh: 'Chris Okey', en: 'Chris Okey', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2024-usa-1b1', teamCode: TEAM, era: ERA, zh: 'Cam Devanney', en: 'Cam Devanney', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2024-usa-2b1', teamCode: TEAM, era: ERA, zh: 'Tim Elko', en: 'Tim Elko', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Termarr Johnson：known 左打。
const if3 = batter({ id: '2024-usa-3b1', teamCode: TEAM, era: ERA, zh: 'Termarr Johnson', en: 'Termarr Johnson', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2024-usa-ss1', teamCode: TEAM, era: ERA, zh: 'Luke Ritter', en: 'Luke Ritter', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2024-usa-1b2', teamCode: TEAM, era: ERA, zh: 'Matt Shaw', en: 'Matt Shaw', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2024-usa-2b2', teamCode: TEAM, era: ERA, zh: 'Carson Williams', en: 'Carson Williams', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2024-usa-3b2', teamCode: TEAM, era: ERA, zh: 'Ryan Ward', en: 'Ryan Ward', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配，剛好 3 人皆為先發）             */
/* ------------------------------------------------------------------ */

// Justin Crawford：known 左打。
const of1 = batter({ id: '2024-usa-lf1', teamCode: TEAM, era: ERA, zh: 'Justin Crawford', en: 'Justin Crawford', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2024-usa-cf1', teamCode: TEAM, era: ERA, zh: 'Chandler Simpson', en: 'Chandler Simpson', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2024-usa-rf1', teamCode: TEAM, era: ERA, zh: 'Colby Thomas', en: 'Colby Thomas', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2024-usa-manager', TEAM, ERA, '麥克·索西', 'Mike Scioscia');

const coachingStaff = [
  coach('2024-usa-coach-1', TEAM, ERA, 'Ron Roenicke', 'Ron Roenicke', 'HEAD_COACH'),
  coach('2024-usa-coach-2', TEAM, ERA, 'Dave Wallace', 'Dave Wallace', 'PITCHING_COACH'),
  coach('2024-usa-coach-3', TEAM, ERA, 'Rick Eckstein', 'Rick Eckstein', 'BATTING_COACH'),
  coach('2024-usa-coach-4', TEAM, ERA, 'Dino Ebel', 'Dino Ebel', 'THIRD_BASE_COACH'),
  coach('2024-usa-coach-5', TEAM, ERA, 'Jemile Weeks', 'Jemile Weeks', 'FIRST_BASE_COACH'),
  coach('2024-usa-coach-6', TEAM, ERA, 'LaTroy Hawkins', 'LaTroy Hawkins', 'BULLPEN_COACH'),
  coach('2024-usa-coach-7', TEAM, ERA, 'Carlos Muñoz', 'Carlos Muñoz', 'BULLPEN_CATCHER'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_USA_2024: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'PREMIER12_2024',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, c3, if6, if7],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
