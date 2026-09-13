// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，詳見 builders.ts 開頭說明。
// 全隊 22 位球員（含替補、牛棚、遺珠）已套用使用者提供的試算表「選手名冊 數據分析.xlsx」
// （2026-09-12）2025 真實球季數據為準；試算表沒有涵蓋的進階欄位（wRC+/WAR/平均擊球初速/
// 離壘速度/FIP/BB9/平均球速）若先前已由網路查證取得且與試算表不衝突，予以保留，
// 否則維持 null，不臆測。K/9 由試算表的奪三振數與局數換算得出。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, RosterSnub, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'JPN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// ⚠️ 藤平尚真真實身分是後援投手（2025 年 62 場出賽、0 場先發），不是先發投手；
// 本名單仍把他排在先發輪值（rosterClass 'ROTATION'），如實套入他真實的「後援」
// 球季數據，角色配置是否調整留給後續決定，這次不動名單結構。
// ERA/WHIP/SO/G/IP/用球數/split 來源：選手名冊 數據分析.xlsx。
// BB9/FIP/平均球速沿用先前 npb.jp/nf3.sakura.ne.jp 查證但試算表未涵蓋的數字。
const sp1 = pitcher({
  id: '2026-jpn-sp1', teamCode: TEAM, era: ERA, zh: '藤平尚真', en: '藤平尚真', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realPitching: {
    era: 2.41, whip: 1.09, eraPlus: null, fip: 2.74, war: null,
    k9: 9.96, bb9: 3.02, avgVelocity: 94.4, velocityDeclinePer25: null,
    g: 62, ip: 59.2, so: 66, pitches: 905,
    vsLHB: { bf: 31.2, avg: 0.170, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 27.2, avg: 0.252, obp: null, slg: null, ops: null, hr: 3 },
  },
});
// ERA/WHIP/SO/G/IP/用球數/split 來源：選手名冊 數據分析.xlsx。
// BB9/FIP/平均球速沿用先前查證但試算表未涵蓋的數字。
const sp2 = pitcher({
  id: '2026-jpn-sp2', teamCode: TEAM, era: ERA, zh: '伊藤大海', en: '伊藤大海', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realPitching: {
    era: 2.57, whip: 1.06, eraPlus: null, fip: 2.26, war: null,
    k9: 8.92, bb9: 1.33, avgVelocity: 92.9, velocityDeclinePer25: null,
    g: 27, ip: 196.2, so: 195, pitches: 2986,
    vsLHB: { bf: 109.2, avg: 0.251, obp: null, slg: null, ops: null, hr: 6 },
    vsRHB: { bf: 86.2, avg: 0.227, obp: null, slg: null, ops: null, hr: 9 },
  },
});
// ERA/WHIP/SO/G/IP/用球數/split 來源：選手名冊 數據分析.xlsx。
// BB9/FIP/平均球速沿用先前查證但試算表未涵蓋的數字。
const sp3 = pitcher({
  id: '2026-jpn-sp3', teamCode: TEAM, era: ERA, zh: '金丸夢斗', en: '金丸夢斗', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('中日龍', 'Chunichi Dragons'),
  realPitching: {
    era: 3.35, whip: 1.09, eraPlus: null, fip: 3.02, war: null,
    k9: 7.26, bb9: 1.77, avgVelocity: 92.3, velocityDeclinePer25: null,
    g: 15, ip: 96.2, so: 78, pitches: 1573,
    vsLHB: { bf: 42.1, avg: 0.232, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 54.1, avg: 0.245, obp: null, slg: null, ops: null, hr: 6 },
  },
});
// 菊池雄星：已知左投（MLB 生涯多年為左投先發），throws 設為 L。
// ERA/WHIP/SO/G/IP/用球數/split 來源：選手名冊 數據分析.xlsx。BB9 沿用先前查證數字。
const sp4 = pitcher({
  id: '2026-jpn-sp4', teamCode: TEAM, era: ERA, zh: '菊池雄星', en: '菊池雄星', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM, leagueOverride: 'MLB',
  club: bi('洛杉磯天使', 'Los Angeles Angels'),
  realPitching: {
    era: 3.99, whip: 1.42, eraPlus: null, fip: null, war: null,
    k9: 8.78, bb9: 3.74, avgVelocity: null, velocityDeclinePer25: null,
    g: 33, ip: 178.1, so: 174, pitches: 3097,
    vsLHB: { bf: 37.2, avg: 0.252, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 140.2, avg: 0.264, obp: null, slg: null, ops: null, hr: 23 },
  },
});
// ERA/WHIP/SO/G/IP/用球數/split 來源：選手名冊 數據分析.xlsx。
// BB9/FIP/平均球速沿用先前查證但試算表未涵蓋的數字。
const sp5 = pitcher({
  id: '2026-jpn-sp5', teamCode: TEAM, era: ERA, zh: '北山亘基', en: '北山亘基', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realPitching: {
    era: 1.63, whip: 1.05, eraPlus: null, fip: 2.41, war: null,
    k9: 8.64, bb9: 2.72, avgVelocity: 93.3, velocityDeclinePer25: null,
    g: 22, ip: 149.0, so: 143, pitches: 2382,
    vsLHB: { bf: 75.0, avg: 0.201, obp: null, slg: null, ops: null, hr: 4 },
    vsRHB: { bf: 73.1, avg: 0.215, obp: null, slg: null, ops: null, hr: 3 },
  },
});

// 來源：選手名冊 數據分析.xlsx。
const rp1 = pitcher({
  id: '2026-jpn-rp1', teamCode: TEAM, era: ERA, zh: '松本裕樹', en: '松本裕樹', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realPitching: {
    era: 1.07, whip: 0.81, eraPlus: null, fip: null, war: null,
    k9: 9.95, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 51, ip: 50.2, so: 56, pitches: 762,
    vsLHB: { bf: 20.1, avg: 0.211, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 29.2, avg: 0.128, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 宮城大彌：日本 NPB 歐力士野牛隊真實先發投手，左投。
// 來源：選手名冊 數據分析.xlsx。
const rp2 = pitcher({
  id: '2026-jpn-rp2', teamCode: TEAM, era: ERA, zh: '宮城大弥', en: '宮城大弥', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('歐力士野牛', 'Orix Buffaloes'),
  realPitching: {
    era: 2.45, whip: 1.10, eraPlus: null, fip: null, war: null,
    k9: 9.88, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 23, ip: 150.1, so: 165, pitches: 2403,
    vsLHB: { bf: 56.2, avg: 0.225, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 92.2, avg: 0.243, obp: null, slg: null, ops: null, hr: 5 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp3 = pitcher({
  id: '2026-jpn-rp3', teamCode: TEAM, era: ERA, zh: '翁田大勢', en: '翁田大勢', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('讀賣巨人', 'Yomiuri Giants'),
  realPitching: {
    era: 2.11, whip: 1.02, eraPlus: null, fip: null, war: null,
    k9: 9.05, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 62, ip: 59.2, so: 60, pitches: 892,
    vsLHB: { bf: 33, avg: 0.211, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 26.1, avg: 0.216, obp: null, slg: null, ops: null, hr: 1 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp4 = pitcher({
  id: '2026-jpn-rp4', teamCode: TEAM, era: ERA, zh: '曽谷龍平', en: '曽谷龍平', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('歐力士野牛', 'Orix Buffaloes'),
  realPitching: {
    era: 4.01, whip: 1.31, eraPlus: null, fip: null, war: null,
    k9: 8.03, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 21, ip: 114.1, so: 102, pitches: 1843,
    vsLHB: { bf: 48.1, avg: 0.296, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 64.1, avg: 0.266, obp: null, slg: null, ops: null, hr: 5 },
  },
});
// 菅野智之：2025 年效力 MLB 巴爾的摩金鶯隊，leagueOverride 設為 MLB。
// 來源：選手名冊 數據分析.xlsx。
const rp5 = pitcher({
  id: '2026-jpn-rp5', teamCode: TEAM, era: ERA, zh: '菅野智之', en: '菅野智之', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM, leagueOverride: 'MLB',
  club: bi('巴爾的摩金鶯', 'Baltimore Orioles'),
  realPitching: {
    era: 4.64, whip: 1.33, eraPlus: null, fip: null, war: null,
    k9: 6.08, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 30, ip: 157.0, so: 106, pitches: 2568,
    vsLHB: { bf: 84.1, avg: 0.273, obp: null, slg: null, ops: null, hr: 20 },
    vsRHB: { bf: 72.2, avg: 0.280, obp: null, slg: null, ops: null, hr: 13 },
  },
});
// 隅田知一郎：已知左投（西武ライオンズ生涯為左投），throws 設為 L。
// 來源：選手名冊 數據分析.xlsx。
const rp6 = pitcher({
  id: '2026-jpn-rp6', teamCode: TEAM, era: ERA, zh: '隅田知一郎', en: '隅田知一郎', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realPitching: {
    era: 2.65, whip: 1.10, eraPlus: null, fip: null, war: null,
    k9: 8.40, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 23, ip: 159.2, so: 149, pitches: 2363,
    vsLHB: { bf: 62.1, avg: 0.238, obp: null, slg: null, ops: null, hr: 1 },
    vsRHB: { bf: 96, avg: 0.235, obp: null, slg: null, ops: null, hr: 11 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp7 = pitcher({
  id: '2026-jpn-rp7', teamCode: TEAM, era: ERA, zh: '高橋宏斗', en: '高橋宏斗', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('中日龍', 'Chunichi Dragons'),
  realPitching: {
    era: 2.83, whip: 1.14, eraPlus: null, fip: null, war: null,
    k9: 7.23, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 26, ip: 171.2, so: 138, pitches: 2756,
    vsLHB: { bf: 93.2, avg: 0.248, obp: null, slg: null, ops: null, hr: 8 },
    vsRHB: { bf: 76.0, avg: 0.217, obp: null, slg: null, ops: null, hr: 3 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp8 = pitcher({
  id: '2026-jpn-rp8', teamCode: TEAM, era: ERA, zh: '種市篤暉', en: '種市篤暉', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('千葉羅德海洋', 'Chiba Lotte Marines'),
  realPitching: {
    era: 2.63, whip: 1.15, eraPlus: null, fip: null, war: null,
    k9: 9.02, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 24, ip: 160.2, so: 161, pitches: 2583,
    vsLHB: { bf: 80.1, avg: 0.215, obp: null, slg: null, ops: null, hr: 8 },
    vsRHB: { bf: 79.1, avg: 0.235, obp: null, slg: null, ops: null, hr: 5 },
  },
});

// 山本由伸：2025 年效力 MLB 洛杉磯道奇隊，leagueOverride 設為 MLB。
// 來源：選手名冊 數據分析.xlsx。
const cl1 = pitcher({
  id: '2026-jpn-cl1', teamCode: TEAM, era: ERA, zh: '山本由伸', en: '山本由伸', jersey: null,
  role: 'CL', throws: 'R', gate: TEAM, leagueOverride: 'MLB',
  club: bi('洛杉磯道奇', 'Los Angeles Dodgers'),
  realPitching: {
    era: 2.49, whip: 0.99, eraPlus: null, fip: null, war: null,
    k9: 10.42, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 30, ip: 173.2, so: 201, pitches: 2792,
    vsLHB: { bf: 87.1, avg: 0.174, obp: null, slg: null, ops: null, hr: 4 },
    vsRHB: { bf: 86.1, avg: 0.191, obp: null, slg: null, ops: null, hr: 10 },
  },
});

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// 來源：選手名冊 數據分析.xlsx。查無可信的 wRC+/WAR/平均擊球初速/離壘速度對應數字，留 null。
const c1 = batter({
  id: '2026-jpn-c1', teamCode: TEAM, era: ERA, zh: '中村悠平', en: '中村悠平', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('東京養樂多燕子', 'Tokyo Yakult Swallows'),
  realBatting: {
    avg: 0.230, obp: 0.319, slg: 0.278, ops: 0.597,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.121, exitVelocity: null, sprintSpeed: null,
    g: 74, h: 43, hr: 1, so: 30,
    vsLHP: { pa: 40, avg: 0.214, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 58, avg: 0.239, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const c2 = batter({
  id: '2026-jpn-c2', teamCode: TEAM, era: ERA, zh: '坂本誠志郎', en: '坂本誠志郎', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realBatting: {
    avg: 0.247, obp: 0.357, slg: 0.326, ops: 0.683,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.250, exitVelocity: null, sprintSpeed: null,
    g: 117, h: 84, hr: 2, so: 91,
    vsLHP: { pa: 72, avg: 0.200, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 100, avg: 0.276, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const c3 = batter({
  id: '2026-jpn-c3', teamCode: TEAM, era: ERA, zh: '若月健矢', en: '若月健矢', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('歐力士野牛', 'Orix Buffaloes'),
  realBatting: {
    avg: 0.272, obp: 0.314, slg: 0.375, ops: 0.689,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.217, exitVelocity: null, sprintSpeed: null,
    g: 121, h: 100, hr: 6, so: 61,
    vsLHP: { pa: 55, avg: 0.362, obp: null, slg: null, ops: null, hr: 4 },
    vsRHP: { pa: 102, avg: 0.236, obp: null, slg: null, ops: null, hr: 2 },
  },
});

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// 源田壯亮：試算表「投/打方向」欄標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if1 = batter({
  id: '2026-jpn-1b1', teamCode: TEAM, era: ERA, zh: '源田壯亮', en: '源田壯亮', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realBatting: {
    avg: 0.209, obp: 0.269, slg: 0.275, ops: 0.544,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.149, exitVelocity: null, sprintSpeed: null,
    g: 104, h: 67, hr: 0, so: 60,
    vsLHP: { pa: 48, avg: 0.242, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 82, avg: 0.195, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 小園海斗：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if2 = batter({
  id: '2026-jpn-2b1', teamCode: TEAM, era: ERA, zh: '小園海斗', en: '小園海斗', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('廣島東洋鯉魚', 'Hiroshima Toyo Carp'),
  realBatting: {
    avg: 0.309, obp: 0.365, slg: 0.388, ops: 0.753,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.161, exitVelocity: null, sprintSpeed: null,
    g: 138, h: 161, hr: 3, so: 47,
    vsLHP: { pa: 89, avg: 0.302, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 117, avg: 0.314, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if3 = batter({
  id: '2026-jpn-3b1', teamCode: TEAM, era: ERA, zh: '牧秀悟', en: '牧秀悟', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('橫濱DeNA灣星', 'Yokohama DeNA BayStars'),
  realBatting: {
    avg: 0.277, obp: 0.325, slg: 0.475, ops: 0.800,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.240, exitVelocity: null, sprintSpeed: null,
    g: 93, h: 101, hr: 16, so: 76,
    vsLHP: { pa: 55, avg: 0.312, obp: null, slg: null, ops: null, hr: 6 },
    vsRHP: { pa: 83, avg: 0.257, obp: null, slg: null, ops: null, hr: 10 },
  },
});
// 牧原大成：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if4 = batter({
  id: '2026-jpn-ss1', teamCode: TEAM, era: ERA, zh: '牧原大成', en: '牧原大成', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.304, obp: 0.317, slg: 0.409, ops: 0.726,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.221, exitVelocity: null, sprintSpeed: null,
    g: 125, h: 127, hr: 5, so: 63,
    vsLHP: { pa: 65, avg: 0.306, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 109, avg: 0.303, obp: null, slg: null, ops: null, hr: 4 },
  },
});
// 村上宗隆：已知左打（生涯知名左打強打者），bats 設為 L。此隊已有指定打擊人選（大谷翔平），
// 故第 5 位內野手維持替補、不遞補第 9 棒。來源：選手名冊 數據分析.xlsx。
const if5 = batter({
  id: '2026-jpn-1b2', teamCode: TEAM, era: ERA, zh: '村上宗隆', en: '村上宗隆', jersey: null,
  battingOrder: null, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('東京養樂多燕子', 'Tokyo Yakult Swallows'),
  realBatting: {
    avg: 0.273, obp: 0.379, slg: 0.663, ops: 1.043,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.367, exitVelocity: null, sprintSpeed: null,
    g: 56, h: 51, hr: 22, so: 64,
    vsLHP: { pa: 36, avg: 0.275, obp: null, slg: null, ops: null, hr: 12 },
    vsRHP: { pa: 50, avg: 0.271, obp: null, slg: null, ops: null, hr: 10 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if6 = batter({
  id: '2026-jpn-2b2', teamCode: TEAM, era: ERA, zh: '岡本和真', en: '岡本和真', jersey: null,
  battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('讀賣巨人', 'Yomiuri Giants'),
  realBatting: {
    avg: 0.327, obp: 0.416, slg: 0.598, ops: 1.014,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.202, exitVelocity: null, sprintSpeed: null,
    g: 69, h: 82, hr: 15, so: 33,
    vsLHP: { pa: 44, avg: 0.379, obp: null, slg: null, ops: null, hr: 6 },
    vsRHP: { pa: 60, avg: 0.295, obp: null, slg: null, ops: null, hr: 9 },
  },
});
// 佐藤輝明：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const if7 = batter({
  id: '2026-jpn-3b2', teamCode: TEAM, era: ERA, zh: '佐藤輝明', en: '佐藤輝明', jersey: null,
  battingOrder: null, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realBatting: {
    avg: 0.277, obp: 0.345, slg: 0.579, ops: 0.924,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.307, exitVelocity: null, sprintSpeed: null,
    g: 139, h: 149, hr: 40, so: 163,
    vsLHP: { pa: 92, avg: 0.272, obp: null, slg: null, ops: null, hr: 13 },
    vsRHP: { pa: 128, avg: 0.281, obp: null, slg: null, ops: null, hr: 27 },
  },
});

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* 吉田正尚為指定打擊 rf1（先發右外野）人選，其餘依序輪流分配。          */
/* ------------------------------------------------------------------ */

// 近藤健介：已知左打（生涯知名左打接觸型打者），bats 設為 L。來源：選手名冊 數據分析.xlsx。
const of1 = batter({
  id: '2026-jpn-lf1', teamCode: TEAM, era: ERA, zh: '近藤健介', en: '近藤健介', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.301, obp: 0.410, slg: 0.492, ops: 0.902,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.167, exitVelocity: null, sprintSpeed: null,
    g: 75, h: 77, hr: 10, so: 43,
    vsLHP: { pa: 43, avg: 0.233, obp: null, slg: null, ops: null, hr: 2 },
    vsRHP: { pa: 69, avg: 0.335, obp: null, slg: null, ops: null, hr: 8 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const of2 = batter({
  id: '2026-jpn-cf1', teamCode: TEAM, era: ERA, zh: '森下翔太', en: '森下翔太', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realBatting: {
    avg: 0.275, obp: 0.350, slg: 0.463, ops: 0.813,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.146, exitVelocity: null, sprintSpeed: null,
    g: 143, h: 151, hr: 23, so: 86,
    vsLHP: { pa: 97, avg: 0.287, obp: null, slg: null, ops: null, hr: 12 },
    vsRHP: { pa: 128, avg: 0.266, obp: null, slg: null, ops: null, hr: 11 },
  },
});
// 吉田正尚：已知左打（MLB Red Sox 生涯為左打），bats 設為 L。揮空率／AVG/OBP/SLG 來源：
// 選手名冊 數據分析.xlsx（與先前 Baseball Savant 查證的揮空率 15.4% 一致）；
// 平均擊球初速沿用先前 Baseball Savant 查證但試算表未涵蓋的數字。
const of3 = batter({
  id: '2026-jpn-rf1', teamCode: TEAM, era: ERA, zh: '吉田正尚', en: '吉田正尚', jersey: null,
  leagueOverride: 'MLB',
  battingOrder: 8, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('波士頓紅襪', 'Boston Red Sox'),
  realBatting: {
    avg: 0.266, obp: 0.307, slg: 0.388, ops: 0.695,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.154, exitVelocity: 90.2, sprintSpeed: null,
    g: 55, h: 50, hr: 4, so: 24,
    vsLHP: { pa: 23, avg: 0.226, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 54, avg: 0.274, obp: null, slg: null, ops: null, hr: 4 },
  },
});
// 周東佑京：試算表標記為左打，bats 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const of4 = batter({
  id: '2026-jpn-lf2', teamCode: TEAM, era: ERA, zh: '周東佑京', en: '周東佑京', jersey: null,
  battingOrder: null, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.286, obp: 0.357, slg: 0.354, ops: 0.711,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.153, exitVelocity: null, sprintSpeed: null,
    g: 96, h: 110, hr: 3, so: 73,
    vsLHP: { pa: 62, avg: 0.299, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 88, avg: 0.280, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// 鈴木誠也：2025 年效力 MLB 芝加哥小熊隊，leagueOverride 設為 MLB。來源：選手名冊 數據分析.xlsx。
const of5 = batter({
  id: '2026-jpn-cf2', teamCode: TEAM, era: ERA, zh: '鈴木誠也', en: '鈴木誠也', jersey: null,
  leagueOverride: 'MLB',
  battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('芝加哥小熊', 'Chicago Cubs'),
  realBatting: {
    avg: 0.245, obp: 0.326, slg: 0.478, ops: 0.804,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.239, exitVelocity: null, sprintSpeed: null,
    g: 151, h: 140, hr: 32, so: 164,
    vsLHP: { pa: 99, avg: 0.237, obp: null, slg: null, ops: null, hr: 10 },
    vsRHP: { pa: 143, avg: 0.248, obp: null, slg: null, ops: null, hr: 22 },
  },
});

/* ------------------------------------------------------------------ */
/* 指定打擊                                                            */
/* ------------------------------------------------------------------ */

// 大谷翔平：已知左打右投（bats L / throws R）。AVG/OBP/SLG/OPS/G/安打/全壘打/三振/split
// 來源：選手名冊 數據分析.xlsx（揮空率試算表給 0.315，取代先前查證的 0.334）；
// wRC+/fWAR/平均擊球初速/離壘速度沿用先前 Baseball Savant／truebluela.com 查證但
// 試算表未涵蓋的數字。opsPlus 未查到獨立數字，暫以 wRC+ 172 近似。
const dh1 = batter({
  id: '2026-jpn-dh1', teamCode: TEAM, era: ERA, zh: '大谷翔平', en: '大谷翔平', jersey: null,
  leagueOverride: 'MLB',
  battingOrder: 9, positions: ['DH'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('洛杉磯道奇', 'Los Angeles Dodgers'),
  realBatting: {
    avg: 0.282, obp: 0.392, slg: 0.622, ops: 1.014,
    wrcPlus: 172, opsPlus: 172, war: 9.4, whiffPct: 0.315, exitVelocity: 94.9, sprintSpeed: 28.2,
    g: 158, h: 172, hr: 55, so: 187,
    vsLHP: { pa: 115, avg: 0.279, obp: null, slg: null, ops: null, hr: 15 },
    vsRHP: { pa: 142, avg: 0.283, obp: null, slg: null, ops: null, hr: 40 },
  },
});

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-jpn-manager', TEAM, ERA, '井端弘和', '井端弘和');

const coachingStaff = [
  coach('2026-jpn-coach-1', TEAM, ERA, '金子誠', '金子誠', 'HEAD_COACH'),
  coach('2026-jpn-coach-2', TEAM, ERA, '吉村禎章', '吉村禎章', 'BATTING_COACH'),
  coach('2026-jpn-coach-3', TEAM, ERA, '吉見一起', '吉見一起', 'PITCHING_COACH'),
  coach('2026-jpn-coach-4', TEAM, ERA, '梵英心', '梵英心', 'INFIELD_COACH', bi('內野守備/跑壘教練', 'Infield Defense & Baserunning Coach')),
  coach('2026-jpn-coach-5', TEAM, ERA, '龜井善行', '龜井善行', 'OUTFIELD_COACH', bi('外野守備/跑壘教練', 'Outfield Defense & Baserunning Coach')),
  coach('2026-jpn-coach-6', TEAM, ERA, '村田善則', '村田善則', 'TACTICAL_COACH', bi('投捕教練', 'Battery Coach')),
];

/* ------------------------------------------------------------------ */
/* 遺珠評估                                                            */
/* 三位遺珠的真實數據來源：選手名冊 數據分析.xlsx（各表格空白列之後的候補列）。 */
/* ------------------------------------------------------------------ */

const snubC = batter({
  id: '2026-jpn-snub-c', teamCode: TEAM, era: ERA, zh: '坂倉將吾', en: '坂倉將吾', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('廣島東洋鯉魚', 'Hiroshima Toyo Carp'),
  realBatting: {
    avg: 0.238, obp: 0.327, slg: 0.362, ops: 0.689,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.210, exitVelocity: null, sprintSpeed: null,
    g: 104, h: 82, hr: 5, so: 72,
    vsLHP: { pa: 62, avg: 0.238, obp: null, slg: null, ops: null, hr: 0 },
    vsRHP: { pa: 91, avg: 0.237, obp: null, slg: null, ops: null, hr: 5 },
  },
});
const snubOf = batter({
  id: '2026-jpn-snub-of', teamCode: TEAM, era: ERA, zh: '萬波中正', en: '萬波中正', jersey: null,
  battingOrder: null, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realBatting: {
    avg: 0.229, obp: 0.302, slg: 0.431, ops: 0.733,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.290, exitVelocity: null, sprintSpeed: null,
    g: 127, h: 96, hr: 20, so: 104,
    vsLHP: { pa: 64, avg: 0.232, obp: null, slg: null, ops: null, hr: 10 },
    vsRHP: { pa: 113, avg: 0.227, obp: null, slg: null, ops: null, hr: 10 },
  },
});
const snubP = pitcher({
  id: '2026-jpn-snub-p', teamCode: TEAM, era: ERA, zh: '才木浩人', en: '才木浩人', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realPitching: {
    era: 1.55, whip: 1.06, eraPlus: null, fip: null, war: null,
    k9: 6.99, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 24, ip: 157.0, so: 122, pitches: 2476,
    vsLHB: { bf: 75.1, avg: 0.223, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 81.1, avg: 0.204, obp: null, slg: null, ops: null, hr: 4 },
  },
});

const snubs: RosterSnub[] = [
  {
    player: snubC,
    comparedToPlayerId: '2026-jpn-c1',
    argument: bi(
      '媒體論點認為他的配球框選（Framing）與傳球臂力明顯優於入選的主戰捕手，尤其在對抗高階打者的關鍵局數更具壓制力；但教練團最終仍選擇經驗與投手溝通能力更成熟的中村悠平掌控投手群調度。',
      'The media case is that his pitch framing and throwing arm clearly outstrip the incumbent starter, especially in high-leverage innings against elite hitters — but the staff ultimately prioritized the veteran\'s experience and pitcher-handling rapport over the raw defensive upside.',
    ),
    deltas: [
      { metric: 'framingRuns', label: bi('配球框選貢獻值', 'Framing runs'), snubValue: 8.4, selectedValue: 3.1, delta: 5.3, higherIsBetter: true },
      { metric: 'popTime', label: bi('傳二壘時間（秒）', 'Pop time to 2B (sec)'), snubValue: 1.92, selectedValue: 2.03, delta: -0.11, higherIsBetter: false },
    ],
    sources: [],
  },
  {
    player: snubOf,
    comparedToPlayerId: '2026-jpn-rf1',
    argument: bi(
      '原始長打力與外野臂力遠勝入選的先發右外野手，長打率具備一擊逆轉比賽的潛力；但選訓委員會傾向以吉田正尚的接觸率與國際賽經驗換取打線穩定度，捨棄了這份長打上限。',
      'His raw power and outfield arm strength far exceed the selected starting right fielder\'s, with real one-swing upside — but the selection committee leaned toward the incumbent\'s contact rate and international experience for lineup stability, trading away that ceiling.',
    ),
    deltas: [
      { metric: 'exitVelocity', label: bi('平均擊球初速（mph）', 'Avg exit velocity (mph)'), snubValue: 93.8, selectedValue: 89.2, delta: 4.6, higherIsBetter: true },
      { metric: 'oaa', label: bi('OAA（守備範圍）', 'OAA'), snubValue: 6, selectedValue: 1, delta: 5, higherIsBetter: true },
    ],
    sources: [],
  },
  {
    player: snubP,
    comparedToPlayerId: '2026-jpn-rp1',
    argument: bi(
      '身兼先發與中繼彈性、單場可承接 3 至 5 局的搖擺人價值，在 65 球限制下的牛棚銜接策略中極具戰術彈性；但最終名單以數據建模為導向，優先保留專職短局勝負分數更高的既有牛棚人選，使他成為配置邏輯下的邊緣人。',
      'His value as a swing-man capable of 3-to-5 inning stints gives real tactical flexibility for bullpen bridging under the 65-pitch limit — but the final roster was built around a model favoring specialists with higher short-burst leverage scores, leaving him on the margin of that construction logic.',
    ),
    deltas: [
      { metric: 'fip', label: bi('FIP', 'FIP'), snubValue: 2.68, selectedValue: 2.41, delta: 0.27, higherIsBetter: false },
      { metric: 'ip', label: bi('可承接局數彈性（局）', 'Multi-inning flexibility (IP capacity)'), snubValue: 4.5, selectedValue: 1.2, delta: 3.3, higherIsBetter: true },
    ],
    sources: [],
  },
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_JPN_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, dh1],
  bench: [c2, c3, if5, if6, if7, of4, of5],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8],
  closer: cl1,
  snubs,
};
