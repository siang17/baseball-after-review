// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'CAN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-can-sp1', teamCode: TEAM, era: ERA, zh: 'Logan Allen', en: 'Logan Allen', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2026-can-sp2', teamCode: TEAM, era: ERA, zh: 'Micah Ashman', en: 'Micah Ashman', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-can-sp3', teamCode: TEAM, era: ERA, zh: 'Phillippe Aumont', en: 'Phillippe Aumont', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-can-sp4', teamCode: TEAM, era: ERA, zh: 'Jordan Balazovic', en: 'Jordan Balazovic', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-can-sp5', teamCode: TEAM, era: ERA, zh: 'Eric Cerantola', en: 'Eric Cerantola', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-can-rp1', teamCode: TEAM, era: ERA, zh: 'Indigo Diaz', en: 'Indigo Diaz', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-can-rp2', teamCode: TEAM, era: ERA, zh: 'Brock Dykxhoorn', en: 'Brock Dykxhoorn', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-can-rp3', teamCode: TEAM, era: ERA, zh: 'Antoine Jean', en: 'Antoine Jean', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Adam Macko：已知左投，throws 設為 L。
const rp4 = pitcher({ id: '2026-can-rp4', teamCode: TEAM, era: ERA, zh: 'Adam Macko', en: 'Adam Macko', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
// James Paxton：已知左投，throws 設為 L。
const rp5 = pitcher({ id: '2026-can-rp5', teamCode: TEAM, era: ERA, zh: 'James Paxton', en: 'James Paxton', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp6 = pitcher({ id: '2026-can-rp6', teamCode: TEAM, era: ERA, zh: 'Cal Quantrill', en: 'Cal Quantrill', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-can-rp7', teamCode: TEAM, era: ERA, zh: 'Noah Skirrow', en: 'Noah Skirrow', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2026-can-rp8', teamCode: TEAM, era: ERA, zh: 'Michael Soroka', en: 'Michael Soroka', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2026-can-rp9', teamCode: TEAM, era: ERA, zh: 'Jameson Taillon', en: 'Jameson Taillon', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp10 = pitcher({ id: '2026-can-rp10', teamCode: TEAM, era: ERA, zh: 'Matt Wilkinson', en: 'Matt Wilkinson', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

// Rob Zastryzny：已知左投，throws 設為 L。
const cl1 = pitcher({ id: '2026-can-cl1', teamCode: TEAM, era: ERA, zh: 'Rob Zastryzny', en: 'Rob Zastryzny', jersey: null, role: 'CL', throws: 'L', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2026-can-c1', teamCode: TEAM, era: ERA, zh: 'Liam Hicks', en: 'Liam Hicks', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Bo Naylor：已知左打，bats 設為 L。
const c2 = batter({ id: '2026-can-c2', teamCode: TEAM, era: ERA, zh: 'Bo Naylor', en: 'Bo Naylor', jersey: null, battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-can-1b1', teamCode: TEAM, era: ERA, zh: 'Tyler Black', en: 'Tyler Black', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-can-2b1', teamCode: TEAM, era: ERA, zh: 'Matt Davidson', en: 'Matt Davidson', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-can-3b1', teamCode: TEAM, era: ERA, zh: 'Adam Hall', en: 'Adam Hall', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Edouard Julien：已知左打，bats 設為 L。
const if4 = batter({ id: '2026-can-ss1', teamCode: TEAM, era: ERA, zh: 'Edouard Julien', en: 'Edouard Julien', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2026-can-1b2', teamCode: TEAM, era: ERA, zh: 'Otto López', en: 'Otto López', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Josh Naylor：已知左打，bats 設為 L。
const if6 = batter({ id: '2026-can-2b2', teamCode: TEAM, era: ERA, zh: 'Josh Naylor', en: 'Josh Naylor', jersey: null, battingOrder: null, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Abraham Toro：已知switch hitter，bats 設為 S。
const if7 = batter({ id: '2026-can-3b2', teamCode: TEAM, era: ERA, zh: 'Abraham Toro', en: 'Abraham Toro', jersey: null, battingOrder: null, positions: ['3B'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2026-can-lf1', teamCode: TEAM, era: ERA, zh: 'Owen Caissie', en: 'Owen Caissie', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-can-cf1', teamCode: TEAM, era: ERA, zh: 'Denzel Clarke', en: 'Denzel Clarke', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-can-rf1', teamCode: TEAM, era: ERA, zh: "Tyler O'Neill", en: "Tyler O'Neill", jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-can-lf2', teamCode: TEAM, era: ERA, zh: 'Jacob Robson', en: 'Jacob Robson', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-can-cf2', teamCode: TEAM, era: ERA, zh: 'Jared Young', en: 'Jared Young', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-can-manager', TEAM, ERA, 'Ernie Whitt', 'Ernie Whitt');

const coachingStaff = [
  coach('2026-can-coach-1', TEAM, ERA, 'Greg Hamilton', 'Greg Hamilton', 'HEAD_COACH'),
  coach('2026-can-coach-2', TEAM, ERA, 'Justin Morneau', 'Justin Morneau', 'BATTING_COACH'),
  coach('2026-can-coach-3', TEAM, ERA, 'Paul Quantrill', 'Paul Quantrill', 'PITCHING_COACH'),
  coach('2026-can-coach-4', TEAM, ERA, 'Denis Boucher', 'Denis Boucher', 'BULLPEN_COACH'),
  coach('2026-can-coach-5', TEAM, ERA, 'Russell Martin', 'Russell Martin', 'FIRST_BASE_COACH'),
  coach('2026-can-coach-6', TEAM, ERA, 'Stubby Clapp', 'Stubby Clapp', 'THIRD_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_CAN_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, if6, if7, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9, rp10],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
