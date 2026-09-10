// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，詳見 builders.ts 開頭說明。
// 先發九棒＋先發輪值共 14 人已套用查證過的 2025 真實球季數據（realBatting/realPitching），
// 其餘替補／牛棚球員統計數字仍為虛構值。輪值欄位中 Bednar／Cleavinger／Hill／Hoffman
// 真實身分皆為後援投手，僅沿用既有欄位結構標示，詳見各自欄位註解。

import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import { bi } from '@/lib/i18n';
import type { Roster, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'USA';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// David Bednar：2025 真實身分是海盜／洋基後援終結者（64 場、0 先發），非先發投手，
// 此名單把他放在「先發輪值」欄位純屬示範結構沿用（同 2026 日本隊藤平尚真的處理原則，
// 誠實標註而非改動名單結構）。賽季中交易，ERA/WHIP/K9/BB9 為兩隊合併數字。
// 來源：Baseball Savant、FanGraphs、MLB Trade Rumors（交易報導）。
const sp1 = pitcher({
  id: '2026-usa-sp1', teamCode: TEAM, era: ERA, zh: 'David Bednar', en: 'David Bednar', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('紐約洋基（賽季中交易，原匹茲堡海盜）', 'New York Yankees (traded mid-season from the Pittsburgh Pirates)'),
  realPitching: { era: 2.30, whip: 1.04, eraPlus: null, fip: 2.18, war: 2.0, k9: 12.35, bb9: 2.73, avgVelocity: null, velocityDeclinePer25: null },
});
// Matthew Boyd：已知左投，throws 設為 L。2025 為小熊隊真正的先發輪值成員，角色與此欄位相符。
// 來源：Baseball Savant、FanGraphs、MLB.com。
const sp2 = pitcher({
  id: '2026-usa-sp2', teamCode: TEAM, era: ERA, zh: 'Matthew Boyd', en: 'Matthew Boyd', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  club: bi('芝加哥小熊', 'Chicago Cubs'),
  realPitching: { era: 3.21, whip: 1.09, eraPlus: null, fip: null, war: 3.4, k9: 7.71, bb9: 2.10, avgVelocity: 92.8, velocityDeclinePer25: null },
});
// Garrett Cleavinger：已知左投，throws 設為 L。2025 真實所屬為光芒隊（非原猜測的費城人），
// 且是純後援投手（67 場、0 先發），同 Bednar 的欄位沿用說明。FIP／WAR 查無可靠全季數字，維持 null。
// 來源：Baseball Savant、DRaysBay、MLB.com。
const sp3 = pitcher({
  id: '2026-usa-sp3', teamCode: TEAM, era: ERA, zh: 'Garrett Cleavinger', en: 'Garrett Cleavinger', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  club: bi('坦帕灣光芒', 'Tampa Bay Rays'),
  realPitching: { era: 2.35, whip: 0.95, eraPlus: null, fip: null, war: null, k9: 12.04, bb9: 2.64, avgVelocity: 96.7, velocityDeclinePer25: null },
});
// Tim Hill：已知左投，throws 設為 L。2025 效力洋基（球季前重新簽約，非交易），
// 真實身分是純後援投手（70 場、0 先發），同上沿用說明。
// 來源：Pinstripe Alley、Baseball Savant、FanGraphs。
const sp4 = pitcher({
  id: '2026-usa-sp4', teamCode: TEAM, era: ERA, zh: 'Tim Hill', en: 'Tim Hill', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM,
  club: bi('紐約洋基', 'New York Yankees'),
  realPitching: { era: 3.09, whip: 1.10, eraPlus: null, fip: 4.30, war: 0.0, k9: 4.97, bb9: 2.15, avgVelocity: 88.3, velocityDeclinePer25: null },
});
// Jeff Hoffman：2025 全季效力藍鳥（隊史終結者），2026 交易至雙城，下列數據為 2025 年
// 於藍鳥時期成績；真實身分是純後援終結者（71 場、0 先發），同上沿用說明。
// FIP／WAR 僅單一來源、信心較低，仍列出但請留意。來源：Bluebird Banter、Baseball Savant。
const sp5 = pitcher({
  id: '2026-usa-sp5', teamCode: TEAM, era: ERA, zh: 'Jeff Hoffman', en: 'Jeff Hoffman', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('明尼蘇達雙城（2026年交易，原多倫多藍鳥）', 'Minnesota Twins (traded in 2026; previously Toronto Blue Jays)'),
  realPitching: { era: 4.37, whip: 1.19, eraPlus: null, fip: 2.49, war: 1.2, k9: 11.12, bb9: 3.57, avgVelocity: null, velocityDeclinePer25: null },
});

const rp1 = pitcher({ id: '2026-usa-rp1', teamCode: TEAM, era: ERA, zh: 'Clay Holmes', en: 'Clay Holmes', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp2 = pitcher({ id: '2026-usa-rp2', teamCode: TEAM, era: ERA, zh: 'Griffin Jax', en: 'Griffin Jax', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp3 = pitcher({ id: '2026-usa-rp3', teamCode: TEAM, era: ERA, zh: 'Brad Keller', en: 'Brad Keller', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-usa-rp4', teamCode: TEAM, era: ERA, zh: 'Nolan McLean', en: 'Nolan McLean', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-usa-rp5', teamCode: TEAM, era: ERA, zh: 'Mason Miller', en: 'Mason Miller', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp6 = pitcher({ id: '2026-usa-rp6', teamCode: TEAM, era: ERA, zh: 'Tyler Rogers', en: 'Tyler Rogers', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp7 = pitcher({ id: '2026-usa-rp7', teamCode: TEAM, era: ERA, zh: 'Paul Skenes', en: 'Paul Skenes', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// Gabe Speier：已知左投，throws 設為 L。
const rp8 = pitcher({ id: '2026-usa-rp8', teamCode: TEAM, era: ERA, zh: 'Gabe Speier', en: 'Gabe Speier', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp9 = pitcher({ id: '2026-usa-rp9', teamCode: TEAM, era: ERA, zh: 'Will Vest', en: 'Will Vest', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp10 = pitcher({ id: '2026-usa-rp10', teamCode: TEAM, era: ERA, zh: 'Logan Webb', en: 'Logan Webb', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-usa-cl1', teamCode: TEAM, era: ERA, zh: 'Garrett Whitlock', en: 'Garrett Whitlock', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// Cal Raleigh：已知switch hitter，bats 設為 S。2025 單季 60 轟刷新捕手與轉換打擊者紀錄。
// 來源：Baseball Savant、FanGraphs。
const c1 = batter({
  id: '2026-usa-c1', teamCode: TEAM, era: ERA, zh: 'Cal Raleigh', en: 'Cal Raleigh', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'S', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('西雅圖水手', 'Seattle Mariners'),
  realBatting: { avg: 0.247, obp: 0.359, slg: 0.589, ops: 0.948, wrcPlus: 161, opsPlus: null, war: 9.1, whiffPct: 0.315, exitVelocity: 91.3, sprintSpeed: null },
});
// Will Smith：已知左打（MLB Dodgers 生涯為左打），bats 設為 L。
const c2 = batter({ id: '2026-usa-c2', teamCode: TEAM, era: ERA, zh: 'Will Smith', en: 'Will Smith', jersey: null, battingOrder: null, positions: ['C'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// Alex Bregman：2025 效力紅襪，季後以自由球員身分轉隊小熊（非交易），母隊欄位反映 2026 現況。
// 來源：Baseball Savant、FanGraphs。
const if1 = batter({
  id: '2026-usa-1b1', teamCode: TEAM, era: ERA, zh: 'Alex Bregman', en: 'Alex Bregman', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('芝加哥小熊（2025 賽季後以自由球員身分轉隊，原波士頓紅襪）', 'Chicago Cubs (signed as a free agent after the 2025 season; previously Boston Red Sox)'),
  realBatting: { avg: 0.273, obp: 0.360, slg: 0.462, ops: 0.822, wrcPlus: 126, opsPlus: null, war: 3.6, whiffPct: 0.141, exitVelocity: 90.1, sprintSpeed: null },
});
// 來源：Baseball Savant、FanGraphs。Whiff% 該站未單獨列出（僅有 K%），故留 null。
const if2 = batter({
  id: '2026-usa-2b1', teamCode: TEAM, era: ERA, zh: 'Ernie Clement', en: 'Ernie Clement', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('多倫多藍鳥', 'Toronto Blue Jays'),
  realBatting: { avg: 0.277, obp: 0.313, slg: 0.398, ops: 0.711, wrcPlus: 98, opsPlus: null, war: 3.2, whiffPct: null, exitVelocity: 86.6, sprintSpeed: null },
});
// 來源：Baseball Savant、FanGraphs。
const if3 = batter({
  id: '2026-usa-3b1', teamCode: TEAM, era: ERA, zh: 'Paul Goldschmidt', en: 'Paul Goldschmidt', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('紐約洋基', 'New York Yankees'),
  realBatting: { avg: 0.274, obp: 0.328, slg: 0.403, ops: 0.731, wrcPlus: 102, opsPlus: null, war: 0.7, whiffPct: 0.187, exitVelocity: 90.4, sprintSpeed: null },
});
// Bryce Harper：已知左打，bats 設為 L。來源：Baseball Savant、FanGraphs。
const if4 = batter({
  id: '2026-usa-ss1', teamCode: TEAM, era: ERA, zh: 'Bryce Harper', en: 'Bryce Harper', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('費城費城人', 'Philadelphia Phillies'),
  realBatting: { avg: 0.261, obp: 0.357, slg: 0.487, ops: 0.844, wrcPlus: 129, opsPlus: null, war: 3.3, whiffPct: 0.209, exitVelocity: 91.3, sprintSpeed: null },
});
// Gunnar Henderson：已知左打，bats 設為 L。此隊已有指定打擊人選（Kyle Schwarber），故第 5 位內野手維持替補、不遞補第 9 棒。
const if5 = batter({ id: '2026-usa-1b2', teamCode: TEAM, era: ERA, zh: 'Gunnar Henderson', en: 'Gunnar Henderson', jersey: null, battingOrder: null, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
// Brice Turang：已知左打，bats 設為 L。
const if6 = batter({ id: '2026-usa-2b2', teamCode: TEAM, era: ERA, zh: 'Brice Turang', en: 'Brice Turang', jersey: null, battingOrder: null, positions: ['2B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-usa-3b2', teamCode: TEAM, era: ERA, zh: 'Bobby Witt Jr.', en: 'Bobby Witt Jr.', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* ------------------------------------------------------------------ */

// Roman Anthony：已知左打，bats 設為 L。2025 為紅襪新秀，賽季因側腹傷提前結束。
// 來源：Baseball Savant、MLB.com。
const of1 = batter({
  id: '2026-usa-lf1', teamCode: TEAM, era: ERA, zh: 'Roman Anthony', en: 'Roman Anthony', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('波士頓紅襪', 'Boston Red Sox'),
  realBatting: { avg: 0.292, obp: 0.396, slg: 0.463, ops: 0.859, wrcPlus: 140, opsPlus: null, war: 2.7, whiffPct: 0.298, exitVelocity: 94.5, sprintSpeed: 27.8 },
});
// 來源：Baseball Savant、StatMuse、Twins Daily。wRC+ 查無可靠數字，維持 null。
const of2 = batter({
  id: '2026-usa-cf1', teamCode: TEAM, era: ERA, zh: 'Byron Buxton', en: 'Byron Buxton', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('明尼蘇達雙城', 'Minnesota Twins'),
  realBatting: { avg: 0.264, obp: 0.327, slg: 0.551, ops: 0.878, wrcPlus: null, opsPlus: null, war: 4.9, whiffPct: 0.273, exitVelocity: 92.5, sprintSpeed: null },
});
// Pete Crow-Armstrong：已知左打，bats 設為 L。2025 首度入選明星賽並獲金手套獎。
// 來源：Baseball Savant、MLB.com、StatMuse。
const of3 = batter({
  id: '2026-usa-rf1', teamCode: TEAM, era: ERA, zh: 'Pete Crow-Armstrong', en: 'Pete Crow-Armstrong', jersey: null,
  battingOrder: 8, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('芝加哥小熊', 'Chicago Cubs'),
  realBatting: { avg: 0.247, obp: 0.287, slg: 0.481, ops: 0.768, wrcPlus: 109, opsPlus: null, war: 5.4, whiffPct: 0.289, exitVelocity: 89.5, sprintSpeed: null },
});
const of4 = batter({ id: '2026-usa-lf2', teamCode: TEAM, era: ERA, zh: 'Aaron Judge', en: 'Aaron Judge', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 指定打擊                                                            */
/* ------------------------------------------------------------------ */

// Kyle Schwarber：已知左打，bats 設為 L。2025 全聯盟 56 轟、132 打點雙料王，明星賽 MVP。
// 來源：Baseball Savant、Wikipedia、FanGraphs。
const dh1 = batter({
  id: '2026-usa-dh1', teamCode: TEAM, era: ERA, zh: 'Kyle Schwarber', en: 'Kyle Schwarber', jersey: null,
  battingOrder: 9, positions: ['DH'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('費城費城人', 'Philadelphia Phillies'),
  realBatting: { avg: 0.240, obp: 0.365, slg: 0.563, ops: 0.928, wrcPlus: 152, opsPlus: null, war: 4.9, whiffPct: 0.272, exitVelocity: 94.3, sprintSpeed: null },
});

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const headManager = manager('2026-usa-manager', TEAM, ERA, '馬克·德羅薩', 'Mark DeRosa');

const coachingStaff = [
  coach('2026-usa-coach-1', TEAM, ERA, 'Brian McCann', 'Brian McCann', 'HEAD_COACH'),
  coach('2026-usa-coach-2', TEAM, ERA, 'Andy Pettitte', 'Andy Pettitte', 'BATTING_COACH'),
  coach('2026-usa-coach-3', TEAM, ERA, 'Dave Righetti', 'Dave Righetti', 'PITCHING_COACH'),
  coach('2026-usa-coach-4', TEAM, ERA, 'Brad Lidge', 'Brad Lidge', 'BULLPEN_COACH'),
  coach('2026-usa-coach-5', TEAM, ERA, 'Lou Collier', 'Lou Collier', 'FIRST_BASE_COACH'),
  coach('2026-usa-coach-6', TEAM, ERA, 'Dino Ebel', 'Dino Ebel', 'THIRD_BASE_COACH'),
];

/* ------------------------------------------------------------------ */
/* Roster                                                              */
/* ------------------------------------------------------------------ */

export const ROSTER_USA_2026: Roster = {
  teamCode: TEAM,
  era: ERA,
  tournamentId: 'WBC_2026',
  manager: headManager,
  coachingStaff,
  lineup: [c1, if1, if2, if3, if4, of1, of2, of3, dh1],
  bench: [c2, if5, if6, if7, of4],
  rotation: [sp1, sp2, sp3, sp4, sp5],
  bullpen: [rp1, rp2, rp3, rp4, rp5, rp6, rp7, rp8, rp9, rp10],
  closer: cl1,
  // TODO: 等使用者提供遺珠名單後補上
  snubs: [],
};
