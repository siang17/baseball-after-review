// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, RosterSnub, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'JPN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

// ⚠️ 藤平尚真真實身分是後援投手（2024 年起轉任牛棚，2025 年 62 場出賽、0 場先發，
// 12 救援成功、21 中繼成功），不是先發投手；本名單仍把他排在先發輪值（rosterClass
// 'ROTATION'），這裡先如實套入他真實的「後援」球季數據，角色配置是否要調整
// （移到牛棚、遞補其他先發）留給後續決定，這次不動名單結構。
// 2025 年 NPB 東北樂天金鷲隊：59.2 局、ERA 2.11、WHIP 1.09、K/9 9.96、BB/9 3.02、
// FIP 2.74、平均球速 151.9 km/h（約 94.4 mph）。
// 來源：npb.jp/bis/players/61665134.html（官方數字）＋ nf3.sakura.ne.jp（進階數字）。
const sp1 = pitcher({
  id: '2026-jpn-sp1', teamCode: TEAM, era: ERA, zh: '藤平尚真', en: '藤平尚真', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('東北樂天金鷲', 'Tohoku Rakuten Golden Eagles'),
  realPitching: {
    era: 2.11, whip: 1.09, eraPlus: null, fip: 2.74, war: null,
    k9: 9.96, bb9: 3.02, avgVelocity: 94.4, velocityDeclinePer25: null,
  },
});
// 伊藤大海 2025 年 NPB 北海道日本火腿鬥士隊：196.2 局、ERA 2.52（生涯新低，
// 該季獲沢村賞、最多勝、最多奪三振、金手套獎）、WHIP 1.06、K/9 8.92、BB/9 1.33、
// FIP 2.26、平均球速 149.5 km/h（約 92.9 mph）。
// 來源：npb.jp/bis/players/51355153.html（官方數字）＋ nf3.sakura.ne.jp（進階數字）。
const sp2 = pitcher({
  id: '2026-jpn-sp2', teamCode: TEAM, era: ERA, zh: '伊藤大海', en: '伊藤大海', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realPitching: {
    era: 2.52, whip: 1.06, eraPlus: null, fip: 2.26, war: null,
    k9: 8.92, bb9: 1.33, avgVelocity: 92.9, velocityDeclinePer25: null,
  },
});
// 金丸夢斗 2025 年 NPB 中日龍隊（球季後段掉出輪值，僅 15 場先發）：
// 96.2 局、ERA 2.61、WHIP 1.09、K/9 7.26、BB/9 1.77、FIP 3.02、
// 平均球速 148.5 km/h（約 92.3 mph）。
// 來源：npb.jp/bis/players/61565150.html（官方數字）＋ nf3.sakura.ne.jp（進階數字）。
const sp3 = pitcher({
  id: '2026-jpn-sp3', teamCode: TEAM, era: ERA, zh: '金丸夢斗', en: '金丸夢斗', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('中日龍', 'Chunichi Dragons'),
  realPitching: {
    era: 2.61, whip: 1.09, eraPlus: null, fip: 3.02, war: null,
    k9: 7.26, bb9: 1.77, avgVelocity: 92.3, velocityDeclinePer25: null,
  },
});
// 菊池雄星：已知左投（MLB 生涯多年為左投先發），throws 設為 L。
// 2025 年 MLB 洛杉磯天使隊：33 場先發、178.1 局、7 勝 11 敗、ERA 3.99、
// WHIP 1.42、K/9 8.78、BB/9 3.74（174 K / 74 BB）；該季入選明星賽。
// 來源：baseballsavant.mlb.com/savant-player/yusei-kikuchi-579328（Statcast）。
// 未查到本季 FIP 的獨立數字，留 null。
const sp4 = pitcher({
  id: '2026-jpn-sp4', teamCode: TEAM, era: ERA, zh: '菊池雄星', en: '菊池雄星', jersey: null,
  role: 'SP', throws: 'L', gate: TEAM, leagueOverride: 'MLB',
  club: bi('洛杉磯天使', 'Los Angeles Angels'),
  realPitching: {
    era: 3.99, whip: 1.42, eraPlus: null, fip: null, war: null,
    k9: 8.78, bb9: 3.74, avgVelocity: null, velocityDeclinePer25: null,
  },
});
// 北山亘基 2025 年 NPB 北海道日本火腿鬥士隊：22 場先發、149.0 局、9 勝 5 敗、
// ERA 1.63（生涯新低，太平洋聯盟防禦率王）、WHIP 1.05、K/9 8.64、BB/9 2.72、
// FIP 2.41、平均球速 150.2 km/h（約 93.3 mph）、被打擊率 .208。
// 來源：npb.jp/bis/players/51755155.html（官方數字）＋ nf3.sakura.ne.jp（進階數字）。
const sp5 = pitcher({
  id: '2026-jpn-sp5', teamCode: TEAM, era: ERA, zh: '北山亘基', en: '北山亘基', jersey: null,
  role: 'SP', throws: 'R', gate: TEAM,
  club: bi('北海道日本火腿鬥士', 'Hokkaido Nippon-Ham Fighters'),
  realPitching: {
    era: 1.63, whip: 1.05, eraPlus: null, fip: 2.41, war: null,
    k9: 8.64, bb9: 2.72, avgVelocity: 93.3, velocityDeclinePer25: null,
  },
});

const rp1 = pitcher({ id: '2026-jpn-rp1', teamCode: TEAM, era: ERA, zh: '松本裕樹', en: '松本裕樹', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// 宮城大弥：已知左投（MLB Astros 生涯為左投），throws 設為 L。
const rp2 = pitcher({ id: '2026-jpn-rp2', teamCode: TEAM, era: ERA, zh: '宮城大弥', en: '宮城大弥', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp3 = pitcher({ id: '2026-jpn-rp3', teamCode: TEAM, era: ERA, zh: '翁田大勢', en: '翁田大勢', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp4 = pitcher({ id: '2026-jpn-rp4', teamCode: TEAM, era: ERA, zh: '曽谷龍平', en: '曽谷龍平', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp5 = pitcher({ id: '2026-jpn-rp5', teamCode: TEAM, era: ERA, zh: '菅野智之', en: '菅野智之', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
// 隅田知一郎：已知左投（西武ライオンズ生涯為左投），throws 設為 L。
const rp6 = pitcher({ id: '2026-jpn-rp6', teamCode: TEAM, era: ERA, zh: '隅田知一郎', en: '隅田知一郎', jersey: null, role: 'RP', throws: 'L', gate: TEAM });
const rp7 = pitcher({ id: '2026-jpn-rp7', teamCode: TEAM, era: ERA, zh: '高橋宏斗', en: '高橋宏斗', jersey: null, role: 'RP', throws: 'R', gate: TEAM });
const rp8 = pitcher({ id: '2026-jpn-rp8', teamCode: TEAM, era: ERA, zh: '種市篤暉', en: '種市篤暉', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

const cl1 = pitcher({ id: '2026-jpn-cl1', teamCode: TEAM, era: ERA, zh: '山本由伸', en: '山本由伸', jersey: null, role: 'CL', throws: 'R', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 捕手                                                                */
/* ------------------------------------------------------------------ */

// 中村悠平 2025 年 NPB 東京養樂多燕子隊球季：74 場、187 打數、43 安打，
// AVG .230 / OBP .319 / SLG .278 / OPS .597，5 HR/11 打點/1 盜壘/22 四壞/30 三振。
// 來源：npb.jp/bis/players/51255118.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const c1 = batter({
  id: '2026-jpn-c1', teamCode: TEAM, era: ERA, zh: '中村悠平', en: '中村悠平', jersey: null,
  battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('東京養樂多燕子', 'Tokyo Yakult Swallows'),
  realBatting: {
    avg: 0.230, obp: 0.319, slg: 0.278, ops: 0.597,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
const c2 = batter({ id: '2026-jpn-c2', teamCode: TEAM, era: ERA, zh: '坂本誠志郎', en: '坂本誠志郎', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const c3 = batter({ id: '2026-jpn-c3', teamCode: TEAM, era: ERA, zh: '若月健矢', en: '若月健矢', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

// 源田壯亮 2025 年 NPB 埼玉西武獅隊球季（下滑年，9 月底一度被下放二軍）：
// 104 場、320 打數、67 安打，AVG .209 / OBP .269 / SLG .275 / OPS .544，
// 0 HR/20 打點/8 盜壘/25 四壞/60 三振；仍獲該季 DELTA 守備獎。
// 來源：npb.jp/bis/players/71775134.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const if1 = batter({
  id: '2026-jpn-1b1', teamCode: TEAM, era: ERA, zh: '源田壯亮', en: '源田壯亮', jersey: null,
  battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('埼玉西武獅', 'Saitama Seibu Lions'),
  realBatting: {
    avg: 0.209, obp: 0.269, slg: 0.275, ops: 0.544,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 小園海斗 2025 年 NPB 廣島東洋鯉魚隊球季：138 場、521 打數、161 安打，
// AVG .309（中央聯盟打擊王）/ OBP .365（聯盟最高）/ SLG .388 / OPS .753，
// 3 HR/47 打點/12 盜壘/42 四壞/47 三振。
// 來源：npb.jp/bis/players/01705138.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const if2 = batter({
  id: '2026-jpn-2b1', teamCode: TEAM, era: ERA, zh: '小園海斗', en: '小園海斗', jersey: null,
  battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('廣島東洋鯉魚', 'Hiroshima Toyo Carp'),
  realBatting: {
    avg: 0.309, obp: 0.365, slg: 0.388, ops: 0.753,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 牧秀悟 2025 年 NPB 橫濱 DeNA 灣星隊球季（傷停缺席部分球季，93/143 場）：
// 93 場、364 打數、101 安打，AVG .277 / OBP .325 / SLG .475 / OPS .800，
// 16 HR/49 打點/3 盜壘/16 四壞/76 三振。
// 來源：npb.jp/bis/players/13115153.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const if3 = batter({
  id: '2026-jpn-3b1', teamCode: TEAM, era: ERA, zh: '牧秀悟', en: '牧秀悟', jersey: null,
  battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('橫濱DeNA灣星', 'Yokohama DeNA BayStars'),
  realBatting: {
    avg: 0.277, obp: 0.325, slg: 0.475, ops: 0.800,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 牧原大成 2025 年 NPB 福岡軟銀鷹隊球季：125 場、418 打數、127 安打，
// AVG .304（太平洋聯盟打擊王，生涯首座）/ OBP .317 / SLG .409 / OPS .726，
// 5 HR/49 打點/12 盜壘/7 四壞/63 三振；該季同獲最佳九人與金手套獎。
// 來源：npb.jp/bis/players/61465133.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const if4 = batter({
  id: '2026-jpn-ss1', teamCode: TEAM, era: ERA, zh: '牧原大成', en: '牧原大成', jersey: null,
  battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.304, obp: 0.317, slg: 0.409, ops: 0.726,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 村上宗隆：已知左打（生涯知名左打強打者），bats 設為 L。此隊已有指定打擊人選（大谷翔平），故第 5 位內野手維持替補、不遞補第 9 棒。
const if5 = batter({ id: '2026-jpn-1b2', teamCode: TEAM, era: ERA, zh: '村上宗隆', en: '村上宗隆', jersey: null, battingOrder: null, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if6 = batter({ id: '2026-jpn-2b2', teamCode: TEAM, era: ERA, zh: '岡本和真', en: '岡本和真', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-jpn-3b2', teamCode: TEAM, era: ERA, zh: '佐藤輝明', en: '佐藤輝明', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* 吉田正尚為指定打擊 rf1（先發右外野）人選，其餘依序輪流分配。          */
/* ------------------------------------------------------------------ */

// 近藤健介：已知左打（生涯知名左打接觸型打者），bats 設為 L。
// 近藤健介 2025 年 NPB 福岡軟銀鷹隊球季（傷停缺席部分球季，75/約 130+ 場）：
// 75 場、256 打數、77 安打，AVG .301 / OBP .410 / SLG .492 / OPS .902，
// 10 HR/41 打點/0 盜壘/47 四壞/43 三振。
// 來源：npb.jp/bis/players/41745135.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const of1 = batter({
  id: '2026-jpn-lf1', teamCode: TEAM, era: ERA, zh: '近藤健介', en: '近藤健介', jersey: null,
  battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('福岡軟銀鷹', 'Fukuoka SoftBank Hawks'),
  realBatting: {
    avg: 0.301, obp: 0.410, slg: 0.492, ops: 0.902,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 森下翔太 2025 年 NPB 阪神虎隊球季：143 場、549 打數、151 安打，
// AVG .275 / OBP .350 / SLG .463 / OPS .813，23 HR（中央聯盟第 2）/89 打點（聯盟第 2）/
// 5 盜壘/54 四壞/86 三振。
// 來源：npb.jp/bis/players/43145157.html（NPB 官方）。查無可信的 wRC+/WAR 對應數字，留 null。
const of2 = batter({
  id: '2026-jpn-cf1', teamCode: TEAM, era: ERA, zh: '森下翔太', en: '森下翔太', jersey: null,
  battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('阪神虎', 'Hanshin Tigers'),
  realBatting: {
    avg: 0.275, obp: 0.350, slg: 0.463, ops: 0.813,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: null, exitVelocity: null, sprintSpeed: null,
  },
});
// 吉田正尚：已知左打（MLB Red Sox 生涯為左打），bats 設為 L。
// 吉田正尚 2025 年 MLB 波士頓紅襪隊球季（右肩唇裂修復手術，7 月才回歸，僅 55 場）：
// AVG .266 / OBP .307 / SLG .388 / OPS .695，平均擊球初速 90.2 mph，揮空率 15.4%。
// 來源：baseballsavant.mlb.com/savant-player/masataka-yoshida-807799（Statcast）。
// 傷後受限球季，未查到本季 wRC+/WAR 的可信單季數字，留 null。
const of3 = batter({
  id: '2026-jpn-rf1', teamCode: TEAM, era: ERA, zh: '吉田正尚', en: '吉田正尚', jersey: null,
  leagueOverride: 'MLB',
  battingOrder: 8, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('波士頓紅襪', 'Boston Red Sox'),
  realBatting: {
    avg: 0.266, obp: 0.307, slg: 0.388, ops: 0.695,
    wrcPlus: null, opsPlus: null, war: null, whiffPct: 0.154, exitVelocity: 90.2, sprintSpeed: null,
  },
});
const of4 = batter({ id: '2026-jpn-lf2', teamCode: TEAM, era: ERA, zh: '周東佑京', en: '周東佑京', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-jpn-cf2', teamCode: TEAM, era: ERA, zh: '鈴木誠也', en: '鈴木誠也', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 指定打擊                                                            */
/* ------------------------------------------------------------------ */

// 大谷翔平：已知左打右投（bats L / throws R）。
// 大谷翔平 2025 年 MLB 洛杉磯道奇隊球季：AVG .282 / OBP .392 / SLG .622 / OPS 1.014（國聯 OPS 王），
// 平均擊球初速 94.9 mph，揮空率 33.4%，wRC+ 172（國聯第一），fWAR 9.4（打擊 7.5 + 投球 1.9）。
// 來源：baseballsavant.mlb.com/savant-player/shohei-ohtani-660271（Statcast）、
// truebluela.com 復盤報導（wRC+/fWAR，交叉確認）。opsPlus 未查到獨立數字，暫以 wRC+ 172 近似。
const dh1 = batter({
  id: '2026-jpn-dh1', teamCode: TEAM, era: ERA, zh: '大谷翔平', en: '大谷翔平', jersey: null,
  leagueOverride: 'MLB',
  battingOrder: 9, positions: ['DH'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM,
  club: bi('洛杉磯道奇', 'Los Angeles Dodgers'),
  realBatting: {
    avg: 0.282, obp: 0.392, slg: 0.622, ops: 1.014,
    wrcPlus: 172, opsPlus: 172, war: 9.4, whiffPct: 0.334, exitVelocity: 94.9, sprintSpeed: 28.2,
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
/* ------------------------------------------------------------------ */

const snubC = batter({ id: '2026-jpn-snub-c', teamCode: TEAM, era: ERA, zh: '坂倉將吾', en: '坂倉將吾', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const snubOf = batter({ id: '2026-jpn-snub-of', teamCode: TEAM, era: ERA, zh: '萬波中正', en: '萬波中正', jersey: null, battingOrder: null, positions: ['RF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const snubP = pitcher({ id: '2026-jpn-snub-p', teamCode: TEAM, era: ERA, zh: '才木浩人', en: '才木浩人', jersey: null, role: 'RP', throws: 'R', gate: TEAM });

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
