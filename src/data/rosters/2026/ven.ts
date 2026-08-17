// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'VEN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// José Álvarez：已知左投（MLB 生涯多年為左投後援），throws 設為 L。
const sp1 = pitcher({ id: '2026-ven-sp1', teamCode: TEAM, era: ERA, zh: 'José Álvarez', en: 'José Álvarez', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp2 = pitcher({ id: '2026-ven-sp2', teamCode: TEAM, era: ERA, zh: 'Luinder Ávila', en: 'Luinder Ávila', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-ven-sp3', teamCode: TEAM, era: ERA, zh: 'Eduard Bazardo', en: 'Eduard Bazardo', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-ven-sp4', teamCode: TEAM, era: ERA, zh: 'José Buttó', en: 'José Buttó', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-ven-sp5', teamCode: TEAM, era: ERA, zh: 'Enmanuel De Jesús', en: 'Enmanuel De Jesús', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

// Jhonathan Díaz：已知左投，throws 設為 L。
const rp1 = pitcher({ id: '2026-ven-rp1', teamCode: TEAM, era: ERA, zh: 'Jhonathan Díaz', en: 'Jhonathan Díaz', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp2 = pitcher({ id: '2026-ven-rp2', teamCode: TEAM, era: ERA, zh: 'Carlos Guzmán', en: 'Carlos Guzmán', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-ven-rp3', teamCode: TEAM, era: ERA, zh: 'Andrés Machado', en: 'Andrés Machado', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-ven-rp4', teamCode: TEAM, era: ERA, zh: 'Anthony Molina', en: 'Anthony Molina', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-ven-rp5', teamCode: TEAM, era: ERA, zh: 'Keider Montero', en: 'Keider Montero', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2026-ven-rp6', teamCode: TEAM, era: ERA, zh: 'Daniel Palencia', en: 'Daniel Palencia', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Eduardo Rodríguez：已知左投（MLB 生涯多年為左投先發），throws 設為 L。
const rp7 = pitcher({ id: '2026-ven-rp7', teamCode: TEAM, era: ERA, zh: 'Eduardo Rodríguez', en: 'Eduardo Rodríguez', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp8 = pitcher({ id: '2026-ven-rp8', teamCode: TEAM, era: ERA, zh: 'Antonio Senzatela', en: 'Antonio Senzatela', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2026-ven-rp9', teamCode: TEAM, era: ERA, zh: 'Christian Suárez', en: 'Christian Suárez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Ranger Suárez：已知左投（MLB Phillies 生涯為左投先發），throws 設為 L。
const rp10 = pitcher({ id: '2026-ven-rp10', teamCode: TEAM, era: ERA, zh: 'Ranger Suárez', en: 'Ranger Suárez', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
// Ricardo Sánchez：已知左投，throws 設為 L。
const rp11 = pitcher({ id: '2026-ven-rp11', teamCode: TEAM, era: ERA, zh: 'Ricardo Sánchez', en: 'Ricardo Sánchez', jersey: null, role: 'RP', throws: 'L', gate: TEAM });

// Ángel Zerpa：已知左投，throws 設為 L。
const cl1 = pitcher({ id: '2026-ven-cl1', teamCode: TEAM, era: ERA, zh: 'Ángel Zerpa', en: 'Ángel Zerpa', jersey: null, role: 'CL', throws: 'L', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// William Contreras：已知左打（MLB Brewers 生涯為左打），bats 設為 L。
const c1 = batter({ id: '2026-ven-c1', teamCode: TEAM, era: ERA, zh: 'William Contreras', en: 'William Contreras', jersey: null, battingOrder: 1, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2026-ven-c2', teamCode: TEAM, era: ERA, zh: 'Salvador Pérez', en: 'Salvador Pérez', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// Luis Arráez：已知左打（生涯知名左打接觸型打者），bats 設為 L。
const if1 = batter({ id: '2026-ven-1b1', teamCode: TEAM, era: ERA, zh: 'Luis Arráez', en: 'Luis Arráez', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-ven-2b1', teamCode: TEAM, era: ERA, zh: 'Willson Contreras', en: 'Willson Contreras', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Maikel García：已知左打，bats 設為 L。
const if3 = batter({ id: '2026-ven-3b1', teamCode: TEAM, era: ERA, zh: 'Maikel García', en: 'Maikel García', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Andrés Giménez：已知左打（MLB Guardians 生涯為左打），bats 設為 L。
const if4 = batter({ id: '2026-ven-ss1', teamCode: TEAM, era: ERA, zh: 'Andrés Giménez', en: 'Andrés Giménez', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：此隊無指定打擊人選，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2026-ven-1b2', teamCode: TEAM, era: ERA, zh: 'Eugenio Suárez', en: 'Eugenio Suárez', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Gleyber Torres：已知switch hitter，bats 設為 S。
const if6 = batter({ id: '2026-ven-2b2', teamCode: TEAM, era: ERA, zh: 'Gleyber Torres', en: 'Gleyber Torres', jersey: null, battingOrder: null, positions: ['2B'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-ven-3b2', teamCode: TEAM, era: ERA, zh: 'Ezequiel Tovar', en: 'Ezequiel Tovar', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2026-ven-lf1', teamCode: TEAM, era: ERA, zh: 'Wilyer Abreu', en: 'Wilyer Abreu', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-ven-cf1', teamCode: TEAM, era: ERA, zh: 'Ronald Acuña Jr.', en: 'Ronald Acuña Jr.', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-ven-rf1', teamCode: TEAM, era: ERA, zh: 'Jackson Chourio', en: 'Jackson Chourio', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-ven-lf2', teamCode: TEAM, era: ERA, zh: 'Javier Sanoja', en: 'Javier Sanoja', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-ven-manager', TEAM, ERA, '奧馬爾·洛佩茲', 'Omar López');

const coachingStaff = [
  coach('2026-ven-coach-1', TEAM, ERA, 'Carlos Mendoza', 'Carlos Mendoza', 'HEAD_COACH'),
  coach('2026-ven-coach-2', TEAM, ERA, 'Victor Martinez', 'Victor Martinez', 'BATTING_COACH'),
  coach('2026-ven-coach-3', TEAM, ERA, 'Johan Santana', 'Johan Santana', 'PITCHING_COACH'),
  coach('2026-ven-coach-4', TEAM, ERA, 'Francisco Rodríguez', 'Francisco Rodríguez', 'BULLPEN_COACH'),
  coach('2026-ven-coach-5', TEAM, ERA, 'Gerardo Parra', 'Gerardo Parra', 'FIRST_BASE_COACH'),
  // José Altuve：來源指出他為三壘指導教練並榮譽兼任戰術教練，roleLabel 保留原始合併職稱。
  coach('2026-ven-coach-6', TEAM, ERA, 'José Altuve', 'José Altuve', 'THIRD_BASE_COACH', bi('三壘指導教練（榮譽兼任戰術教練）', 'Third Base Coach (Honorary Tactical Coach)')),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_VEN_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, if6, if7, of4],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9, rp10, rp11],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
