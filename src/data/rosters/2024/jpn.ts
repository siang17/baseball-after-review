// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'JPN';
const ERA = 2024;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2024-jpn-sp1', teamCode: TEAM, era: ERA, zh: '藤平尚真', en: '藤平尚真', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
// 早川隆久：known 左投（西武ライオンズ）。
const sp2 = pitcher({ id: '2024-jpn-sp2', teamCode: TEAM, era: ERA, zh: '早川隆久', en: '早川隆久', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp3 = pitcher({ id: '2024-jpn-sp3', teamCode: TEAM, era: ERA, zh: '井上溫大', en: '井上溫大', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2024-jpn-sp4', teamCode: TEAM, era: ERA, zh: '北山亘基', en: '北山亘基', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2024-jpn-sp5', teamCode: TEAM, era: ERA, zh: '翁田大勢', en: '翁田大勢', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2024-jpn-rp1', teamCode: TEAM, era: ERA, zh: '才木浩人', en: '才木浩人', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2024-jpn-rp2', teamCode: TEAM, era: ERA, zh: '清水達也', en: '清水達也', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// 隅田知一郎：known 左投（西武ライオンズ）。
const rp3 = pitcher({ id: '2024-jpn-rp3', teamCode: TEAM, era: ERA, zh: '隅田知一郎', en: '隅田知一郎', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp4 = pitcher({ id: '2024-jpn-rp4', teamCode: TEAM, era: ERA, zh: '鈴木翔天', en: '鈴木翔天', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2024-jpn-rp5', teamCode: TEAM, era: ERA, zh: '鈴木昭汰', en: '鈴木昭汰', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2024-jpn-rp6', teamCode: TEAM, era: ERA, zh: '髙橋宏斗', en: '髙橋宏斗', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2024-jpn-rp7', teamCode: TEAM, era: ERA, zh: '戸郷翔征', en: '戸郷翔征', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2024-jpn-cl1', teamCode: TEAM, era: ERA, zh: '横山陸人', en: '横山陸人', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2024-jpn-c1', teamCode: TEAM, era: ERA, zh: '古賀悠斗', en: '古賀悠斗', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2024-jpn-c2', teamCode: TEAM, era: ERA, zh: '坂倉將吾', en: '坂倉將吾', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const c3 = batter({ id: '2024-jpn-c3', teamCode: TEAM, era: ERA, zh: '佐藤都志也', en: '佐藤都志也', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2024-jpn-1b1', teamCode: TEAM, era: ERA, zh: '源田壯亮', en: '源田壯亮', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 清宮幸太郎：known 左打（日本ハムファイターズ）。
const if2 = batter({ id: '2024-jpn-2b1', teamCode: TEAM, era: ERA, zh: '清宮幸太郎', en: '清宮幸太郎', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2024-jpn-3b1', teamCode: TEAM, era: ERA, zh: '小園海斗', en: '小園海斗', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2024-jpn-ss1', teamCode: TEAM, era: ERA, zh: '紅林弘太郎', en: '紅林弘太郎', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2024-jpn-1b2', teamCode: TEAM, era: ERA, zh: '栗原陵矢', en: '栗原陵矢', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2024-jpn-2b2', teamCode: TEAM, era: ERA, zh: '牧秀悟', en: '牧秀悟', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2024-jpn-3b2', teamCode: TEAM, era: ERA, zh: '村林一輝', en: '村林一輝', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2024-jpn-lf1', teamCode: TEAM, era: ERA, zh: '磯畑龍太', en: '磯畑龍太', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2024-jpn-cf1', teamCode: TEAM, era: ERA, zh: '桑原將志', en: '桑原將志', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2024-jpn-rf1', teamCode: TEAM, era: ERA, zh: '森下翔太', en: '森下翔太', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2024-jpn-lf2', teamCode: TEAM, era: ERA, zh: '佐野恵太', en: '佐野恵太', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2024-jpn-cf2', teamCode: TEAM, era: ERA, zh: '辰己涼介', en: '辰己涼介', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2024-jpn-manager', TEAM, ERA, '井端弘和', '井端弘和');

const coachingStaff = [
  coach('2024-jpn-coach-1', TEAM, ERA, '金子誠', '金子誠', 'HEAD_COACH'),
  coach('2024-jpn-coach-2', TEAM, ERA, '吉見一起', '吉見一起', 'PITCHING_COACH'),
  coach('2024-jpn-coach-3', TEAM, ERA, '龜井善行', '龜井善行', 'BATTING_COACH'),
  coach('2024-jpn-coach-4', TEAM, ERA, '梵英心', '梵英心', 'BATTING_COACH'),
  coach('2024-jpn-coach-5', TEAM, ERA, '村田善則', '村田善則', 'TACTICAL_COACH', bi('投捕/戰術教練', 'Battery & Tactical Coach')),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_JPN_2024: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'PREMIER12_2024',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, c3, if6, if7, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
