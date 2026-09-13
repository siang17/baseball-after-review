// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，詳見 builders.ts 開頭說明。
// 全隊 21 位球員的統計數字已套用使用者提供的試算表「選手名冊 數據分析.xlsx」
// （2026-09-12）2024 年 12 強真實球季數據為準。試算表未涵蓋 wRC+/WAR/平均擊球初速/
// 離壘速度/FIP/BB9/平均球速等進階欄位，一律維持 null，不臆測。K/9 由試算表的奪三振數與
// 局數換算得出。名單原有一位球員姓名（磯畑龍太）與試算表對不上，已更正為
// 試算表列出的真實球員「五十幡亮汰」。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'JPN';
const ERA = 2024;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// 來源：選手名冊 數據分析.xlsx。
const sp1 = pitcher({
  id: '2024-jpn-sp1', teamCode: TEAM, era: ERA, zh: '藤平尚真', en: '藤平尚真', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realPitching: {
    era: 1.75, whip: 0.88, eraPlus: null, fip: null, war: null,
    k9: 11.27, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 47, ip: 46.1, so: 58, pitches: 689,
    vsLHB: { bf: 22, avg: 0.177, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 24, avg: 0.183, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 早川隆久：已知左投（東北樂天ゴールデンイーグルス生涯為左投），throws 設為 L。
// 來源：選手名冊 數據分析.xlsx。
const sp2 = pitcher({
  id: '2024-jpn-sp2', teamCode: TEAM, era: ERA, zh: '早川隆久', en: '早川隆久', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realPitching: {
    era: 2.54, whip: 1.12, eraPlus: null, fip: null, war: null,
    k9: 8.45, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 25, ip: 170.1, so: 160, pitches: 2681,
    vsLHB: { bf: 65.1, avg: 0.235, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 104.1, avg: 0.247, obp: null, slg: null, ops: null, hr: 7 },
  },
});
// 井上溫大：試算表標記為左投，throws 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const sp3 = pitcher({
  id: '2024-jpn-sp3', teamCode: TEAM, era: ERA, zh: '井上溫大', en: '井上溫大', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  club: bi('讀賣巨人', 'Yomiuri Giants'),
  realPitching: {
    era: 2.76, whip: 1.13, eraPlus: null, fip: null, war: null,
    k9: 8.82, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 25, ip: 101.0, so: 99, pitches: 1596,
    vsLHB: { bf: 38.2, avg: 0.270, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 60.2, avg: 0.205, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const sp4 = pitcher({
  id: '2024-jpn-sp4', teamCode: TEAM, era: ERA, zh: '北山亘基', en: '北山亘基', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realPitching: {
    era: 2.31, whip: 0.98, eraPlus: null, fip: null, war: null,
    k9: 9.59, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 14, ip: 81.2, so: 87, pitches: 1314,
    vsLHB: { bf: 42.2, avg: 0.206, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 37.1, avg: 0.160, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const sp5 = pitcher({
  id: '2024-jpn-sp5', teamCode: TEAM, era: ERA, zh: '翁田大勢', en: '翁田大勢', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('讀賣巨人', 'Yomiuri Giants'),
  realPitching: {
    era: 0.88, whip: 0.88, eraPlus: null, fip: null, war: null,
    k9: 11.85, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 43, ip: 41.0, so: 54, pitches: 604,
    vsLHB: { bf: 23.2, avg: 0.182, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 17.1, avg: 0.190, obp: null, slg: null, ops: null, hr: 0 },
  },
});

// 來源：選手名冊 數據分析.xlsx。
const rp1 = pitcher({
  id: '2024-jpn-rp1', teamCode: TEAM, era: ERA, zh: '才木浩人', en: '才木浩人', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realPitching: {
    era: 1.83, whip: 1.06, eraPlus: null, fip: null, war: null,
    k9: 7.35, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 25, ip: 167.2, so: 137, pitches: 2701,
    vsLHB: { bf: 86.1, avg: 0.225, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 80.1, avg: 0.228, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp2 = pitcher({
  id: '2024-jpn-rp2', teamCode: TEAM, era: ERA, zh: '清水達也', en: '清水達也', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('中日龍', 'Chunichi Dragons'),
  realPitching: {
    era: 1.40, whip: 1.02, eraPlus: null, fip: null, war: null,
    k9: 8.07, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 60, ip: 58.0, so: 52, pitches: 893,
    vsLHB: { bf: 31.2, avg: 0.155, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 26, avg: 0.253, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 隅田知一郎：已知左投（西武ライオンズ生涯為左投）。來源：選手名冊 數據分析.xlsx。
const rp3 = pitcher({
  id: '2024-jpn-rp3', teamCode: TEAM, era: ERA, zh: '隅田知一郎', en: '隅田知一郎', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realPitching: {
    era: 2.76, whip: 1.09, eraPlus: null, fip: null, war: null,
    k9: 7.73, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 26, ip: 179.1, so: 154, pitches: 2643,
    vsLHB: { bf: 86, avg: 0.275, obp: null, slg: null, ops: null, hr: 5 },
    vsRHB: { bf: 90.1, avg: 0.207, obp: null, slg: null, ops: null, hr: 6 },
  },
});
// 鈴木翔天：試算表標記為左投，throws 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const rp4 = pitcher({
  id: '2024-jpn-rp4', teamCode: TEAM, era: ERA, zh: '鈴木翔天', en: '鈴木翔天', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realPitching: {
    era: 1.66, whip: 0.92, eraPlus: null, fip: null, war: null,
    k9: 8.88, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 49, ip: 48.2, so: 48, pitches: 769,
    vsLHB: { bf: 23, avg: 0.143, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 25, avg: 0.155, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 鈴木昭汰：試算表標記為左投，throws 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const rp5 = pitcher({
  id: '2024-jpn-rp5', teamCode: TEAM, era: ERA, zh: '鈴木昭汰', en: '鈴木昭汰', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('千葉羅德海洋', 'Chiba Lotte Marines'),
  realPitching: {
    era: 0.73, whip: 1.01, eraPlus: null, fip: null, war: null,
    k9: 7.66, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 51, ip: 49.1, so: 42, pitches: 757,
    vsLHB: { bf: 25, avg: 0.209, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 23.2, avg: 0.165, obp: null, slg: null, ops: null, hr: 1 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp6 = pitcher({
  id: '2024-jpn-rp6', teamCode: TEAM, era: ERA, zh: '髙橋宏斗', en: '髙橋宏斗', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('中日龍', 'Chunichi Dragons'),
  realPitching: {
    era: 1.38, whip: 0.98, eraPlus: null, fip: null, war: null,
    k9: 8.14, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 21, ip: 143.2, so: 130, pitches: 2196,
    vsLHB: { bf: 80.2, avg: 0.235, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 62.1, avg: 0.167, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp7 = pitcher({
  id: '2024-jpn-rp7', teamCode: TEAM, era: ERA, zh: '戸郷翔征', en: '戸郷翔征', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('讀賣巨人', 'Yomiuri Giants'),
  realPitching: {
    era: 1.95, whip: 0.96, eraPlus: null, fip: null, war: null,
    k9: 7.80, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 26, ip: 180.0, so: 156, pitches: 2828,
    vsLHB: { bf: 48.2, avg: 0.315, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 86.2, avg: 0.166, obp: null, slg: null, ops: null, hr: 9 },
  },
});

// 來源：選手名冊 數據分析.xlsx。
const cl1 = pitcher({
  id: '2024-jpn-cl1', teamCode: TEAM, era: ERA, zh: '横山陸人', en: '横山陸人', jersey: null,
  role: 'CL', throws: 'R', gate: TEAM,
  club: bi('千葉羅德海洋', 'Chiba Lotte Marines'),
  realPitching: {
    era: 1.71, whip: 0.95, eraPlus: null, fip: null, war: null,
    k9: 7.93, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 43, ip: 42.0, so: 37, pitches: 652,
    vsLHB: { bf: 22.2, avg: 0.139, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 19.1, avg: 0.229, obp: null, slg: null, ops: null, hr: 1 },
  },
});

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// 來源：選手名冊 數據分析.xlsx。
const c1 = batter({
  id: '2024-jpn-c1', teamCode: TEAM, era: ERA, zh: '古賀悠斗', en: '古賀悠斗', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realBatting: {
    avg: 0.228, obp: 0.286, slg: 0.285, ops: 0.570,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.211, exitVelocity: null, sprintSpeed: null,
    g: 105, h: 56, hr: 3, so: 58,
    vsLHP: { pa: 45, avg: 0.250, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 76, avg: 0.215, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 坂倉將吾：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const c2 = batter({
  id: '2024-jpn-c2', teamCode: TEAM, era: ERA, zh: '坂倉將吾', en: '坂倉將吾', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('廣島東洋鯉魚', 'Hiroshima Toyo Carp'),
  realBatting: {
    avg: 0.279, obp: 0.328, slg: 0.412, ops: 0.740,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.201, exitVelocity: null, sprintSpeed: null,
    g: 121, h: 119, hr: 12, so: 80,
    vsLHP: { pa: 79, avg: 0.290, obp: null, slg: null, ops: null, hr: 4 },
    vsRHP: { pa: 103, avg: 0.272, obp: null, slg: null, ops: null, hr: 8 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const c3 = batter({
  id: '2024-jpn-c3', teamCode: TEAM, era: ERA, zh: '佐藤都志也', en: '佐藤都志也', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('千葉羅德海洋', 'Chiba Lotte Marines'),
  realBatting: {
    avg: 0.278, obp: 0.326, slg: 0.363, ops: 0.689,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.151, exitVelocity: null, sprintSpeed: null,
    g: 116, h: 114, hr: 5, so: 51,
    vsLHP: { pa: 64, avg: 0.289, obp: null, slg: null, ops: null, hr: 2 },
    vsRHP: { pa: 102, avg: 0.273, obp: null, slg: null, ops: null, hr: 3 },
  },
});

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// 源田壯亮：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if1 = batter({
  id: '2024-jpn-1b1', teamCode: TEAM, era: ERA, zh: '源田壯亮', en: '源田壯亮', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realBatting: {
    avg: 0.264, obp: 0.307, slg: 0.337, ops: 0.644,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.131, exitVelocity: null, sprintSpeed: null,
    g: 143, h: 138, hr: 3, so: 75,
    vsLHP: { pa: 86, avg: 0.288, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 125, avg: 0.250, obp: null, slg: null, ops: null, hr: 3 },
  },
});
// 清宮幸太郎：known 左打（日本ハムファイターズ）。來源：選手名冊 數據分析.xlsx。
const if2 = batter({
  id: '2024-jpn-2b1', teamCode: TEAM, era: ERA, zh: '清宮幸太郎', en: '清宮幸太郎', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realBatting: {
    avg: 0.300, obp: 0.374, slg: 0.524, ops: 0.898,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.265, exitVelocity: null, sprintSpeed: null,
    g: 89, h: 87, hr: 15, so: 62,
    vsLHP: { pa: 47, avg: 0.286, obp: null, slg: null, ops: null, hr: 2 },
    vsRHP: { pa: 79, avg: 0.308, obp: null, slg: null, ops: null, hr: 13 },
  },
});
// 小園海斗：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if3 = batter({
  id: '2024-jpn-3b1', teamCode: TEAM, era: ERA, zh: '小園海斗', en: '小園海斗', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('廣島東洋鯉魚', 'Hiroshima Toyo Carp'),
  realBatting: {
    avg: 0.280, obp: 0.322, slg: 0.330, ops: 0.651,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.170, exitVelocity: null, sprintSpeed: null,
    g: 143, h: 151, hr: 2, so: 53,
    vsLHP: { pa: 99, avg: 0.329, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 120, avg: 0.244, obp: null, slg: null, ops: null, hr: 1 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if4 = batter({
  id: '2024-jpn-ss1', teamCode: TEAM, era: ERA, zh: '紅林弘太郎', en: '紅林弘太郎', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('歐力士野牛', 'Orix Buffaloes'),
  realBatting: {
    avg: 0.247, obp: 0.305, slg: 0.314, ops: 0.619,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.146, exitVelocity: null, sprintSpeed: null,
    g: 136, h: 115, hr: 2, so: 74,
    vsLHP: { pa: 74, avg: 0.271, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 122, avg: 0.237, obp: null, slg: null, ops: null, hr: 1 },
  },
});
// 第 5 位內野手（輪到 1B）：無指定打擊人選時，遞補打線第 9 棒，守位維持輪值分配到的 1B。
// 栗原陵矢：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if5 = batter({
  id: '2024-jpn-1b2', teamCode: TEAM, era: ERA, zh: '栗原陵矢', en: '栗原陵矢', jersey: null,
  battingOrder: 9, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.273, obp: 0.337, slg: 0.471, ops: 0.807,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.240, exitVelocity: null, sprintSpeed: null,
    g: 140, h: 144, hr: 20, so: 99,
    vsLHP: { pa: 91, avg: 0.249, obp: null, slg: null, ops: null, hr: 5 },
    vsRHP: { pa: 125, avg: 0.292, obp: null, slg: null, ops: null, hr: 15 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if6 = batter({
  id: '2024-jpn-2b2', teamCode: TEAM, era: ERA, zh: '牧秀悟', en: '牧秀悟', jersey: null,
  battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('橫濱DeNA灣星', 'Yokohama DeNA BayStars'),
  realBatting: {
    avg: 0.294, obp: 0.346, slg: 0.491, ops: 0.837,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.155, exitVelocity: null, sprintSpeed: null,
    g: 133, h: 152, hr: 23, so: 59,
    vsLHP: { pa: 66, avg: 0.248, obp: null, slg: null, ops: null, hr: 9 },
    vsRHP: { pa: 121, avg: 0.313, obp: null, slg: null, ops: null, hr: 14 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if7 = batter({
  id: '2024-jpn-3b2', teamCode: TEAM, era: ERA, zh: '村林一輝', en: '村林一輝', jersey: null,
  battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realBatting: {
    avg: 0.241, obp: 0.270, slg: 0.313, ops: 0.583,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.146, exitVelocity: null, sprintSpeed: null,
    g: 139, h: 125, hr: 6, so: 91,
    vsLHP: { pa: 85, avg: 0.245, obp: null, slg: null, ops: null, hr: 4 },
    vsRHP: { pa: 115, avg: 0.239, obp: null, slg: null, ops: null, hr: 2 },
  },
});

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// ⚠️ 原名單此位置誤植為「磯畑龍太」，試算表列出的真實球員是「五十幡亮汰」，已更正姓名。
// 試算表標記為左打，bats 設為 L。來源：選手名冊 數據分析.xlsx。
const of1 = batter({
  id: '2024-jpn-lf1', teamCode: TEAM, era: ERA, zh: '五十幡亮汰', en: '五十幡亮汰', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realBatting: {
    avg: 0.161, obp: 0.210, slg: 0.196, ops: 0.407,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.242, exitVelocity: null, sprintSpeed: null,
    g: 94, h: 18, hr: 0, so: 34,
    vsLHP: { pa: 7, avg: 0.154, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 52, avg: 0.163, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const of2 = batter({
  id: '2024-jpn-cf1', teamCode: TEAM, era: ERA, zh: '桑原將志', en: '桑原將志', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('橫濱DeNA灣星', 'Yokohama DeNA BayStars'),
  realBatting: {
    avg: 0.270, obp: 0.321, slg: 0.365, ops: 0.685,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.181, exitVelocity: null, sprintSpeed: null,
    g: 106, h: 77, hr: 5, so: 42,
    vsLHP: { pa: 51, avg: 0.292, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 72, avg: 0.257, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const of3 = batter({
  id: '2024-jpn-rf1', teamCode: TEAM, era: ERA, zh: '森下翔太', en: '森下翔太', jersey: null,
  battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realBatting: {
    avg: 0.275, obp: 0.363, slg: 0.441, ops: 0.804,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.175, exitVelocity: null, sprintSpeed: null,
    g: 129, h: 126, hr: 16, so: 78,
    vsLHP: { pa: 70, avg: 0.283, obp: null, slg: null, ops: null, hr: 6 },
    vsRHP: { pa: 115, avg: 0.272, obp: null, slg: null, ops: null, hr: 10 },
  },
});
// 佐野惠太：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const of4 = batter({
  id: '2024-jpn-lf2', teamCode: TEAM, era: ERA, zh: '佐野惠太', en: '佐野惠太', jersey: null,
  battingOrder: null, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('橫濱DeNA灣星', 'Yokohama DeNA BayStars'),
  realBatting: {
    avg: 0.273, obp: 0.322, slg: 0.384, ops: 0.705,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.121, exitVelocity: null, sprintSpeed: null,
    g: 139, h: 143, hr: 8, so: 53,
    vsLHP: { pa: 80, avg: 0.240, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 117, avg: 0.289, obp: null, slg: null, ops: null, hr: 5 },
  },
});
// 辰己涼介：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const of5 = batter({
  id: '2024-jpn-cf2', teamCode: TEAM, era: ERA, zh: '辰己涼介', en: '辰己涼介', jersey: null,
  battingOrder: null, positions: ['CF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realBatting: {
    avg: 0.294, obp: 0.353, slg: 0.419, ops: 0.772,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.238, exitVelocity: null, sprintSpeed: null,
    g: 143, h: 158, hr: 7, so: 108,
    vsLHP: { pa: 94, avg: 0.270, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 121, avg: 0.311, obp: null, slg: null, ops: null, hr: 4 },
  },
});

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
