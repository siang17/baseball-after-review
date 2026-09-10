// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估；先發九棒＋先發輪值
// 共 14 人的統計數字已換成查證過的 2025 球季真實數據（見各自的來源註解），
// 其餘替補／牛棚球員仍是決定性生成的示範值，詳見 builders.ts 開頭說明。

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
// （37 K / 16 BB）。查無球速/FIP/WAR（LMB 未公開對應數字）。
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
// Luinder Ávila 2025 年球季：主力在 3A Omaha（皇家隊系統），8/13 首次升上大聯盟。
// 這裡套用他大聯盟這段的數據（樣本小，僅 14 局）：13 場（後援）、14.0 局、
// 1 勝 1 敗、ERA 1.29、WHIP 0.93、K/9 10.3、BB/9 3.9（16 K / 6 BB）；
// 主要球種四縫線／伸卡球均速約 95.8 mph。3A 部分：10 場（9 場先發）、
// 44.1 局、2 勝 2 敗、ERA 4.67，未套入（app 一位球員只存一組數據）。
// 來源：baseballsavant.mlb.com/savant-player/luinder-avila-679883（Statcast）、
// espn.com/mlb/player/stats/_/id/5201985/luinder-avila。
const sp2 = pitcher({
  id: '2026-ven-sp2', teamCode: TEAM, era: ERA, zh: 'Luinder Ávila', en: 'Luinder Ávila', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realPitching: {
    era: 1.29, whip: 0.93, eraPlus: null, fip: null, war: null,
    k9: 10.3, bb9: 3.9, avgVelocity: 95.8, velocityDeclinePer25: null,
  },
});
// Eduard Bazardo 2025 年 MLB 西雅圖水手隊（全季後援）：73 場、78.2 局、5 勝 0 敗、
// ERA 2.52、WHIP 1.02、K/9 9.4、BB/9 3.1（82 K / 27 BB）、FIP 3.64、fWAR 0.5、
// 主力伸卡球均速約 95.5 mph。
// 來源：baseballsavant.mlb.com/savant-player/eduard-bazardo-660825（Statcast）、
// fangraphs.com/players/eduard-bazardo/20997/stats/pitching。
const sp3 = pitcher({
  id: '2026-ven-sp3', teamCode: TEAM, era: ERA, zh: 'Eduard Bazardo', en: 'Eduard Bazardo', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('西雅圖水手', 'Seattle Mariners'),
  realPitching: {
    era: 2.52, whip: 1.02, eraPlus: null, fip: 3.64, war: 0.5,
    k9: 9.4, bb9: 3.1, avgVelocity: 95.5, velocityDeclinePer25: null,
  },
});
// José Buttó 2025 年球季（賽季中交易，7/30 由大都會交易到巨人隊，兩隊皆為後援）：
// 合計 55 場、67.0 局、5 勝 3 敗、ERA 3.90、WHIP 1.40、K/9 約 7.8、BB/9 約 4.3
// （58 K / 32 BB）、FIP 3.70、fWAR 0.5、均速約 95.0 mph。
// 來源：baseballsavant.mlb.com/savant-player/jose-butto-676130（Statcast）、
// mccoveychronicles.com（巨人隊分段數據）。
const sp4 = pitcher({
  id: '2026-ven-sp4', teamCode: TEAM, era: ERA, zh: 'José Buttó', en: 'José Buttó', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('舊金山巨人（賽季中交易，原紐約大都會）', 'San Francisco Giants (traded mid-season from the NY Mets)'),
  realPitching: {
    era: 3.90, whip: 1.40, eraPlus: null, fip: 3.70, war: 0.5,
    k9: 7.8, bb9: 4.3, avgVelocity: 95.0, velocityDeclinePer25: null,
  },
});
// ⚠️ Enmanuel De Jesús 2025 年效力韓國 KBO 聯盟 KT Wiz（先發）：32 場、30 場先發、
// 163⅔ 局、9 勝 9 敗、ERA 3.96、165 K——這幾項已查證（來源：
// en.wikipedia.org/wiki/Enmanuel_De_Jesus、mlbtraderumors.com 簽約報導）。
// 但查不到可信的保送數，WHIP/K9/BB9 因此無法換算，這裡維持決定性生成的示範值，
// 不半套真實數字進去。
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
// 2025 年 MLB 密爾瓦基釀酒人隊：150 場、AVG .260 / OBP .355 / SLG .399 / OPS .754，
// 17 HR/76 打點/6 盜壘/84 四壞/120 三振，平均擊球初速 91.1 mph，揮空率 24.2%，
// 衝刺速度 26.2 ft/s，wRC+ 114，fWAR 3.7。
// 來源：baseballsavant.mlb.com/savant-player/william-contreras-661388（Statcast）、
// fangraphs.com/players/william-contreras/20503/stats?position=C。
const c1 = batter({
  id: '2026-ven-c1', teamCode: TEAM, era: ERA, zh: 'William Contreras', en: 'William Contreras', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('密爾瓦基釀酒人', 'Milwaukee Brewers'),
  realBatting: {
    avg: 0.260, obp: 0.355, slg: 0.399, ops: 0.754,
    wrcPlus: 114, opsPlus: null, war: 3.7, whiffPct: 0.242, exitVelocity: 91.1, sprintSpeed: 26.2,
  },
});
const c2 = batter({ id: '2026-ven-c2', teamCode: TEAM, era: ERA, zh: 'Salvador Pérez', en: 'Salvador Pérez', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// Luis Arráez：已知左打（生涯知名左打接觸型打者），bats 設為 L。
// 2025 年 MLB 聖地牙哥教士隊：154 場、AVG .292 / OBP .327 / SLG .392 / OPS .719，
// 8 HR/61 打點/11 盜壘/34 四壞/21 三振（三振率全聯盟數一數二低，3.1%），
// 平均擊球初速 86.1 mph，揮空率僅 5.3%，衝刺速度 26.5 ft/s，wRC+ 約 105，fWAR 0.9。
// 來源：baseballsavant.mlb.com/savant-player/luis-arraez-650333（Statcast）、
// fangraphs.com/players/luis-arraez/18568/stats?position=1B。
const if1 = batter({
  id: '2026-ven-1b1', teamCode: TEAM, era: ERA, zh: 'Luis Arráez', en: 'Luis Arráez', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('聖地牙哥教士', 'San Diego Padres'),
  realBatting: {
    avg: 0.292, obp: 0.327, slg: 0.392, ops: 0.719,
    wrcPlus: 105, opsPlus: null, war: 0.9, whiffPct: 0.053, exitVelocity: 86.1, sprintSpeed: 26.5,
  },
});
// 2025 年 MLB 聖路易紅雀隊（球季 9 月因右二頭肌拉傷提前報銷）：135 場、
// AVG .257 / OBP .344 / SLG .447 / OPS .791，20 HR/80 打點/5 盜壘/44 四壞/142 三振，
// 平均擊球初速 90.6 mph，揮空率 28.9%，衝刺速度 27.5 ft/s，wRC+ 123，fWAR 2.8。
// 賽季後（2025/12）交易到紅襪隊，屬於 2025 球季結束後的異動，不影響本季數據。
// 來源：baseballsavant.mlb.com/savant-player/willson-contreras-575929（Statcast）、
// fangraphs.com/players/willson-contreras/11609/stats/batting。
const if2 = batter({
  id: '2026-ven-2b1', teamCode: TEAM, era: ERA, zh: 'Willson Contreras', en: 'Willson Contreras', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('聖路易紅雀', 'St. Louis Cardinals'),
  realBatting: {
    avg: 0.257, obp: 0.344, slg: 0.447, ops: 0.791,
    wrcPlus: 123, opsPlus: null, war: 2.8, whiffPct: 0.289, exitVelocity: 90.6, sprintSpeed: 27.5,
  },
});
// Maikel García：已知左打，bats 設為 L。
// 2025 年 MLB 堪薩斯市皇家隊（生涯突破年，首次入選明星賽、首座三壘金手套）：
// 160 場、AVG .286 / OBP .351 / SLG .449 / OPS .800，16 HR/74 打點/23 盜壘/62 四壞/84 三振，
// 平均擊球初速 91.3 mph，揮空率 15.0%，衝刺速度 27.9 ft/s，wRC+ 121，fWAR 5.7。
// 來源：baseballsavant.mlb.com/savant-player/maikel-garcia-672580（Statcast）、
// fangraphs.com/players/maikel-garcia/22715/stats/batting。
const if3 = batter({
  id: '2026-ven-3b1', teamCode: TEAM, era: ERA, zh: 'Maikel García', en: 'Maikel García', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('堪薩斯市皇家', 'Kansas City Royals'),
  realBatting: {
    avg: 0.286, obp: 0.351, slg: 0.449, ops: 0.800,
    wrcPlus: 121, opsPlus: null, war: 5.7, whiffPct: 0.150, exitVelocity: 91.3, sprintSpeed: 27.9,
  },
});
// Andrés Giménez：已知左打（生涯多年為 Guardians 主力），bats 設為 L。
// 2024 年季後被交易到藍鳥隊，2025 年球季（受傷缺席部分球季，101/162 場）：
// AVG .210 / OBP .285 / SLG .313 / OPS .598，7 HR/35 打點/12 盜壘/25 四壞/66 三振，
// 生涯攻擊表現新低；平均擊球初速 86.3 mph，揮空率 23.8%，衝刺速度 28.0 ft/s，
// wRC+ 71，fWAR 1.0。
// 來源：baseballsavant.mlb.com/savant-player/andres-gimenez-665926（Statcast）、
// fangraphs.com/players/andres-gimenez/19950/stats?position=2B。
const if4 = batter({
  id: '2026-ven-ss1', teamCode: TEAM, era: ERA, zh: 'Andrés Giménez', en: 'Andrés Giménez', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('多倫多藍鳥', 'Toronto Blue Jays'),
  realBatting: {
    avg: 0.210, obp: 0.285, slg: 0.313, ops: 0.598,
    wrcPlus: 71, opsPlus: null, war: 1.0, whiffPct: 0.238, exitVelocity: 86.3, sprintSpeed: 28.0,
  },
});
// 第 5 位內野手（輪到 1B）：此隊無指定打擊人選，遞補打線第 9 棒，守位維持輪值分配到的 1B。
// 2025 年球季中交易（7/31 響尾蛇 → 8/1 起水手），合計數據：159 場、
// AVG .228 / OBP .298 / SLG .526 / OPS .824，49 HR（生涯新高，賽季中交易球員史上最多全壘打，
// 超越 Mark McGwire 1997 年的 34 支）/118 打點/4 盜壘/46 四壞/196 三振，
// 平均擊球初速 90.2 mph，揮空率 29.8%，衝刺速度 26.4 ft/s，wRC+ 125，fWAR 3.8（兩隊合計）。
// 來源：baseballsavant.mlb.com/savant-player/eugenio-suarez-553993（Statcast）、
// fangraphs.com/players/eugenio-suarez/12552/stats?position=1B、mlb.com 交易報導。
const if5 = batter({
  id: '2026-ven-1b2', teamCode: TEAM, era: ERA, zh: 'Eugenio Suárez', en: 'Eugenio Suárez', jersey: null,
  battingOrder: 9, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('西雅圖水手（賽季中交易，原亞利桑那響尾蛇）', 'Seattle Mariners (traded mid-season from Arizona)'),
  realBatting: {
    avg: 0.228, obp: 0.298, slg: 0.526, ops: 0.824,
    wrcPlus: 125, opsPlus: null, war: 3.8, whiffPct: 0.298, exitVelocity: 90.2, sprintSpeed: 26.4,
  },
});
// Gleyber Torres：已知switch hitter，bats 設為 S。
const if6 = batter({ id: '2026-ven-2b2', teamCode: TEAM, era: ERA, zh: 'Gleyber Torres', en: 'Gleyber Torres', jersey: null, battingOrder: null, positions: ['2B'], bats: 'S', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-ven-3b2', teamCode: TEAM, era: ERA, zh: 'Ezequiel Tovar', en: 'Ezequiel Tovar', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// 2025 年 MLB 波士頓紅襪隊：115 場、AVG .247 / OBP .317 / SLG .469 / OPS .786，
// 22 HR/69 打點/6 盜壘/40 四壞/101 三振，平均擊球初速 90.8 mph，揮空率 24.0%，
// 衝刺速度 27.6 ft/s，wRC+ 111，fWAR 2.5。
// 來源：baseballsavant.mlb.com/savant-player/wilyer-abreu-677800（Statcast）、
// fangraphs.com/players/wilyer-abreu/23772/stats?position=OF。
const of1 = batter({
  id: '2026-ven-lf1', teamCode: TEAM, era: ERA, zh: 'Wilyer Abreu', en: 'Wilyer Abreu', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('波士頓紅襪', 'Boston Red Sox'),
  realBatting: {
    avg: 0.247, obp: 0.317, slg: 0.469, ops: 0.786,
    wrcPlus: 111, opsPlus: null, war: 2.5, whiffPct: 0.240, exitVelocity: 90.8, sprintSpeed: 27.6,
  },
});
// 2025 年 MLB 亞特蘭大勇士隊（前季 ACL 重建，開季缺席約 7 週）：95 場、
// AVG .290 / OBP .417 / SLG .518 / OPS .935，21 HR/42 打點/9 盜壘/71 四壞/102 三振，
// 平均擊球初速 92.7 mph，揮空率 24.8%，衝刺速度 27.9 ft/s，wRC+ 162，fWAR 3.5；
// 獲選國聯最佳復出球員。
// 來源：baseballsavant.mlb.com/savant-player/ronald-acuna-jr-660670（Statcast）、
// fangraphs.com/players/ronald-acuna-jr/18401/stats?position=OF。
const of2 = batter({
  id: '2026-ven-cf1', teamCode: TEAM, era: ERA, zh: 'Ronald Acuña Jr.', en: 'Ronald Acuña Jr.', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('亞特蘭大勇士', 'Atlanta Braves'),
  realBatting: {
    avg: 0.290, obp: 0.417, slg: 0.518, ops: 0.935,
    wrcPlus: 162, opsPlus: null, war: 3.5, whiffPct: 0.248, exitVelocity: 92.7, sprintSpeed: 27.9,
  },
});
// 2025 年 MLB 密爾瓦基釀酒人隊（右腿後肌反覆拉傷，缺席 31 場）：131 場、
// AVG .270 / OBP .308 / SLG .463 / OPS .771，21 HR/78 打點/21 盜壘/30 四壞/121 三振，
// 平均擊球初速 89.3 mph，揮空率 26.0%，衝刺速度 29.2 ft/s，wRC+ 112，fWAR 3.0；
// 成為 MLB 史上最年輕連兩季 20-20（20 轟 20 盜）球員。
// 來源：baseballsavant.mlb.com/savant-player/jackson-chourio-694192（Statcast）、
// fangraphs.com/players/jackson-chourio/28806/stats?position=OF。
const of3 = batter({
  id: '2026-ven-rf1', teamCode: TEAM, era: ERA, zh: 'Jackson Chourio', en: 'Jackson Chourio', jersey: null,
  battingOrder: 8, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('密爾瓦基釀酒人', 'Milwaukee Brewers'),
  realBatting: {
    avg: 0.270, obp: 0.308, slg: 0.463, ops: 0.771,
    wrcPlus: 112, opsPlus: null, war: 3.0, whiffPct: 0.260, exitVelocity: 89.3, sprintSpeed: 29.2,
  },
});
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
