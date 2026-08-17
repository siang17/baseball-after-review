// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'DOM';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-dom-sp1', teamCode: TEAM, era: ERA, zh: 'Albert Abreu', en: 'Albert Abreu', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2026-dom-sp2', teamCode: TEAM, era: ERA, zh: 'Sandy Alcántara', en: 'Sandy Alcántara', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-dom-sp3', teamCode: TEAM, era: ERA, zh: 'Elvis Alvarado', en: 'Elvis Alvarado', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-dom-sp4', teamCode: TEAM, era: ERA, zh: 'Brayan Bello', en: 'Brayan Bello', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-dom-sp5', teamCode: TEAM, era: ERA, zh: 'Huascar Brazobán', en: 'Huascar Brazobán', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-dom-rp1', teamCode: TEAM, era: ERA, zh: 'Seranthony Domínguez', en: 'Seranthony Domínguez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-dom-rp2', teamCode: TEAM, era: ERA, zh: 'Camilo Doval', en: 'Camilo Doval', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-dom-rp3', teamCode: TEAM, era: ERA, zh: 'Carlos Estévez', en: 'Carlos Estévez', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-dom-rp4', teamCode: TEAM, era: ERA, zh: 'Juan Mejía', en: 'Juan Mejía', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Wandy Peralta：known 左投終結牛棚，throws 設為 L。
const rp5 = pitcher({ id: '2026-dom-rp5', teamCode: TEAM, era: ERA, zh: 'Wandy Peralta', en: 'Wandy Peralta', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp6 = pitcher({ id: '2026-dom-rp6', teamCode: TEAM, era: ERA, zh: 'Dennis Santana', en: 'Dennis Santana', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-dom-rp7', teamCode: TEAM, era: ERA, zh: 'Luis Severino', en: 'Luis Severino', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Gregory Soto：known 左投，throws 設為 L。
const rp8 = pitcher({ id: '2026-dom-rp8', teamCode: TEAM, era: ERA, zh: 'Gregory Soto', en: 'Gregory Soto', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
// Cristopher Sánchez：known 左投先發／中繼，throws 設為 L。
const rp9 = pitcher({ id: '2026-dom-rp9', teamCode: TEAM, era: ERA, zh: 'Cristopher Sánchez', en: 'Cristopher Sánchez', jersey: null, role: 'RP', throws: 'L', gate: TEAM });

const cl1 = pitcher({ id: '2026-dom-cl1', teamCode: TEAM, era: ERA, zh: 'Abner Uribe', en: 'Abner Uribe', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2026-dom-c1', teamCode: TEAM, era: ERA, zh: 'Agustín Ramírez', en: 'Agustín Ramírez', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Austin Wells：known 左打捕手，bats 設為 L。
const c2 = batter({ id: '2026-dom-c2', teamCode: TEAM, era: ERA, zh: 'Austin Wells', en: 'Austin Wells', jersey: null, battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-dom-1b1', teamCode: TEAM, era: ERA, zh: 'Junior Caminero', en: 'Junior Caminero', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-dom-2b1', teamCode: TEAM, era: ERA, zh: 'Erik González', en: 'Erik González', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-dom-3b1', teamCode: TEAM, era: ERA, zh: 'Vladimir Guerrero Jr.', en: 'Vladimir Guerrero Jr.', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2026-dom-ss1', teamCode: TEAM, era: ERA, zh: 'Manny Machado', en: 'Manny Machado', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
// Ketel Marte：known 切換打者，bats 設為 S。
const if5 = batter({ id: '2026-dom-1b2', teamCode: TEAM, era: ERA, zh: 'Ketel Marte', en: 'Ketel Marte', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'S', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Geraldo Perdomo：known 切換打者，bats 設為 S。
const if6 = batter({ id: '2026-dom-2b2', teamCode: TEAM, era: ERA, zh: 'Geraldo Perdomo', en: 'Geraldo Perdomo', jersey: null, battingOrder: null, positions: ['2B'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-dom-3b2', teamCode: TEAM, era: ERA, zh: 'Amed Rosario', en: 'Amed Rosario', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Carlos Santana：known 切換打者，bats 設為 S。
const if8 = batter({ id: '2026-dom-ss2', teamCode: TEAM, era: ERA, zh: 'Carlos Santana', en: 'Carlos Santana', jersey: null, battingOrder: null, positions: ['SS'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Oneil Cruz：known 左打右投，bats 設為 L。
const of1 = batter({ id: '2026-dom-lf1', teamCode: TEAM, era: ERA, zh: 'Oneil Cruz', en: 'Oneil Cruz', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-dom-cf1', teamCode: TEAM, era: ERA, zh: 'Junior Lake', en: 'Junior Lake', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-dom-rf1', teamCode: TEAM, era: ERA, zh: 'Julio Rodríguez', en: 'Julio Rodríguez', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// Juan Soto：known 左打左投，bats/throws 設為 L。
const of4 = batter({ id: '2026-dom-lf2', teamCode: TEAM, era: ERA, zh: 'Juan Soto', en: 'Juan Soto', jersey: null, battingOrder: null, positions: ['LF'], bats: 'L', throws: 'L', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-dom-cf2', teamCode: TEAM, era: ERA, zh: 'Fernando Tatis Jr.', en: 'Fernando Tatis Jr.', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-dom-manager', TEAM, ERA, '亞伯特·普荷斯', 'Albert Pujols');

const coachingStaff = [
  coach('2026-dom-coach-1', TEAM, ERA, 'Plácido Polanco', 'Plácido Polanco', 'HEAD_COACH'),
  coach('2026-dom-coach-2', TEAM, ERA, 'Rene Rojas', 'Rene Rojas', 'BATTING_COACH'),
  coach('2026-dom-coach-3', TEAM, ERA, 'Jorge Posada', 'Jorge Posada', 'ASSISTANT_BATTING_COACH'),
  coach('2026-dom-coach-4', TEAM, ERA, 'Wellington Cepeda', 'Wellington Cepeda', 'PITCHING_COACH'),
  coach('2026-dom-coach-5', TEAM, ERA, 'José Canó', 'José Canó', 'BULLPEN_COACH'),
  coach('2026-dom-coach-6', TEAM, ERA, 'Julio Borbón', 'Julio Borbón', 'FIRST_BASE_COACH'),
  coach('2026-dom-coach-7', TEAM, ERA, 'Carlos Febles', 'Carlos Febles', 'THIRD_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_DOM_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, if6, if7, if8, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
