// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'ITA';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// Sam Aldegheri：已知左投，throws 設為 L。
const sp1 = pitcher({ id: '2026-ita-sp1', teamCode: TEAM, era: ERA, zh: 'Sam Aldegheri', en: 'Sam Aldegheri', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp2 = pitcher({ id: '2026-ita-sp2', teamCode: TEAM, era: ERA, zh: 'Dan Altavilla', en: 'Dan Altavilla', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-ita-sp3', teamCode: TEAM, era: ERA, zh: 'Matt Festa', en: 'Matt Festa', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-ita-sp4', teamCode: TEAM, era: ERA, zh: 'Gordon Graceffo', en: 'Gordon Graceffo', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-ita-sp5', teamCode: TEAM, era: ERA, zh: 'Alek Jacob', en: 'Alek Jacob', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-ita-rp1', teamCode: TEAM, era: ERA, zh: 'Joe Jacques', en: 'Joe Jacques', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Joe La Sorsa：已知左投，throws 設為 L。
const rp2 = pitcher({ id: '2026-ita-rp2', teamCode: TEAM, era: ERA, zh: 'Joe La Sorsa', en: 'Joe La Sorsa', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp3 = pitcher({ id: '2026-ita-rp3', teamCode: TEAM, era: ERA, zh: 'Michael Lorenzen', en: 'Michael Lorenzen', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-ita-rp4', teamCode: TEAM, era: ERA, zh: 'Ron Marinaccio', en: 'Ron Marinaccio', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-ita-rp5', teamCode: TEAM, era: ERA, zh: 'Kyle Nicolas', en: 'Kyle Nicolas', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2026-ita-rp6', teamCode: TEAM, era: ERA, zh: 'Aaron Nola', en: 'Aaron Nola', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-ita-rp7', teamCode: TEAM, era: ERA, zh: 'Adam Ottavino', en: 'Adam Ottavino', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2026-ita-rp8', teamCode: TEAM, era: ERA, zh: 'Gabriele Quattrini', en: 'Gabriele Quattrini', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2026-ita-rp9', teamCode: TEAM, era: ERA, zh: 'Claudio Scotti', en: 'Claudio Scotti', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-ita-cl1', teamCode: TEAM, era: ERA, zh: 'Greg Weissert', en: 'Greg Weissert', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手（僅 1 位，直接為先發，無替補捕手）                              */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2026-ita-c1', teamCode: TEAM, era: ERA, zh: "J.J. D'Orazio", en: "J.J. D'Orazio", jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-ita-1b1', teamCode: TEAM, era: ERA, zh: 'Sam Antonacci', en: 'Sam Antonacci', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-ita-2b1', teamCode: TEAM, era: ERA, zh: 'Jon Berti', en: 'Jon Berti', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-ita-3b1', teamCode: TEAM, era: ERA, zh: 'Zach Dezenzo', en: 'Zach Dezenzo', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2026-ita-ss1', teamCode: TEAM, era: ERA, zh: 'Andrew Fischer', en: 'Andrew Fischer', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2026-ita-1b2', teamCode: TEAM, era: ERA, zh: 'Mickey Gasper', en: 'Mickey Gasper', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2026-ita-2b2', teamCode: TEAM, era: ERA, zh: 'Renzo Martini', en: 'Renzo Martini', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Vinnie Pasquantino：已知左打，bats 設為 L。
const if7 = batter({ id: '2026-ita-3b2', teamCode: TEAM, era: ERA, zh: 'Vinnie Pasquantino', en: 'Vinnie Pasquantino', jersey: null, battingOrder: null, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if8 = batter({ id: '2026-ita-ss2', teamCode: TEAM, era: ERA, zh: 'Brayan Rocchio', en: 'Brayan Rocchio', jersey: null, battingOrder: null, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if9 = batter({ id: '2026-ita-1b3', teamCode: TEAM, era: ERA, zh: 'Thomas Saggese', en: 'Thomas Saggese', jersey: null, battingOrder: null, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Jac Caglianone：已知左打，bats 設為 L。
const of1 = batter({ id: '2026-ita-lf1', teamCode: TEAM, era: ERA, zh: 'Jac Caglianone', en: 'Jac Caglianone', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-ita-cf1', teamCode: TEAM, era: ERA, zh: 'Dominic Canzone', en: 'Dominic Canzone', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-ita-rf1', teamCode: TEAM, era: ERA, zh: 'Jakob Marsee', en: 'Jakob Marsee', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-ita-lf2', teamCode: TEAM, era: ERA, zh: 'Nick Morabito', en: 'Nick Morabito', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-ita-cf2', teamCode: TEAM, era: ERA, zh: 'Dante Nori', en: 'Dante Nori', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-ita-manager', TEAM, ERA, 'Mike Piazza', 'Mike Piazza');

const coachingStaff = [
  coach('2026-ita-coach-1', TEAM, ERA, 'Blake Doyle', 'Blake Doyle', 'HEAD_COACH'),
  coach('2026-ita-coach-2', TEAM, ERA, 'Jack Wilson', 'Jack Wilson', 'BATTING_COACH'),
  coach('2026-ita-coach-3', TEAM, ERA, 'Mike Krukow', 'Mike Krukow', 'PITCHING_COACH'),
  coach('2026-ita-coach-4', TEAM, ERA, 'Sal Fasano', 'Sal Fasano', 'BULLPEN_COACH'),
  coach('2026-ita-coach-5', TEAM, ERA, 'Chris Denorfia', 'Chris Denorfia', 'BASERUNNING_COACH', bi('跑壘/壘指導教練', 'Baserunning/Base Coach')),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_ITA_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [if6, if7, if8, if9, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
