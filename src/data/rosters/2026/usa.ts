// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'USA';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-usa-sp1', teamCode: TEAM, era: ERA, zh: 'David Bednar', en: 'David Bednar', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
// Matthew Boyd：已知左投，throws 設為 L。
const sp2 = pitcher({ id: '2026-usa-sp2', teamCode: TEAM, era: ERA, zh: 'Matthew Boyd', en: 'Matthew Boyd', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
// Garrett Cleavinger：已知左投，throws 設為 L。
const sp3 = pitcher({ id: '2026-usa-sp3', teamCode: TEAM, era: ERA, zh: 'Garrett Cleavinger', en: 'Garrett Cleavinger', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
// Tim Hill：已知左投，throws 設為 L。
const sp4 = pitcher({ id: '2026-usa-sp4', teamCode: TEAM, era: ERA, zh: 'Tim Hill', en: 'Tim Hill', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp5 = pitcher({ id: '2026-usa-sp5', teamCode: TEAM, era: ERA, zh: 'Jeff Hoffman', en: 'Jeff Hoffman', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-usa-rp1', teamCode: TEAM, era: ERA, zh: 'Clay Holmes', en: 'Clay Holmes', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-usa-rp2', teamCode: TEAM, era: ERA, zh: 'Griffin Jax', en: 'Griffin Jax', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-usa-rp3', teamCode: TEAM, era: ERA, zh: 'Brad Keller', en: 'Brad Keller', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-usa-rp4', teamCode: TEAM, era: ERA, zh: 'Nolan McLean', en: 'Nolan McLean', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-usa-rp5', teamCode: TEAM, era: ERA, zh: 'Mason Miller', en: 'Mason Miller', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2026-usa-rp6', teamCode: TEAM, era: ERA, zh: 'Tyler Rogers', en: 'Tyler Rogers', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-usa-rp7', teamCode: TEAM, era: ERA, zh: 'Paul Skenes', en: 'Paul Skenes', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Gabe Speier：已知左投，throws 設為 L。
const rp8 = pitcher({ id: '2026-usa-rp8', teamCode: TEAM, era: ERA, zh: 'Gabe Speier', en: 'Gabe Speier', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp9 = pitcher({ id: '2026-usa-rp9', teamCode: TEAM, era: ERA, zh: 'Will Vest', en: 'Will Vest', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp10 = pitcher({ id: '2026-usa-rp10', teamCode: TEAM, era: ERA, zh: 'Logan Webb', en: 'Logan Webb', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-usa-cl1', teamCode: TEAM, era: ERA, zh: 'Garrett Whitlock', en: 'Garrett Whitlock', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// Cal Raleigh：已知switch hitter，bats 設為 S。
const c1 = batter({ id: '2026-usa-c1', teamCode: TEAM, era: ERA, zh: 'Cal Raleigh', en: 'Cal Raleigh', jersey: null, battingOrder: 1, positions: ['C'], bats: 'S', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Will Smith：已知左打（MLB Dodgers 生涯為左打），bats 設為 L。
const c2 = batter({ id: '2026-usa-c2', teamCode: TEAM, era: ERA, zh: 'Will Smith', en: 'Will Smith', jersey: null, battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-usa-1b1', teamCode: TEAM, era: ERA, zh: 'Alex Bregman', en: 'Alex Bregman', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-usa-2b1', teamCode: TEAM, era: ERA, zh: 'Ernie Clement', en: 'Ernie Clement', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-usa-3b1', teamCode: TEAM, era: ERA, zh: 'Paul Goldschmidt', en: 'Paul Goldschmidt', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Bryce Harper：已知左打，bats 設為 L。
const if4 = batter({ id: '2026-usa-ss1', teamCode: TEAM, era: ERA, zh: 'Bryce Harper', en: 'Bryce Harper', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Gunnar Henderson：已知左打，bats 設為 L。此隊已有指定打擊人選（Kyle Schwarber），故第 5 位內野手維持替補、不遞補第 9 棒。
const if5 = batter({ id: '2026-usa-1b2', teamCode: TEAM, era: ERA, zh: 'Gunnar Henderson', en: 'Gunnar Henderson', jersey: null, battingOrder: null, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Brice Turang：已知左打，bats 設為 L。
const if6 = batter({ id: '2026-usa-2b2', teamCode: TEAM, era: ERA, zh: 'Brice Turang', en: 'Brice Turang', jersey: null, battingOrder: null, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-usa-3b2', teamCode: TEAM, era: ERA, zh: 'Bobby Witt Jr.', en: 'Bobby Witt Jr.', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Roman Anthony：已知左打，bats 設為 L。
const of1 = batter({ id: '2026-usa-lf1', teamCode: TEAM, era: ERA, zh: 'Roman Anthony', en: 'Roman Anthony', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-usa-cf1', teamCode: TEAM, era: ERA, zh: 'Byron Buxton', en: 'Byron Buxton', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Pete Crow-Armstrong：已知左打，bats 設為 L。
const of3 = batter({ id: '2026-usa-rf1', teamCode: TEAM, era: ERA, zh: 'Pete Crow-Armstrong', en: 'Pete Crow-Armstrong', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-usa-lf2', teamCode: TEAM, era: ERA, zh: 'Aaron Judge', en: 'Aaron Judge', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 指定打擊                                                            */
/* ------------------------------------------------------------------ */

// Kyle Schwarber：已知左打，bats 設為 L。
const dh1 = batter({ id: '2026-usa-dh1', teamCode: TEAM, era: ERA, zh: 'Kyle Schwarber', en: 'Kyle Schwarber', jersey: null, battingOrder: 9, positions: ['DH'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-usa-manager', TEAM, ERA, '馬克·德羅薩', 'Mark DeRosa');

const coachingStaff = [
  coach('2026-usa-coach-1', TEAM, ERA, 'Brian McCann', 'Brian McCann', 'HEAD_COACH'),
  coach('2026-usa-coach-2', TEAM, ERA, 'Andy Pettitte', 'Andy Pettitte', 'BATTING_COACH'),
  coach('2026-usa-coach-3', TEAM, ERA, 'Dave Righetti', 'Dave Righetti', 'PITCHING_COACH'),
  coach('2026-usa-coach-4', TEAM, ERA, 'Brad Lidge', 'Brad Lidge', 'BULLPEN_COACH'),
  coach('2026-usa-coach-5', TEAM, ERA, 'Lou Collier', 'Lou Collier', 'FIRST_BASE_COACH'),
  coach('2026-usa-coach-6', TEAM, ERA, 'Dino Ebel', 'Dino Ebel', 'THIRD_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_USA_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, dh1],
  bench: [c2, if5, if6, if7, of4],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9, rp10],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
