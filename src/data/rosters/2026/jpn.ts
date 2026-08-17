// ⚠️ 示範資料：先發輪值/牛棚分工、棒次、守位細節為示範推估，統計數字為虛構值，詳見 builders.ts 開頭說明。

import { bi } from '@/lib/i18n';
import { batter, coach, manager, pitcher } from '@/data/rosters/builders';
import type { Roster, RosterSnub, TeamCode } from '@/types/baseball';

const TEAM: TeamCode = 'JPN';
const ERA = 2026;

/* ------------------------------------------------------------------ */
/* 投手                                                                */
/* ------------------------------------------------------------------ */

const sp1 = pitcher({ id: '2026-jpn-sp1', teamCode: TEAM, era: ERA, zh: '藤平尚真', en: '藤平尚真', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp2 = pitcher({ id: '2026-jpn-sp2', teamCode: TEAM, era: ERA, zh: '伊藤大海', en: '伊藤大海', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
const sp3 = pitcher({ id: '2026-jpn-sp3', teamCode: TEAM, era: ERA, zh: '金丸夢斗', en: '金丸夢斗', jersey: null, role: 'SP', throws: 'R', gate: TEAM });
// 菊池雄星：已知左投（MLB 生涯多年為左投先發），throws 設為 L。
const sp4 = pitcher({ id: '2026-jpn-sp4', teamCode: TEAM, era: ERA, zh: '菊池雄星', en: '菊池雄星', jersey: null, role: 'SP', throws: 'L', gate: TEAM });
const sp5 = pitcher({ id: '2026-jpn-sp5', teamCode: TEAM, era: ERA, zh: '北山亘基', en: '北山亘基', jersey: null, role: 'SP', throws: 'R', gate: TEAM });

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

const c1 = batter({ id: '2026-jpn-c1', teamCode: TEAM, era: ERA, zh: '中村悠平', en: '中村悠平', jersey: null, battingOrder: 1, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const c2 = batter({ id: '2026-jpn-c2', teamCode: TEAM, era: ERA, zh: '坂本誠志郎', en: '坂本誠志郎', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const c3 = batter({ id: '2026-jpn-c3', teamCode: TEAM, era: ERA, zh: '若月健矢', en: '若月健矢', jersey: null, battingOrder: null, positions: ['C'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 內野手（1B/2B/3B/SS 依名單順序輪流分配）                             */
/* ------------------------------------------------------------------ */

const if1 = batter({ id: '2026-jpn-1b1', teamCode: TEAM, era: ERA, zh: '源田壯亮', en: '源田壯亮', jersey: null, battingOrder: 2, positions: ['1B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if2 = batter({ id: '2026-jpn-2b1', teamCode: TEAM, era: ERA, zh: '小園海斗', en: '小園海斗', jersey: null, battingOrder: 3, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if3 = batter({ id: '2026-jpn-3b1', teamCode: TEAM, era: ERA, zh: '牧秀悟', en: '牧秀悟', jersey: null, battingOrder: 4, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const if4 = batter({ id: '2026-jpn-ss1', teamCode: TEAM, era: ERA, zh: '牧原大成', en: '牧原大成', jersey: null, battingOrder: 5, positions: ['SS'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 村上宗隆：已知左打（生涯知名左打強打者），bats 設為 L。此隊已有指定打擊人選（大谷翔平），故第 5 位內野手維持替補、不遞補第 9 棒。
const if5 = batter({ id: '2026-jpn-1b2', teamCode: TEAM, era: ERA, zh: '村上宗隆', en: '村上宗隆', jersey: null, battingOrder: null, positions: ['1B'], bats: 'L', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if6 = batter({ id: '2026-jpn-2b2', teamCode: TEAM, era: ERA, zh: '岡本和真', en: '岡本和真', jersey: null, battingOrder: null, positions: ['2B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const if7 = batter({ id: '2026-jpn-3b2', teamCode: TEAM, era: ERA, zh: '佐藤輝明', en: '佐藤輝明', jersey: null, battingOrder: null, positions: ['3B'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 外野手（LF/CF/RF 依名單順序輪流分配）                                */
/* 吉田正尚為指定打擊 rf1（先發右外野）人選，其餘依序輪流分配。          */
/* ------------------------------------------------------------------ */

// 近藤健介：已知左打（生涯知名左打接觸型打者），bats 設為 L。
const of1 = batter({ id: '2026-jpn-lf1', teamCode: TEAM, era: ERA, zh: '近藤健介', en: '近藤健介', jersey: null, battingOrder: 6, positions: ['LF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of2 = batter({ id: '2026-jpn-cf1', teamCode: TEAM, era: ERA, zh: '森下翔太', en: '森下翔太', jersey: null, battingOrder: 7, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
// 吉田正尚：已知左打（MLB Red Sox 生涯為左打），bats 設為 L。
const of3 = batter({ id: '2026-jpn-rf1', teamCode: TEAM, era: ERA, zh: '吉田正尚', en: '吉田正尚', jersey: null, battingOrder: 8, positions: ['RF'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });
const of4 = batter({ id: '2026-jpn-lf2', teamCode: TEAM, era: ERA, zh: '周東佑京', en: '周東佑京', jersey: null, battingOrder: null, positions: ['LF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });
const of5 = batter({ id: '2026-jpn-cf2', teamCode: TEAM, era: ERA, zh: '鈴木誠也', en: '鈴木誠也', jersey: null, battingOrder: null, positions: ['CF'], bats: 'R', throws: 'R', rosterClass: 'BENCH', gate: TEAM });

/* ------------------------------------------------------------------ */
/* 指定打擊                                                            */
/* ------------------------------------------------------------------ */

// 大谷翔平：已知左打右投（bats L / throws R）。
const dh1 = batter({ id: '2026-jpn-dh1', teamCode: TEAM, era: ERA, zh: '大谷翔平', en: '大谷翔平', jersey: null, battingOrder: 9, positions: ['DH'], bats: 'L', throws: 'R', rosterClass: 'STARTER', gate: TEAM });

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
