// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'PUR';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-pur-sp1', teamCode: TEAM, era: ERA, zh: 'Raymond Burgos', en: 'Raymond Burgos', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2026-pur-sp2', teamCode: TEAM, era: ERA, zh: 'Fernando Cruz', en: 'Fernando Cruz', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-pur-sp3', teamCode: TEAM, era: ERA, zh: 'José De León', en: 'José De León', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-pur-sp4', teamCode: TEAM, era: ERA, zh: 'Edwin Díaz', en: 'Edwin Díaz', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-pur-sp5', teamCode: TEAM, era: ERA, zh: 'José Espada', en: 'José Espada', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-pur-rp1', teamCode: TEAM, era: ERA, zh: 'Rico García', en: 'Rico García', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-pur-rp2', teamCode: TEAM, era: ERA, zh: 'Seth Lugo', en: 'Seth Lugo', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-pur-rp3', teamCode: TEAM, era: ERA, zh: 'Jorge López', en: 'Jorge López', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Jovani Morán：已知左投，throws 設為 L。
const rp4 = pitcher({ id: '2026-pur-rp4', teamCode: TEAM, era: ERA, zh: 'Jovani Morán', en: 'Jovani Morán', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp5 = pitcher({ id: '2026-pur-rp5', teamCode: TEAM, era: ERA, zh: 'Luis Quiñones', en: 'Luis Quiñones', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2026-pur-rp6', teamCode: TEAM, era: ERA, zh: 'Ángel Reyes', en: 'Ángel Reyes', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-pur-rp7', teamCode: TEAM, era: ERA, zh: 'Eduardo Rivera', en: 'Eduardo Rivera', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2026-pur-rp8', teamCode: TEAM, era: ERA, zh: 'Gabriel Rodríguez', en: 'Gabriel Rodríguez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2026-pur-rp9', teamCode: TEAM, era: ERA, zh: 'Elmer Rodríguez', en: 'Elmer Rodríguez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp10 = pitcher({ id: '2026-pur-rp10', teamCode: TEAM, era: ERA, zh: 'Yacksel Ríos', en: 'Yacksel Ríos', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-pur-cl1', teamCode: TEAM, era: ERA, zh: 'Ricardo Vélez', en: 'Ricardo Vélez', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2026-pur-c1', teamCode: TEAM, era: ERA, zh: 'Martín Maldonado', en: 'Martín Maldonado', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2026-pur-c2', teamCode: TEAM, era: ERA, zh: 'Christian Vázquez', en: 'Christian Vázquez', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-pur-1b1', teamCode: TEAM, era: ERA, zh: 'Nolan Arenado', en: 'Nolan Arenado', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Edwin Arroyo：已知switch hitter，bats 設為 S。
const if2 = batter({ id: '2026-pur-2b1', teamCode: TEAM, era: ERA, zh: 'Edwin Arroyo', en: 'Edwin Arroyo', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'S', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-pur-3b1', teamCode: TEAM, era: ERA, zh: 'Darell Hernaiz', en: 'Darell Hernaiz', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2026-pur-ss1', teamCode: TEAM, era: ERA, zh: 'Emmanuel Rivera', en: 'Emmanuel Rivera', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2026-pur-1b2', teamCode: TEAM, era: ERA, zh: 'Luis Vázquez', en: 'Luis Vázquez', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Willi Castro：已知switch hitter，bats 設為 S。
const of1 = batter({ id: '2026-pur-lf1', teamCode: TEAM, era: ERA, zh: 'Willi Castro', en: 'Willi Castro', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'S', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-pur-cf1', teamCode: TEAM, era: ERA, zh: 'Carlos Cortes', en: 'Carlos Cortes', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-pur-rf1', teamCode: TEAM, era: ERA, zh: 'Matthew Lugo', en: 'Matthew Lugo', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// MJ Melendez：已知左打，bats 設為 L。
const of4 = batter({ id: '2026-pur-lf2', teamCode: TEAM, era: ERA, zh: 'MJ Melendez', en: 'MJ Melendez', jersey: null, battingOrder: null, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Heliot Ramos：已知左打，bats 設為 L。
const of5 = batter({ id: '2026-pur-cf2', teamCode: TEAM, era: ERA, zh: 'Heliot Ramos', en: 'Heliot Ramos', jersey: null, battingOrder: null, positions: ['CF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Eddie Rosario：已知左打，bats 設為 L。
const of6 = batter({ id: '2026-pur-rf2', teamCode: TEAM, era: ERA, zh: 'Eddie Rosario', en: 'Eddie Rosario', jersey: null, battingOrder: null, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of7 = batter({ id: '2026-pur-lf3', teamCode: TEAM, era: ERA, zh: 'Bryan Torres', en: 'Bryan Torres', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-pur-manager', TEAM, ERA, 'Yadier Molina', 'Yadier Molina');

const coachingStaff = [
  coach('2026-pur-coach-1', TEAM, ERA, 'Alex Cintrón', 'Alex Cintrón', 'HEAD_COACH'),
  coach('2026-pur-coach-2', TEAM, ERA, 'Victor Rodriguez', 'Victor Rodriguez', 'BATTING_COACH'),
  coach('2026-pur-coach-3', TEAM, ERA, 'Ricky Bones', 'Ricky Bones', 'PITCHING_COACH'),
  coach('2026-pur-coach-4', TEAM, ERA, 'José Rosado', 'José Rosado', 'BULLPEN_COACH'),
  coach('2026-pur-coach-5', TEAM, ERA, 'José Cruz Jr.', 'José Cruz Jr.', 'FIRST_BASE_COACH'),
  coach('2026-pur-coach-6', TEAM, ERA, 'Luis Rivera', 'Luis Rivera', 'THIRD_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_PUR_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, of4, of5, of6, of7],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9, rp10],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
