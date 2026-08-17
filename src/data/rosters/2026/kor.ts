// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'KOR';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-kor-sp1', teamCode: TEAM, era: ERA, zh: 'Dane Dunning', en: 'Dane Dunning', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2026-kor-sp2', teamCode: TEAM, era: ERA, zh: '高佑錫', en: '高佑錫', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-kor-sp3', teamCode: TEAM, era: ERA, zh: '郭彬', en: '郭彬', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2026-kor-sp4', teamCode: TEAM, era: ERA, zh: '鄭優柱', en: '鄭優柱', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2026-kor-sp5', teamCode: TEAM, era: ERA, zh: '趙炳賢', en: '趙炳賢', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2026-kor-rp1', teamCode: TEAM, era: ERA, zh: '金澤延', en: '金澤延', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-kor-rp2', teamCode: TEAM, era: ERA, zh: '金英奎', en: '金英奎', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-kor-rp3', teamCode: TEAM, era: ERA, zh: '高永表', en: '高永表', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-kor-rp4', teamCode: TEAM, era: ERA, zh: '盧景銀', en: '盧景銀', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-kor-rp5', teamCode: TEAM, era: ERA, zh: '朴英賢', en: '朴英賢', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// 柳賢振：known 左投（MLB/KBO 生涯皆左投左打），throws 設為 L。
const rp6 = pitcher({ id: '2026-kor-rp6', teamCode: TEAM, era: ERA, zh: '柳賢振', en: '柳賢振', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp7 = pitcher({ id: '2026-kor-rp7', teamCode: TEAM, era: ERA, zh: '蘇亨準', en: '蘇亨準', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2026-kor-rp8', teamCode: TEAM, era: ERA, zh: '孫周永', en: '孫周永', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp9 = pitcher({ id: '2026-kor-rp9', teamCode: TEAM, era: ERA, zh: '宋勝基', en: '宋勝基', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-kor-cl1', teamCode: TEAM, era: ERA, zh: '劉英燦', en: '劉英燦', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2026-kor-c1', teamCode: TEAM, era: ERA, zh: '金亨俊', en: '金亨俊', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2026-kor-c2', teamCode: TEAM, era: ERA, zh: '朴東元', en: '朴東元', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-kor-1b1', teamCode: TEAM, era: ERA, zh: '金度永', en: '金度永', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-kor-2b1', teamCode: TEAM, era: ERA, zh: '金慧成', en: '金慧成', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-kor-3b1', teamCode: TEAM, era: ERA, zh: '金柱元', en: '金柱元', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2026-kor-ss1', teamCode: TEAM, era: ERA, zh: '文寶景', en: '文寶景', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2026-kor-1b2', teamCode: TEAM, era: ERA, zh: '盧施煥', en: '盧施煥', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2026-kor-2b2', teamCode: TEAM, era: ERA, zh: '申旻宰', en: '申旻宰', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-kor-3b2', teamCode: TEAM, era: ERA, zh: 'Shay Whitcomb', en: 'Shay Whitcomb', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2026-kor-lf1', teamCode: TEAM, era: ERA, zh: '安賢珉', en: '安賢珉', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-kor-cf1', teamCode: TEAM, era: ERA, zh: 'Jahmai Jones', en: 'Jahmai Jones', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2026-kor-rf1', teamCode: TEAM, era: ERA, zh: '具子昱', en: '具子昱', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-kor-lf2', teamCode: TEAM, era: ERA, zh: '李政厚', en: '李政厚', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-kor-cf2', teamCode: TEAM, era: ERA, zh: '文賢彬', en: '文賢彬', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of6 = batter({ id: '2026-kor-rf2', teamCode: TEAM, era: ERA, zh: '朴海旻', en: '朴海旻', jersey: null, battingOrder: null, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-kor-manager', TEAM, ERA, '柳志炫', 'Ryu Ji-hyun');

const coachingStaff = [
  coach('2026-kor-coach-1', TEAM, ERA, '姜榮壽', 'Kang Young-soo', 'HEAD_COACH'),
  coach('2026-kor-coach-2', TEAM, ERA, '金泰均', 'Kim Tae-kyun', 'BATTING_COACH'),
  coach('2026-kor-coach-3', TEAM, ERA, '鄭大炫', 'Chung Dae-hyun', 'PITCHING_COACH'),
  coach('2026-kor-coach-4', TEAM, ERA, '金昞賢', 'Kim Byung-hyun', 'BULLPEN_COACH'),
  coach('2026-kor-coach-5', TEAM, ERA, '朴鎮萬', 'Park Jin-man', 'INFIELD_OUTFIELD_COACH', bi('守備/跑壘教練', 'Defense & Baserunning Coach')),
  coach('2026-kor-coach-6', TEAM, ERA, '李晉暎', 'Lee Jin-young', 'INFIELD_OUTFIELD_COACH', bi('守備/跑壘教練', 'Defense & Baserunning Coach')),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_KOR_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, if6, if7, of4, of5, of6],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
