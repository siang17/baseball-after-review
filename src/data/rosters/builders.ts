/**
 * ⚠️ 示範資料建構工具 (PLACEHOLDER DATA BUILDERS)
 *
 * 這裡的球員姓名、守位分組、教練職稱是使用者提供的真實 2024 十二強四強 / 2026 WBC
 * 八強名單。但棒次、先發輪值與牛棚角色分工、以及所有統計數字（打擊率、防禦率、
 * UZR……）皆非官方公布數字，而是依球員 id 決定性生成的示範用虛構值，僅供介面與
 * 邏輯驗證。正式上線前請以官方登錄表 / WBSC / Statcast / FanGraphs 等來源替換。
 */

import { bi } from '@/lib/i18n';
import { hashString } from '@/lib/utils';
import type {
  BattingSplitLine,
  BattingStats,
  Bilingual,
  Coach,
  CoachRole,
  Era,
  FieldingStats,
  Handedness,
  Manager,
  PitcherRole,
  PitchingSplitLine,
  PitchingStats,
  Player,
  Position,
  RosterClass,
  TeamCode,
} from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 決定性亂數                                                          */
/* ------------------------------------------------------------------ */

/** 依 `id:field` 產生 0–1 之間的決定性偽亂數，同一球員同一欄位永遠得到同一個值。 */
function seeded(id: string, field: string): number {
  return hashString(`${id}:${field}`) / 0xffffffff;
}

function range(id: string, field: string, min: number, max: number): number {
  return min + seeded(id, field) * (max - min);
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const round3 = (v: number) => Math.round(v * 1000) / 1000;

/* ------------------------------------------------------------------ */
/* 統計數字生成                                                        */
/* ------------------------------------------------------------------ */

const CORNER_POSITIONS: Position[] = ['1B', '3B', 'LF', 'RF', 'DH'];
const MIDDLE_INFIELD: Position[] = ['2B', 'SS', 'C'];

function genBattingStats(id: string, positions: Position[]): BattingStats {
  const isCorner = positions.some((p) => CORNER_POSITIONS.includes(p));
  const isMiddleInfield = positions.some((p) => MIDDLE_INFIELD.includes(p));

  const avg = round3(range(id, 'avg', 0.235, 0.318));
  const obp = round3(avg + range(id, 'obpAdd', 0.045, 0.095));
  const [slgMin, slgMax] = isCorner ? [0.38, 0.56] : isMiddleInfield ? [0.34, 0.47] : [0.36, 0.52];
  const slg = round3(range(id, 'slg', slgMin, slgMax));
  const wrcPlus = Math.round(range(id, 'wrc', 85, 155));
  const war = round1(range(id, 'war', -0.5, 5.5));
  const [uzrMin, uzrMax] = isMiddleInfield ? [-5, 14] : [-10, 10];
  const uzr = round1(range(id, 'uzr', uzrMin, uzrMax));
  const uzr150 = round1(uzr * range(id, 'uzrScale', 1.1, 1.4));
  const whiffPct = round3(range(id, 'whiff', 0.14, 0.29));
  const sprintSpeed = round1(range(id, 'sprint', 24.5, 29.5));
  const attendanceRate = round3(range(id, 'attendance', 0.7, 0.98));

  return {
    g: 0, pa: 0, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0, so: 0,
    avg, obp, slg,
    ops: round3(obp + slg),
    wrcPlus, opsPlus: wrcPlus, war,
    whiffPct, exitVelocity: null, sprintSpeed,
    // 示範資料暫不生成 split，等待未來查證後的真實數字。
    vsLHP: null, vsRHP: null,
  };
}

const OUTFIELD_POSITIONS: Position[] = ['LF', 'CF', 'RF'];

/**
 * 把總 UZR 依守位傾向決定性拆成四個分項（範圍/失誤/阻殺/雙殺），
 * 權重加總後乘回總值，讓分項大致重建出總分——外野手阻殺權重較高、
 * 內野手雙殺權重較高，符合守位常識但數字本身仍是示範推估。
 */
function genUzrComponents(id: string, uzr: number, position: Position): NonNullable<FieldingStats['uzrComponents']> {
  const isMiddleInfield = MIDDLE_INFIELD.includes(position);
  const isOutfield = OUTFIELD_POSITIONS.includes(position);
  const wRng = 0.35 + range(id, 'wRng', 0, 0.25);
  const wErr = 0.15 + range(id, 'wErr', 0, 0.15);
  const wArm = (isOutfield ? 0.15 : 0.05) + range(id, 'wArm', 0, 0.1);
  const wDp = (isMiddleInfield ? 0.15 : 0.03) + range(id, 'wDp', 0, 0.07);
  const total = wRng + wErr + wArm + wDp;
  return {
    rngR: round1((uzr * wRng) / total),
    errR: round1((uzr * wErr) / total),
    armR: round1((uzr * wArm) / total),
    dpr: round1((uzr * wDp) / total),
  };
}

/** 與 genBattingStats 共用同一顆 id+field 種子，同一位球員的 UZR 在打擊/守備兩處算出同一個值。 */
function genFieldingStats(id: string, position: Position): FieldingStats {
  const isMiddleInfield = MIDDLE_INFIELD.includes(position);
  const [uzrMin, uzrMax] = isMiddleInfield ? [-5, 14] : [-10, 10];
  const uzr = round1(range(id, 'uzr', uzrMin, uzrMax));
  const uzr150 = round1(uzr * range(id, 'uzrScale', 1.1, 1.4));
  return {
    primaryPosition: position,
    innings: 0,
    uzr,
    uzr150,
    uzrComponents: genUzrComponents(id, uzr, position),
    drs: null,
    oaa: null,
    fieldingPct: null,
    attendanceRate: round3(range(id, 'attendance', 0.7, 0.98)),
  };
}

function genPitchingStats(id: string, role: PitcherRole): PitchingStats {
  const isCloserOrSetup = role === 'CL';
  const [eraMin, eraMax] = isCloserOrSetup ? [1.2, 3.2] : role === 'SP' ? [2.0, 4.6] : [2.4, 4.9];
  const era = round1(range(id, 'era', eraMin, eraMax));
  const fip = round1(era + range(id, 'fipDelta', -0.4, 0.5));
  const whip = round1(range(id, 'whip', 0.85, 1.35));
  const k9 = round1(range(id, 'k9', 6.5, 12.8));
  const bb9 = round1(range(id, 'bb9', 1.4, 4.2));
  const avgVelocity = round1(range(id, 'velo', role === 'SP' ? 90 : 93, role === 'SP' ? 97 : 101));
  const velocityDeclinePer25 = round1(range(id, 'decline', 0.25, 0.7));
  return {
    g: 0, gs: 0, ip: 0, w: 0, l: 0, sv: 0, hld: 0, h: 0, er: 0, bb: 0, so: 0,
    era, whip, eraPlus: null, fip, war: null, k9, bb9, avgVelocity, velocityDeclinePer25,
    // 示範資料暫無球季用球數與 split，等待未來查證後的真實數字。
    pitches: null, vsLHB: null, vsRHB: null,
  };
}

/* ------------------------------------------------------------------ */
/* 登機證欄位                                                          */
/* ------------------------------------------------------------------ */

function boardingPass(flightNo: string, gate: string, seat: string, seed: string): Player['boardingPass'] {
  return { gate, seat, cabin: bi('—', '—'), flightNo, barcodeSeed: seed };
}

function flightNoFor(era: Era): string {
  return era === 2024 ? 'P12 2024' : 'WBC 2026';
}

const LEAGUE_ORIGIN_BY_TEAM: Partial<Record<TeamCode, Player['leagueOrigin']>> = {
  JPN: 'NPB',
  KOR: 'KBO',
  TPE: 'CPBL',
};

/* ------------------------------------------------------------------ */
/* 建構函式                                                            */
/* ------------------------------------------------------------------ */

/** 真實球季打擊數據——只有查證過的欄位；查不到的欄位一律 null，不落回示範亂數值。 */
export interface RealBattingLine {
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  wrcPlus: number | null;
  opsPlus: number | null;
  war: number | null;
  whiffPct: number | null;
  exitVelocity: number | null;
  sprintSpeed: number | null;
  /** 出賽場次；未提供時沿用未驗證的計數。 */
  g?: number;
  /** 安打數；未提供時沿用未驗證的計數（畫面上不會顯示為標籤，見 RostersBrowser 的 >0 判斷）。 */
  h?: number;
  /** 全壘打數；未提供時同上。 */
  hr?: number;
  /** 三振數；未提供時同上。 */
  so?: number;
  /** 面對左投／右投的拆分數據；尚未查證前不提供，畫面顯示「—」。 */
  vsLHP?: BattingSplitLine | null;
  vsRHP?: BattingSplitLine | null;
}

/** 真實球季投球數據——只有查證過的欄位；查不到的欄位一律 null，不落回示範亂數值。 */
export interface RealPitchingLine {
  era: number;
  whip: number;
  eraPlus: number | null;
  fip: number | null;
  war: number | null;
  k9: number | null;
  bb9: number | null;
  avgVelocity: number | null;
  velocityDeclinePer25: number | null;
  /** 出賽場次；未提供時沿用未驗證的計數。 */
  g?: number;
  /** 投球局數，採棒球慣例記法（.1＝⅓局、.2＝⅔局，例如 150.1 代表 150⅓ 局）；未提供時沿用未驗證的計數。 */
  ip?: number;
  /** 三振數；未提供時沿用未驗證的計數。 */
  so?: number;
  /** 該球季用球數總計；查無來源就維持 null。 */
  pitches?: number | null;
  /** 面對左打／右打的被打擊拆分數據；尚未查證前不提供，畫面顯示「—」。 */
  vsLHB?: PitchingSplitLine | null;
  vsRHB?: PitchingSplitLine | null;
}

export interface BatterInput {
  id: string;
  teamCode: TeamCode;
  era: Era;
  zh: string;
  en: string;
  jersey: number | null;
  /** 先發棒次 1–9；替補球員傳 null。 */
  battingOrder: number | null;
  /** 第一個是主守位。 */
  positions: Position[];
  bats: Handedness;
  throws: Handedness;
  rosterClass: Extract<RosterClass, 'STARTER' | 'BENCH'>;
  gate: string;
  /**
   * 真實球季打擊數據（已查證來源，見呼叫端註解）。提供時取代決定性生成的示範值，
   * 同時把守備數據設為 null——避免同一位球員畫面上一部分是真數字、一部分是隨機示範值。
   */
  realBatting?: RealBattingLine;
  /**
   * 真實所屬聯盟（例如代表日本隊、但本職是 MLB 球員）。不傳就沿用
   * `LEAGUE_ORIGIN_BY_TEAM` 依國家代表隊猜測的聯盟——那個猜測對大多數只打
   * 母國職棒聯盟的球員是對的，但對大谷翔平、吉田正尚這種「代表日本隊、
   * 本職在 MLB」的球員會猜錯，需要在這裡明講。
   */
  leagueOverride?: Player['leagueOrigin'];
  /** 真實所屬球團（登機證「母隊」欄位）。不傳就維持 null（顯示「—」）。 */
  club?: Bilingual;
}

export function batter(input: BatterInput): Player {
  const { id, teamCode, era, zh, en, jersey, battingOrder, positions, bats, throws, rosterClass, gate, realBatting, leagueOverride, club } = input;
  const battingStats = realBatting
    ? { g: 0, pa: 0, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0, so: 0, vsLHP: null, vsRHP: null, ...realBatting }
    : genBattingStats(id, positions);
  const primaryPosition = positions[0];
  const isPureDh = positions.length === 1 && positions[0] === 'DH';

  return {
    id, era, teamCode,
    name: bi(zh, en),
    jersey,
    positions,
    pitcherRole: null,
    bats, throws,
    age: null, heightCm: null, weightKg: null, club: club ?? null,
    leagueOrigin: leagueOverride ?? LEAGUE_ORIGIN_BY_TEAM[teamCode] ?? 'MLB',
    rosterClass,
    battingOrder,
    batting: battingStats,
    pitching: null,
    fielding: isPureDh || realBatting ? null : genFieldingStats(id, primaryPosition),
    adjustment: null,
    boardingPass: boardingPass(
      flightNoFor(era),
      gate,
      battingOrder ? `${battingOrder}-${primaryPosition}` : `BN-${primaryPosition}`,
      id,
    ),
    scoutingNote: null,
    photoUrl: null,
  };
}

export interface PitcherInput {
  id: string;
  teamCode: TeamCode;
  era: Era;
  zh: string;
  en: string;
  jersey: number | null;
  role: PitcherRole;
  throws: Handedness;
  gate: string;
  /** 真實球季投球數據（已查證來源，見呼叫端註解）。提供時取代決定性生成的示範值。 */
  realPitching?: RealPitchingLine;
  /** 真實所屬聯盟；不傳就沿用 `LEAGUE_ORIGIN_BY_TEAM` 依國家代表隊猜測的聯盟。見 BatterInput 同名欄位的說明。 */
  leagueOverride?: Player['leagueOrigin'];
  /** 真實所屬球團（登機證「母隊」欄位）。不傳就維持 null（顯示「—」）。 */
  club?: Bilingual;
}

export function pitcher(input: PitcherInput): Player {
  const { id, teamCode, era, zh, en, jersey, role, throws, gate, realPitching, leagueOverride, club } = input;
  const rosterClass: RosterClass = role === 'SP' ? 'ROTATION' : role === 'CL' ? 'CLOSER' : 'BULLPEN';
  const pitchingStats = realPitching
    ? { g: 0, gs: 0, ip: 0, w: 0, l: 0, sv: 0, hld: 0, h: 0, er: 0, bb: 0, so: 0, pitches: null, vsLHB: null, vsRHB: null, ...realPitching }
    : genPitchingStats(id, role);

  return {
    id, era, teamCode,
    name: bi(zh, en),
    jersey,
    positions: ['P'],
    pitcherRole: role,
    bats: throws === 'S' ? 'R' : throws,
    throws,
    age: null, heightCm: null, weightKg: null, club: club ?? null,
    leagueOrigin: leagueOverride ?? LEAGUE_ORIGIN_BY_TEAM[teamCode] ?? 'MLB',
    rosterClass,
    battingOrder: null,
    batting: null,
    pitching: pitchingStats,
    fielding: null,
    adjustment: null,
    boardingPass: boardingPass(
      flightNoFor(era),
      gate,
      role === 'SP' ? 'SP' : role === 'CL' ? 'CL' : `BP-${jersey ?? '00'}`,
      id,
    ),
    scoutingNote: null,
    photoUrl: null,
  };
}

/* ------------------------------------------------------------------ */
/* 教練團                                                              */
/* ------------------------------------------------------------------ */

const COACH_ROLE_LABEL: Record<CoachRole, Bilingual> = {
  HEAD_COACH: bi('首席教練', 'Associate Head Coach'),
  PITCHING_COACH: bi('投手教練', 'Pitching Coach'),
  BATTING_COACH: bi('打擊教練', 'Batting Coach'),
  ASSISTANT_BATTING_COACH: bi('助理打擊教練', 'Assistant Batting Coach'),
  INFIELD_COACH: bi('內野守備教練', 'Infield Coach'),
  OUTFIELD_COACH: bi('外野守備教練', 'Outfield Coach'),
  INFIELD_OUTFIELD_COACH: bi('守備／跑壘教練', 'Infield/Outfield & Baserunning Coach'),
  BULLPEN_COACH: bi('牛棚教練', 'Bullpen Coach'),
  BULLPEN_CATCHER: bi('牛棚捕手', 'Bullpen Catcher'),
  FIRST_BASE_COACH: bi('一壘指導教練', 'First Base Coach'),
  THIRD_BASE_COACH: bi('三壘指導教練', 'Third Base Coach'),
  BASERUNNING_COACH: bi('跑壘教練', 'Baserunning Coach'),
  CONDITIONING_COACH: bi('體能教練', 'Conditioning Coach'),
  TACTICAL_COACH: bi('戰術教練', 'Tactical Coach'),
  OTHER: bi('教練團成員', 'Staff'),
};

export function coach(
  id: string,
  teamCode: TeamCode,
  era: Era,
  zh: string,
  en: string,
  role: CoachRole,
  roleLabel?: Bilingual,
): Coach {
  return {
    id, teamCode, era,
    name: bi(zh, en),
    role,
    roleLabel: roleLabel ?? COACH_ROLE_LABEL[role],
  };
}

export function manager(
  id: string,
  teamCode: TeamCode,
  era: Era,
  zh: string,
  en: string,
  note?: Bilingual,
): Manager {
  return {
    id, era, teamCode,
    name: bi(zh, en),
    tendency: {
      quickHook: round3(range(id, 'quickHook', 0.35, 0.65)),
      buntFrequency: round3(range(id, 'bunt', 0.3, 0.6)),
      aggressiveBaserunning: round3(range(id, 'aggro', 0.3, 0.65)),
    },
    note: note ?? null,
  };
}
