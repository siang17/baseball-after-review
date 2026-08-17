// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'VEN';
const ERA = 2024;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// José Álvarez：known 左投（MLB 資深左投中繼）。
const sp1 = pitcher({ id: '2024-ven-sp1', teamCode: TEAM, era: ERA, zh: 'José Álvarez', en: 'José Álvarez', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp2 = pitcher({ id: '2024-ven-sp2', teamCode: TEAM, era: ERA, zh: 'Liarvis Breto', en: 'Liarvis Breto', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2024-ven-sp3', teamCode: TEAM, era: ERA, zh: 'Max Castillo', en: 'Max Castillo', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2024-ven-sp4', teamCode: TEAM, era: ERA, zh: 'Enderson Franco', en: 'Enderson Franco', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2024-ven-sp5', teamCode: TEAM, era: ERA, zh: 'Pedro García', en: 'Pedro García', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2024-ven-rp1', teamCode: TEAM, era: ERA, zh: 'Arnaldo Hernández', en: 'Arnaldo Hernández', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2024-ven-rp2', teamCode: TEAM, era: ERA, zh: 'Yohander Méndez', en: 'Yohander Méndez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2024-ven-rp3', teamCode: TEAM, era: ERA, zh: 'Oddanier Mosqueda', en: 'Oddanier Mosqueda', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2024-ven-rp4', teamCode: TEAM, era: ERA, zh: 'Ricardo Pinto', en: 'Ricardo Pinto', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2024-ven-rp5', teamCode: TEAM, era: ERA, zh: 'Nivaldo Rodríguez', en: 'Nivaldo Rodríguez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2024-ven-rp6', teamCode: TEAM, era: ERA, zh: 'Ricardo Rodríguez', en: 'Ricardo Rodríguez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2024-ven-rp7', teamCode: TEAM, era: ERA, zh: 'Mario Sánchez', en: 'Mario Sánchez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2024-ven-rp8', teamCode: TEAM, era: ERA, zh: 'Jesús Vargas', en: 'Jesús Vargas', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2024-ven-rp9', teamCode: TEAM, era: ERA, zh: 'Anthony Vizcaya', en: 'Anthony Vizcaya', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2024-ven-cl1', teamCode: TEAM, era: ERA, zh: 'Alfredo Zárraga', en: 'Alfredo Zárraga', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2024-ven-c1', teamCode: TEAM, era: ERA, zh: 'Francisco Arcia', en: 'Francisco Arcia', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2024-ven-c2', teamCode: TEAM, era: ERA, zh: 'Carlos Pérez', en: 'Carlos Pérez', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const c3 = batter({ id: '2024-ven-c3', teamCode: TEAM, era: ERA, zh: 'Carlos Pérez Jr.', en: 'Carlos Pérez Jr.', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2024-ven-1b1', teamCode: TEAM, era: ERA, zh: 'Ehire Adrianza', en: 'Ehire Adrianza', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2024-ven-2b1', teamCode: TEAM, era: ERA, zh: 'Alexi Amarista', en: 'Alexi Amarista', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2024-ven-3b1', teamCode: TEAM, era: ERA, zh: 'Diego Castillo', en: 'Diego Castillo', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2024-ven-ss1', teamCode: TEAM, era: ERA, zh: 'Dixon Machado', en: 'Dixon Machado', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2024-ven-1b2', teamCode: TEAM, era: ERA, zh: 'Jermaine Palacios', en: 'Jermaine Palacios', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2024-ven-2b2', teamCode: TEAM, era: ERA, zh: 'Hernán Pérez', en: 'Hernán Pérez', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2024-ven-3b2', teamCode: TEAM, era: ERA, zh: 'David Rodríguez', en: 'David Rodríguez', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配，剛好 3 人皆為先發）             */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2024-ven-lf1', teamCode: TEAM, era: ERA, zh: 'Ramón Flores', en: 'Ramón Flores', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2024-ven-cf1', teamCode: TEAM, era: ERA, zh: 'Ángel Reyes', en: 'Ángel Reyes', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2024-ven-rf1', teamCode: TEAM, era: ERA, zh: 'Herlis Rodríguez', en: 'Herlis Rodríguez', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2024-ven-manager', TEAM, ERA, '奧馬爾·洛佩茲', 'Omar López');

const coachingStaff = [
  coach('2024-ven-coach-1', TEAM, ERA, 'Robinson Chirinos', 'Robinson Chirinos', 'HEAD_COACH'),
  coach('2024-ven-coach-2', TEAM, ERA, 'Wilfredo Romero', 'Wilfredo Romero', 'BATTING_COACH'),
  coach('2024-ven-coach-3', TEAM, ERA, 'Gerardo Parra', 'Gerardo Parra', 'FIRST_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_VEN_2024: Roster = {
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
