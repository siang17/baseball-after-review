// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，詳見 builders.ts 開頭說明。
// 全隊 30 位球員（含替補、牛棚）已套用使用者提供的試算表「選手名冊 數據分析.xlsx」
// （2026-09-12）2025 真實球季數據為準；試算表沒有涵蓋的進階欄位（wRC+/WAR/平均擊球初速/
// 離壘速度/FIP/平均球速）若先前已由網路查證取得且與試算表不衝突，予以保留，
// 否則維持 null，不臆測。K/9 由試算表的奪三振數與局數換算得出。
// José Álvarez、Ricardo Sánchez 兩人試算表未提供任何數字，維持先前資料／示範值不動。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'VEN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// José Álvarez：已知左投（MLB 生涯多年為左投後援），throws 設為 L。
// 2025 年效力墨西哥聯盟（LMB）Toros de Tijuana，未在 MLB/小聯盟出賽：
// 53 場（後援）、43.0 局、2 勝 1 敗、ERA 1.88、WHIP 1.28、K/9 約 7.7、BB/9 約 3.3
// （37 K / 16 BB）。查無球速/FIP/WAR（LMB 未公開對應數字）。試算表未提供他的數字，維持不動。
// 來源：lmb.com.mx/jugador/501625（官方）＋ en.wikipedia.org/wiki/José_Álvarez_(baseball,_born_1989)。
const sp1 = pitcher({
  id: '2026-ven-sp1', teamCode: TEAM, era: ERA, zh: 'José Álvarez', en: 'José Álvarez', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  leagueOverride: 'LMB',
  club: bi('提華納公牛（墨西哥聯盟）', 'Toros de Tijuana (LMB)'),
  realPitching: {
    era: 1.88, whip: 1.28, eraPlus: null, fip: null, war: null,
    k9: 7.7, bb9: 3.3, avgVelocity: null, velocityDeclinePer25: null,
  },
});
// ERA/WHIP 與 G/IP/SO/用球數/split 來源：選手名冊 數據分析.xlsx（K/9 由 SO/IP 重新換算，
// 與先前查證的 10.3 一致）；BB9/平均球速沿用先前 Baseball Savant 查證但試算表未涵蓋的數字。
const sp2 = pitcher({
  id: '2026-ven-sp2', teamCode: TEAM, era: ERA, zh: 'Luinder Ávila', en: 'Luinder Ávila', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realPitching: {
    era: 1.29, whip: 0.93, eraPlus: null, fip: null, war: null,
    k9: 10.29, bb9: 3.9, avgVelocity: 95.8, velocityDeclinePer25: null,
    g: 13, ip: 14.0, so: 16, pitches: 218,
    vsLHB: { bf: 6.2, avg: 0.087, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 7.1, avg: 0.192, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// ERA/WHIP 與 G/IP/SO/用球數/split 來源：選手名冊 數據分析.xlsx；
// FIP/fWAR/平均球速沿用先前 FanGraphs／Baseball Savant 查證但試算表未涵蓋的數字。
const sp3 = pitcher({
  id: '2026-ven-sp3', teamCode: TEAM, era: ERA, zh: 'Eduard Bazardo', en: 'Eduard Bazardo', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('西雅圖水手', 'Seattle Mariners'),
  realPitching: {
    era: 2.52, whip: 1.02, eraPlus: null, fip: 3.64, war: 0.5,
    k9: 9.38, bb9: 3.1, avgVelocity: 95.5, velocityDeclinePer25: null,
    g: 73, ip: 78.2, so: 82, pitches: 1224,
    vsLHB: { bf: 33.2, avg: 0.220, obp: null, slg: null, ops: null, hr: 5 },
    vsRHB: { bf: 45, avg: 0.166, obp: null, slg: null, ops: null, hr: 4 },
  },
});
// ERA/WHIP 與 G/IP/SO/用球數/split 來源：選手名冊 數據分析.xlsx（賽季中交易，7/30 由大都會
// 交易到巨人隊，試算表「NYM/SF」與先前查證的交易紀錄一致）；FIP/fWAR/平均球速沿用先前查證但
// 試算表未涵蓋的數字。
const sp4 = pitcher({
  id: '2026-ven-sp4', teamCode: TEAM, era: ERA, zh: 'José Buttó', en: 'José Buttó', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('舊金山巨人（賽季中交易，原紐約大都會）', 'San Francisco Giants (traded mid-season from the NY Mets)'),
  realPitching: {
    era: 3.90, whip: 1.40, eraPlus: null, fip: 3.70, war: 0.5,
    k9: 7.79, bb9: 4.3, avgVelocity: 95.0, velocityDeclinePer25: null,
    g: 55, ip: 67.0, so: 58, pitches: 1098,
    vsLHB: { bf: 28.1, avg: 0.257, obp: null, slg: null, ops: null, hr: 2 },
    vsRHB: { bf: 38.2, avg: 0.255, obp: null, slg: null, ops: null, hr: 2 },
  },
});
// Enmanuel De Jesús：試算表標記為左投，throws 改為 L（原先為未查證的預設猜測）。
// 2025 年效力韓國 KBO 聯盟 KT Wiz（先發）。先前查無可信的保送數，
// WHIP/K9/BB9 因此無法換算；使用者提供的試算表補上了 WHIP 與奪三振數，K/9 據此換算，
// BB9 仍查無可信數字維持 null。
// 來源：選手名冊 數據分析.xlsx；G/IP/ERA/SO 與先前查證的 en.wikipedia.org/wiki/Enmanuel_De_Jesus
// 一致。
const sp5 = pitcher({
  id: '2026-ven-sp5', teamCode: TEAM, era: ERA, zh: 'Enmanuel De Jesús', en: 'Enmanuel De Jesús', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM, leagueOverride: 'KBO',
  club: bi('KT巫師（韓國職棒）', 'KT Wiz (KBO)'),
  realPitching: {
    era: 3.96, whip: 1.33, eraPlus: null, fip: null, war: null,
    k9: 9.07, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 32, ip: 163.2, so: 165, pitches: 2716,
    vsLHB: null, vsRHB: null,
  },
});

// 來源：選手名冊 數據分析.xlsx。樣本極小（1 局出賽）。Jhonathan Díaz：已知左投，throws 設為 L。
const rp1 = pitcher({
  id: '2026-ven-rp1', teamCode: TEAM, era: ERA, zh: 'Jhonathan Díaz', en: 'Jhonathan Díaz', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('西雅圖水手', 'Seattle Mariners'),
  realPitching: {
    era: 0.0, whip: 0.75, eraPlus: null, fip: null, war: null,
    k9: 6.75, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 1, ip: 1.1, so: 1, pitches: 27,
    vsLHB: { bf: 0.1, avg: 0.500, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 1, avg: 0.000, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 2025 年效力紐約大都會小聯盟體系。來源：選手名冊 數據分析.xlsx。
const rp2 = pitcher({
  id: '2026-ven-rp2', teamCode: TEAM, era: ERA, zh: 'Carlos Guzmán', en: 'Carlos Guzmán', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  leagueOverride: 'MiLB',
  club: bi('紐約大都會（小聯盟）', 'New York Mets (Minor League)'),
  realPitching: {
    era: 3.12, whip: 1.02, eraPlus: null, fip: null, war: null,
    k9: 10.29, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 40, ip: 49.0, so: 56, pitches: 810,
    vsLHB: null, vsRHB: null,
  },
});
// 2025 年效力日本 NPB 歐力士野牛隊，leagueOverride 設為 NPB。來源：選手名冊 數據分析.xlsx。
const rp3 = pitcher({
  id: '2026-ven-rp3', teamCode: TEAM, era: ERA, zh: 'Andrés Machado', en: 'Andrés Machado', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  leagueOverride: 'NPB',
  club: bi('歐力士野牛', 'Orix Buffaloes'),
  realPitching: {
    era: 2.28, whip: 1.19, eraPlus: null, fip: null, war: null,
    k9: 11.06, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 58, ip: 55.1, so: 68, pitches: 893,
    vsLHB: { bf: 25.2, avg: 0.253, obp: null, slg: null, ops: null, hr: 0 },
    vsRHB: { bf: 29.2, avg: 0.228, obp: null, slg: null, ops: null, hr: 0 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp4 = pitcher({
  id: '2026-ven-rp4', teamCode: TEAM, era: ERA, zh: 'Anthony Molina', en: 'Anthony Molina', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('科羅拉多落磯', 'Colorado Rockies'),
  realPitching: {
    era: 7.27, whip: 1.67, eraPlus: null, fip: null, war: null,
    k9: 6.23, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 17, ip: 34.2, so: 24, pitches: 611,
    vsLHB: { bf: 15.1, avg: 0.400, obp: null, slg: null, ops: null, hr: 8 },
    vsRHB: { bf: 19.1, avg: 0.308, obp: null, slg: null, ops: null, hr: 4 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp5 = pitcher({
  id: '2026-ven-rp5', teamCode: TEAM, era: ERA, zh: 'Keider Montero', en: 'Keider Montero', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('底特律老虎', 'Detroit Tigers'),
  realPitching: {
    era: 4.37, whip: 1.39, eraPlus: null, fip: null, war: null,
    k9: 7.15, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 20, ip: 90.2, so: 72, pitches: 1474,
    vsLHB: { bf: 42, avg: 0.282, obp: null, slg: null, ops: null, hr: 10 },
    vsRHB: { bf: 48.2, avg: 0.255, obp: null, slg: null, ops: null, hr: 6 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp6 = pitcher({
  id: '2026-ven-rp6', teamCode: TEAM, era: ERA, zh: 'Daniel Palencia', en: 'Daniel Palencia', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('芝加哥小熊', 'Chicago Cubs'),
  realPitching: {
    era: 2.91, whip: 1.14, eraPlus: null, fip: null, war: null,
    k9: 10.42, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 54, ip: 52.2, so: 61, pitches: 841,
    vsLHB: { bf: 23, avg: 0.242, obp: null, slg: null, ops: null, hr: 4 },
    vsRHB: { bf: 29.2, avg: 0.210, obp: null, slg: null, ops: null, hr: 1 },
  },
});
// Eduardo Rodríguez：已知左投（MLB 生涯多年為左投先發），throws 設為 L。來源：選手名冊 數據分析.xlsx。
const rp7 = pitcher({
  id: '2026-ven-rp7', teamCode: TEAM, era: ERA, zh: 'Eduardo Rodríguez', en: 'Eduardo Rodríguez', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('亞利桑那響尾蛇', 'Arizona Diamondbacks'),
  realPitching: {
    era: 5.02, whip: 1.54, eraPlus: null, fip: null, war: null,
    k9: 8.34, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 29, ip: 154.1, so: 143, pitches: 2592,
    vsLHB: { bf: 33.2, avg: 0.303, obp: null, slg: null, ops: null, hr: 4 },
    vsRHB: { bf: 120.2, avg: 0.281, obp: null, slg: null, ops: null, hr: 21 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const rp8 = pitcher({
  id: '2026-ven-rp8', teamCode: TEAM, era: ERA, zh: 'Antonio Senzatela', en: 'Antonio Senzatela', jersey: null,
  role: 'RP', throws: 'R', gate: TEAM,
  club: bi('科羅拉多落磯', 'Colorado Rockies'),
  realPitching: {
    era: 6.65, whip: 1.84, eraPlus: null, fip: null, war: null,
    k9: 5.05, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 30, ip: 130.0, so: 73, pitches: 2286,
    vsLHB: { bf: 70.2, avg: 0.348, obp: null, slg: null, ops: null, hr: 9 },
    vsRHB: { bf: 59.1, avg: 0.345, obp: null, slg: null, ops: null, hr: 13 },
  },
});
// Christian Suárez：試算表標記為左投，throws 改為 L（原先為未查證的預設猜測）。
// 來源：選手名冊 數據分析.xlsx。
const rp9 = pitcher({
  id: '2026-ven-rp9', teamCode: TEAM, era: ERA, zh: 'Christian Suárez', en: 'Christian Suárez', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('洛杉磯道奇', 'Los Angeles Dodgers'),
  realPitching: {
    era: 3.38, whip: 1.52, eraPlus: null, fip: null, war: null,
    k9: 9.14, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 42, ip: 64.0, so: 65, pitches: 1145,
    vsLHB: null, vsRHB: null,
  },
});
// Ranger Suárez：已知左投（MLB Phillies 生涯為左投先發），throws 設為 L。來源：選手名冊 數據分析.xlsx。
const rp10 = pitcher({
  id: '2026-ven-rp10', teamCode: TEAM, era: ERA, zh: 'Ranger Suárez', en: 'Ranger Suárez', jersey: null,
  role: 'RP', throws: 'L', gate: TEAM,
  club: bi('費城費城人', 'Philadelphia Phillies'),
  realPitching: {
    era: 3.20, whip: 1.22, eraPlus: null, fip: null, war: null,
    k9: 8.64, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 26, ip: 157.1, so: 151, pitches: 2432,
    vsLHB: { bf: 33, avg: 0.221, obp: null, slg: null, ops: null, hr: 4 },
    vsRHB: { bf: 124.1, avg: 0.265, obp: null, slg: null, ops: null, hr: 10 },
  },
});
// Ricardo Sánchez：已知左投，throws 設為 L。試算表未提供他的數字，維持示範值不動。
const rp11 = pitcher({ id: '2026-ven-rp11', teamCode: TEAM, era: ERA, zh: 'Ricardo Sánchez', en: 'Ricardo Sánchez', jersey: null, role: 'RP', throws: 'L', gate: TEAM });

// Ángel Zerpa：已知左投，throws 設為 L。來源：選手名冊 數據分析.xlsx。
const cl1 = pitcher({
  id: '2026-ven-cl1', teamCode: TEAM, era: ERA, zh: 'Ángel Zerpa', en: 'Ángel Zerpa', jersey: null,
  role: 'CL', throws: 'L', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realPitching: {
    era: 4.18, whip: 1.38, eraPlus: null, fip: null, war: null,
    k9: 8.07, bb9: null, avgVelocity: null, velocityDeclinePer25: null,
    g: 69, ip: 64.2, so: 58, pitches: 1100,
    vsLHB: { bf: 27.2, avg: 0.225, obp: null, slg: null, ops: null, hr: 3 },
    vsRHB: { bf: 37, avg: 0.303, obp: null, slg: null, ops: null, hr: 4 },
  },
});

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// William Contreras：試算表標記為右打，bats 改為 R（原先誤植為左打）。AVG/OBP/SLG/OPS/揮空率
// 與先前 Baseball Savant／FanGraphs 查證完全一致；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const c1 = batter({
  id: '2026-ven-c1', teamCode: TEAM, era: ERA, zh: 'William Contreras', en: 'William Contreras', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('密爾瓦基釀酒人', 'Milwaukee Brewers'),
  realBatting: {
    avg: 0.260, obp: 0.355, slg: 0.399, ops: 0.754,
    wrcPlus: 114, opsPlus: null, war: 3.7, whiffPct: 0.242, exitVelocity: 91.1, sprintSpeed: 26.2,
    g: 150, h: 147, hr: 17, so: 120,
    vsLHP: { pa: 88, avg: 0.238, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 146, avg: 0.267, obp: null, slg: null, ops: null, hr: 14 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const c2 = batter({
  id: '2026-ven-c2', teamCode: TEAM, era: ERA, zh: 'Salvador Pérez', en: 'Salvador Pérez', jersey: null,
  battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realBatting: {
    avg: 0.236, obp: 0.284, slg: 0.446, ops: 0.729,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.269, exitVelocity: null, sprintSpeed: null,
    g: 155, h: 141, hr: 30, so: 125,
    vsLHP: { pa: 76, avg: 0.213, obp: null, slg: null, ops: null, hr: 2 },
    vsRHP: { pa: 152, avg: 0.243, obp: null, slg: null, ops: null, hr: 28 },
  },
});

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// Luis Arráez：已知左打（生涯知名左打接觸型打者），bats 設為 L。AVG/OBP/SLG/OPS/揮空率
// 與先前查證完全一致；G/安打/全壘打/三振/split 來源：選手名冊 數據分析.xlsx；
// wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const if1 = batter({
  id: '2026-ven-1b1', teamCode: TEAM, era: ERA, zh: 'Luis Arráez', en: 'Luis Arráez', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('聖地牙哥教士', 'San Diego Padres'),
  realBatting: {
    avg: 0.292, obp: 0.327, slg: 0.392, ops: 0.719,
    wrcPlus: 105, opsPlus: null, war: 0.9, whiffPct: 0.053, exitVelocity: 86.1, sprintSpeed: 26.5,
    g: 154, h: 181, hr: 8, so: 21,
    vsLHP: { pa: 85, avg: 0.262, obp: null, slg: null, ops: null, hr: 4 },
    vsRHP: { pa: 139, avg: 0.304, obp: null, slg: null, ops: null, hr: 4 },
  },
});
// AVG/OBP/SLG/OPS/揮空率與先前查證完全一致；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
// 賽季後（2025/12）交易到紅襪隊，屬於 2025 球季結束後的異動，不影響本季數據。
const if2 = batter({
  id: '2026-ven-2b1', teamCode: TEAM, era: ERA, zh: 'Willson Contreras', en: 'Willson Contreras', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('聖路易紅雀', 'St. Louis Cardinals'),
  realBatting: {
    avg: 0.257, obp: 0.344, slg: 0.447, ops: 0.791,
    wrcPlus: 123, opsPlus: null, war: 2.8, whiffPct: 0.289, exitVelocity: 90.6, sprintSpeed: 27.5,
    g: 135, h: 126, hr: 20, so: 142,
    vsLHP: { pa: 68, avg: 0.276, obp: null, slg: null, ops: null, hr: 5 },
    vsRHP: { pa: 129, avg: 0.251, obp: null, slg: null, ops: null, hr: 15 },
  },
});
// Maikel García：試算表標記為右打，bats 改為 R（原先誤植為左打）。AVG/OBP/SLG/OPS/揮空率
// 與先前查證完全一致；G/安打/全壘打/三振/split 來源：選手名冊 數據分析.xlsx；
// wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const if3 = batter({
  id: '2026-ven-3b1', teamCode: TEAM, era: ERA, zh: 'Maikel García', en: 'Maikel García', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realBatting: {
    avg: 0.286, obp: 0.351, slg: 0.449, ops: 0.800,
    wrcPlus: 121, opsPlus: null, war: 5.7, whiffPct: 0.150, exitVelocity: 91.3, sprintSpeed: 27.9,
    g: 160, h: 170, hr: 16, so: 84,
    vsLHP: { pa: 71, avg: 0.314, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 156, avg: 0.279, obp: null, slg: null, ops: null, hr: 13 },
  },
});
// Andrés Giménez：已知左打（生涯多年為 Guardians 主力），bats 設為 L。AVG/OBP/SLG/OPS/揮空率
// 與先前查證完全一致；G/安打/全壘打/三振/split 來源：選手名冊 數據分析.xlsx；
// wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const if4 = batter({
  id: '2026-ven-ss1', teamCode: TEAM, era: ERA, zh: 'Andrés Giménez', en: 'Andrés Giménez', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('多倫多藍鳥', 'Toronto Blue Jays'),
  realBatting: {
    avg: 0.210, obp: 0.285, slg: 0.313, ops: 0.598,
    wrcPlus: 71, opsPlus: null, war: 1.0, whiffPct: 0.238, exitVelocity: 86.3, sprintSpeed: 28.0,
    g: 101, h: 69, hr: 7, so: 66,
    vsLHP: { pa: 51, avg: 0.175, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 96, avg: 0.221, obp: null, slg: null, ops: null, hr: 6 },
  },
});
// 第 5 位內野手（輪到 1B）：此隊無指定打擊人選，遞補打線第 9 棒，守位維持輪值分配到的 1B。
// AVG/OBP/SLG/OPS/揮空率與先前查證完全一致（2025 球季中交易，7/31 響尾蛇 → 8/1 起水手，
// 試算表「ARI/SEA」與先前查證的交易紀錄一致）；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const if5 = batter({
  id: '2026-ven-1b2', teamCode: TEAM, era: ERA, zh: 'Eugenio Suárez', en: 'Eugenio Suárez', jersey: null,
  battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('西雅圖水手（賽季中交易，原亞利桑那響尾蛇）', 'Seattle Mariners (traded mid-season from Arizona)'),
  realBatting: {
    avg: 0.228, obp: 0.298, slg: 0.526, ops: 0.824,
    wrcPlus: 125, opsPlus: null, war: 3.8, whiffPct: 0.298, exitVelocity: 90.2, sprintSpeed: 26.4,
    g: 159, h: 134, hr: 49, so: 196,
    vsLHP: { pa: 85, avg: 0.164, obp: null, slg: null, ops: null, hr: 13 },
    vsRHP: { pa: 152, avg: 0.252, obp: null, slg: null, ops: null, hr: 36 },
  },
});
// Gleyber Torres：已知switch hitter，bats 設為 S。來源：選手名冊 數據分析.xlsx。
const if6 = batter({
  id: '2026-ven-2b2', teamCode: TEAM, era: ERA, zh: 'Gleyber Torres', en: 'Gleyber Torres', jersey: null,
  battingOrder: null, positions: ['2B'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('底特律老虎', 'Detroit Tigers'),
  realBatting: {
    avg: 0.256, obp: 0.358, slg: 0.387, ops: 0.745,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.195, exitVelocity: null, sprintSpeed: null,
    g: 145, h: 136, hr: 16, so: 101,
    vsLHP: { pa: 92, avg: 0.280, obp: null, slg: null, ops: null, hr: 7 },
    vsRHP: { pa: 139, avg: 0.247, obp: null, slg: null, ops: null, hr: 9 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const if7 = batter({
  id: '2026-ven-3b2', teamCode: TEAM, era: ERA, zh: 'Ezequiel Tovar', en: 'Ezequiel Tovar', jersey: null,
  battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('科羅拉多落磯', 'Colorado Rockies'),
  realBatting: {
    avg: 0.253, obp: 0.294, slg: 0.400, ops: 0.694,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.314, exitVelocity: null, sprintSpeed: null,
    g: 95, h: 91, hr: 9, so: 98,
    vsLHP: { pa: 41, avg: 0.275, obp: null, slg: null, ops: null, hr: 2 },
    vsRHP: { pa: 90, avg: 0.246, obp: null, slg: null, ops: null, hr: 7 },
  },
});

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Wilyer Abreu：試算表標記為左投左打，bats 改為 L（原先誤植為右打）。
// AVG/OBP/SLG/OPS/揮空率與先前查證完全一致；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const of1 = batter({
  id: '2026-ven-lf1', teamCode: TEAM, era: ERA, zh: 'Wilyer Abreu', en: 'Wilyer Abreu', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('波士頓紅襪', 'Boston Red Sox'),
  realBatting: {
    avg: 0.247, obp: 0.317, slg: 0.469, ops: 0.786,
    wrcPlus: 111, opsPlus: null, war: 2.5, whiffPct: 0.240, exitVelocity: 90.8, sprintSpeed: 27.6,
    g: 115, h: 92, hr: 22, so: 101,
    vsLHP: { pa: 47, avg: 0.230, obp: null, slg: null, ops: null, hr: 1 },
    vsRHP: { pa: 110, avg: 0.250, obp: null, slg: null, ops: null, hr: 21 },
  },
});
// AVG/OBP/SLG/OPS/揮空率與先前查證完全一致；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const of2 = batter({
  id: '2026-ven-cf1', teamCode: TEAM, era: ERA, zh: 'Ronald Acuña Jr.', en: 'Ronald Acuña Jr.', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('亞特蘭大勇士', 'Atlanta Braves'),
  realBatting: {
    avg: 0.290, obp: 0.417, slg: 0.518, ops: 0.935,
    wrcPlus: 162, opsPlus: null, war: 3.5, whiffPct: 0.248, exitVelocity: 92.7, sprintSpeed: 27.9,
    g: 95, h: 98, hr: 21, so: 102,
    vsLHP: { pa: 58, avg: 0.253, obp: null, slg: null, ops: null, hr: 4 },
    vsRHP: { pa: 88, avg: 0.305, obp: null, slg: null, ops: null, hr: 17 },
  },
});
// AVG/OBP/SLG/OPS/揮空率與先前查證完全一致；G/安打/全壘打/三振/split 來源：
// 選手名冊 數據分析.xlsx；wRC+/fWAR/平均擊球初速/離壘速度沿用先前查證但試算表未涵蓋的數字。
const of3 = batter({
  id: '2026-ven-rf1', teamCode: TEAM, era: ERA, zh: 'Jackson Chourio', en: 'Jackson Chourio', jersey: null,
  battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('密爾瓦基釀酒人', 'Milwaukee Brewers'),
  realBatting: {
    avg: 0.270, obp: 0.308, slg: 0.463, ops: 0.771,
    wrcPlus: 112, opsPlus: null, war: 3.0, whiffPct: 0.260, exitVelocity: 89.3, sprintSpeed: 29.2,
    g: 131, h: 148, hr: 21, so: 121,
    vsLHP: { pa: 78, avg: 0.343, obp: null, slg: null, ops: null, hr: 7 },
    vsRHP: { pa: 130, avg: 0.245, obp: null, slg: null, ops: null, hr: 14 },
  },
});
// 來源：選手名冊 數據分析.xlsx。
const of4 = batter({
  id: '2026-ven-lf2', teamCode: TEAM, era: ERA, zh: 'Javier Sanoja', en: 'Javier Sanoja', jersey: null,
  battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM,
  club: bi('邁阿密馬林魚', 'Miami Marlins'),
  realBatting: {
    avg: 0.243, obp: 0.287, slg: 0.396, ops: 0.683,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.124, exitVelocity: null, sprintSpeed: null,
    g: 120, h: 76, hr: 6, so: 41,
    vsLHP: { pa: 73, avg: 0.233, obp: null, slg: null, ops: null, hr: 3 },
    vsRHP: { pa: 93, avg: 0.249, obp: null, slg: null, ops: null, hr: 3 },
  },
});

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
