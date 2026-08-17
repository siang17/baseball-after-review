// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'TPE';
const ERA = 2024;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2024-tpe-sp1', teamCode: TEAM, era: ERA, zh: '張奕', en: '張奕', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2024-tpe-sp2', teamCode: TEAM, era: ERA, zh: '陳冠宇', en: '陳冠宇', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2024-tpe-sp3', teamCode: TEAM, era: ERA, zh: '陳柏清', en: '陳柏清', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp4 = pitcher({ id: '2024-tpe-sp4', teamCode: TEAM, era: ERA, zh: '陳冠偉', en: '陳冠偉', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp5 = pitcher({ id: '2024-tpe-sp5', teamCode: TEAM, era: ERA, zh: '江國豪', en: '江國豪', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

const rp1 = pitcher({ id: '2024-tpe-rp1', teamCode: TEAM, era: ERA, zh: '莊昕諺', en: '莊昕諺', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2024-tpe-rp2', teamCode: TEAM, era: ERA, zh: '黃子鵬', en: '黃子鵬', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2024-tpe-rp3', teamCode: TEAM, era: ERA, zh: '黃恩賜', en: '黃恩賜', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// 郭俊麟：中華隊/職棒known左投，throws 設為 L。
const rp4 = pitcher({ id: '2024-tpe-rp4', teamCode: TEAM, era: ERA, zh: '郭俊麟', en: '郭俊麟', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp5 = pitcher({ id: '2024-tpe-rp5', teamCode: TEAM, era: ERA, zh: '林昱珉', en: '林昱珉', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2024-tpe-rp6', teamCode: TEAM, era: ERA, zh: '林凱威', en: '林凱威', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2024-tpe-rp7', teamCode: TEAM, era: ERA, zh: '王志煊', en: '王志煊', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2024-tpe-cl1', teamCode: TEAM, era: ERA, zh: '吳俊偉', en: '吳俊偉', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

const c1 = batter({ id: '2024-tpe-c1', teamCode: TEAM, era: ERA, zh: '戴培峰', en: '戴培峰', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2024-tpe-c2', teamCode: TEAM, era: ERA, zh: '林家正', en: '林家正', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2024-tpe-1b1', teamCode: TEAM, era: ERA, zh: '張政禹', en: '張政禹', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2024-tpe-2b1', teamCode: TEAM, era: ERA, zh: '江坤宇', en: '江坤宇', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2024-tpe-3b1', teamCode: TEAM, era: ERA, zh: '朱育賢', en: '朱育賢', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2024-tpe-ss1', teamCode: TEAM, era: ERA, zh: '吉力吉撈・鞏冠', en: '吉力吉撈・鞏冠', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
const if5 = batter({ id: '2024-tpe-1b2', teamCode: TEAM, era: ERA, zh: '李凱威', en: '李凱威', jersey: null, battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if6 = batter({ id: '2024-tpe-2b2', teamCode: TEAM, era: ERA, zh: '林立', en: '林立', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2024-tpe-3b2', teamCode: TEAM, era: ERA, zh: '潘傑楷', en: '潘傑楷', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if8 = batter({ id: '2024-tpe-ss2', teamCode: TEAM, era: ERA, zh: '岳東華', en: '岳東華', jersey: null, battingOrder: null, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

const of1 = batter({ id: '2024-tpe-lf1', teamCode: TEAM, era: ERA, zh: '陳傑憲', en: '陳傑憲', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2024-tpe-cf1', teamCode: TEAM, era: ERA, zh: '陳晨威', en: '陳晨威', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of3 = batter({ id: '2024-tpe-rf1', teamCode: TEAM, era: ERA, zh: '邱智呈', en: '邱智呈', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2024-tpe-lf2', teamCode: TEAM, era: ERA, zh: '林安可', en: '林安可', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2024-tpe-cf2', teamCode: TEAM, era: ERA, zh: '曾頌恩', en: '曾頌恩', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2024-tpe-manager', TEAM, ERA, '曾豪駒', '曾豪駒');

const coachingStaff = [
  coach('2024-tpe-coach-1', TEAM, ERA, '高志綱', '高志綱', 'HEAD_COACH'),
  coach('2024-tpe-coach-2', TEAM, ERA, '王建民', '王建民', 'PITCHING_COACH'),
  coach('2024-tpe-coach-3', TEAM, ERA, '彭政閔', '彭政閔', 'BATTING_COACH'),
  coach('2024-tpe-coach-4', TEAM, ERA, '陳江和', '陳江和', 'INFIELD_COACH'),
  coach('2024-tpe-coach-5', TEAM, ERA, '張建銘', '張建銘', 'INFIELD_OUTFIELD_COACH', bi('外野守備兼跑壘教練', 'Outfield Defense & Baserunning Coach')),
  coach('2024-tpe-coach-6', TEAM, ERA, '劉品辰', '劉品辰', 'CONDITIONING_COACH'),
  coach('2024-tpe-coach-7', TEAM, ERA, '洪全億', '洪全億', 'CONDITIONING_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_TPE_2024: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'PREMIER12_2024',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, if5],
  bench: [c2, if6, if7, if8, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
