/**
 * Baseball After Review (BAR) — 核心資料型別
 * Boarding for Game Analysis
 *
 * 命名慣例：
 *  - 對外顯示文字一律使用 `Bilingual`（中／英雙語）。
 *  - 進階數據欄位可為 null，代表「該賽事層級無公開數據」，與 0 有語意差別。
 */

/* ------------------------------------------------------------------ */
/* 0. 基礎與國際化                                                     */
/* ------------------------------------------------------------------ */

export type Lang = 'zh' | 'en';

/** 所有面向使用者的字串都用這個結構，避免散落的 i18n key。 */
export interface Bilingual {
  zh: string;
  en: string;
}

/** 賽事年份分組 —— 目前只開放 2024（12 強）與 2026（WBC）。 */
export type Era = 2024 | 2026;

export type TournamentId = 'PREMIER12_2024' | 'WBC_2026';

export interface Tournament {
  id: TournamentId;
  era: Era;
  name: Bilingual;
  /** 登機證上的「航班前綴」，例如 P12 / WBC。 */
  flightPrefix: string;
  /** 該屆預設用球數上限（WBC 首輪 65 球）。 */
  defaultPitchLimit: number;
  teamCodes: TeamCode[];
}

/* ------------------------------------------------------------------ */
/* 1. 球隊與球員                                                       */
/* ------------------------------------------------------------------ */

export type TeamCode =
  | 'TPE' // 中華隊
  | 'JPN'
  | 'VEN'
  | 'USA'
  | 'CAN'
  | 'PUR'
  | 'ITA'
  | 'KOR'
  | 'DOM';

export type Handedness = 'L' | 'R' | 'S';

export type Position =
  | 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH';

export type PitcherRole = 'SP' | 'RP' | 'CL';

/** 登機證上的 Class 欄位 —— 對應陣容層級。 */
export type RosterClass =
  | 'STARTER'   // 先發 9 人      → FIRST
  | 'BENCH'     // 替補野手        → ECONOMY
  | 'ROTATION'  // 先發輪值投手    → BUSINESS
  | 'BULLPEN'   // 中繼            → BUSINESS
  | 'CLOSER'    // 終結者          → FIRST
  | 'MANAGER'   // 總教練          → CREW
  | 'SNUB';     // 新聞遺珠        → STANDBY（候補待機）

/** 聯盟來源，用於 NPB / KBO / CPBL → MLB 的數據校正。 */
export type LeagueOrigin = 'MLB' | 'MiLB' | 'NPB' | 'KBO' | 'CPBL' | 'LMB' | 'OTHER';

/** 對戰左／右投（或左／右打）拆分數據；查無資料時整組為 null，個別欄位也可能各自為 null。 */
export interface BattingSplitLine {
  /** 來源標記的樣本分母，單位依來源而定（可能是出賽場次而非嚴格打席數），僅供參考，UI 不顯示。 */
  pa: number | null;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  hr: number | null;
}

/** 投手面對左／右打者的被打擊拆分數據；查無資料時整組為 null。 */
export interface PitchingSplitLine {
  /** 來源標記的樣本分母，單位依來源而定（可能是被打局數而非嚴格打席數），僅供參考，UI 不顯示。 */
  bf: number | null;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  hr: number | null;
}

export interface BattingStats {
  g: number;
  pa: number;
  ab: number;
  h: number;
  hr: number;
  rbi: number;
  sb: number;
  bb: number;
  so: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  /** 進階：聯盟與球場校正後的打擊創造。 */
  wrcPlus: number | null;
  opsPlus: number | null;
  war: number | null;
  /** 揮空率（Whiff%），散佈圖常用軸。 */
  whiffPct: number | null;
  /** 平均擊球初速 (mph)。 */
  exitVelocity: number | null;
  /** 離壘速度 / 一壘衝刺秒數，散佈圖常用軸。 */
  sprintSpeed: number | null;
  /** 面對左投的拆分數據。 */
  vsLHP: BattingSplitLine | null;
  /** 面對右投的拆分數據。 */
  vsRHP: BattingSplitLine | null;
}

export interface PitchingStats {
  g: number;
  gs: number;
  ip: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  h: number;
  er: number;
  bb: number;
  so: number;
  era: number;
  whip: number;
  eraPlus: number | null;
  fip: number | null;
  war: number | null;
  k9: number | null;
  bb9: number | null;
  /** 平均球速 (mph)。 */
  avgVelocity: number | null;
  /** 用球數每增加 25 球的球速衰退幅度 (mph)，用於 TTOP / 用球數散佈圖。 */
  velocityDeclinePer25: number | null;
  /** 該球季用球數總計（非單場，單場用球數只存在於逐球模擬 HUD）。 */
  pitches: number | null;
  /** 面對左打者的被打擊拆分數據。 */
  vsLHB: PitchingSplitLine | null;
  /** 面對右打者的被打擊拆分數據。 */
  vsRHB: PitchingSplitLine | null;
}

/**
 * 防守數據 —— BAR 以 UZR 為核心指標。
 * UZR 為累計值、UZR/150 為每 150 場的率值（跨出賽數比較請用後者）。
 */
export interface FieldingStats {
  primaryPosition: Position;
  innings: number;
  /** Ultimate Zone Rating（累計）。 */
  uzr: number | null;
  /** UZR per 150 games。 */
  uzr150: number | null;
  /** UZR 分項：守備範圍 / 失誤 / 阻殺（外野）/ 雙殺（內野）。 */
  uzrComponents?: {
    rngR: number | null;
    errR: number | null;
    armR: number | null;
    dpr: number | null;
  };
  drs: number | null;
  oaa: number | null;
  fieldingPct: number | null;
  /** 出勤率 0–1，散佈圖 UZR vs. 出勤率使用。 */
  attendanceRate: number | null;
}

/** 國際賽（NPB/KBO/CPBL）數據換算到 MLB 尺度的校正紀錄，需在 UI 標示。 */
export interface LeagueAdjustment {
  sourceLeague: LeagueOrigin;
  /** 打擊換算係數（例如 NPB→MLB wRC+ 約 0.90）。 */
  offenseFactor: number;
  /** 投球換算係數。 */
  pitchingFactor: number;
  note: Bilingual;
}

/** 登機證版面上的欄位（Gate / Seat / Class / Flight No.）。 */
export interface BoardingPassMeta {
  /** 賽事分組，例如 "GATE A"（A 組）。 */
  gate: string;
  /** 打順或守位，例如 "3-CF"；投手用 "BP-07"。 */
  seat: string;
  /** 艙等文案，由 RosterClass 推導。 */
  cabin: Bilingual;
  /** 航班編號，例如 "WBC 2026 / JPN-VEN"。 */
  flightNo: string;
  /** 條碼字串（決定性產生，避免 SSR/CSR hydration 不一致）。 */
  barcodeSeed: string;
}

export interface Player {
  id: string;
  era: Era;
  teamCode: TeamCode;
  name: Bilingual;
  /** 背號。 */
  jersey: number | null;
  positions: Position[];
  pitcherRole: PitcherRole | null;
  bats: Handedness;
  throws: Handedness;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  club: Bilingual | null;
  leagueOrigin: LeagueOrigin;
  rosterClass: RosterClass;
  /** 打線棒次（1–9），非先發為 null。 */
  battingOrder: number | null;
  batting: BattingStats | null;
  pitching: PitchingStats | null;
  fielding: FieldingStats | null;
  adjustment: LeagueAdjustment | null;
  boardingPass: BoardingPassMeta;
  /** 球員背景／選訓論述，Case Study 用。 */
  scoutingNote: Bilingual | null;
  photoUrl: string | null;
}

export interface Manager {
  id: string;
  era: Era;
  teamCode: TeamCode;
  name: Bilingual;
  /** 執教傾向，AI 對比「歷史真實選擇」時作為先驗。 */
  tendency: {
    /** 0–1，越高越早換投。 */
    quickHook: number;
    /** 0–1，越高越常用犧牲觸擊。 */
    buntFrequency: number;
    /** 0–1，越高越常盜壘。 */
    aggressiveBaserunning: number;
  };
  note: Bilingual | null;
}

export interface Team {
  code: TeamCode;
  era: Era;
  tournamentId: TournamentId;
  name: Bilingual;
  shortName: Bilingual;
  /** 賽事分組（登機證 Gate）。 */
  group: string;
  flagEmoji: string;
  /** 主色，用於看板與圖表。 */
  colorPrimary: string;
  colorAccent: string;
}

/** 教練團職稱。職稱不易分類（合併職）時搭配 `Coach.roleLabel` 顯示原文。 */
export type CoachRole =
  | 'HEAD_COACH'
  | 'PITCHING_COACH'
  | 'BATTING_COACH'
  | 'ASSISTANT_BATTING_COACH'
  | 'INFIELD_COACH'
  | 'OUTFIELD_COACH'
  | 'INFIELD_OUTFIELD_COACH'
  | 'BULLPEN_COACH'
  | 'BULLPEN_CATCHER'
  | 'FIRST_BASE_COACH'
  | 'THIRD_BASE_COACH'
  | 'BASERUNNING_COACH'
  | 'CONDITIONING_COACH'
  | 'TACTICAL_COACH'
  | 'OTHER';

/** 教練團成員（不含總教練，總教練仍用 `Manager`）。 */
export interface Coach {
  id: string;
  teamCode: TeamCode;
  era: Era;
  name: Bilingual;
  role: CoachRole;
  /** 職稱不易分類（如「外野守備兼跑壘教練」合併職）時，這裡放原始職稱文字。 */
  roleLabel: Bilingual;
}

/** 一支球隊在某一屆的完整名單。 */
export interface Roster {
  teamCode: TeamCode;
  era: Era;
  tournamentId: TournamentId;
  manager: Manager;
  /** 總教練以外的教練團成員。 */
  coachingStaff: Coach[];
  /** 先發 9 人（含 DH），依 battingOrder 排序。 */
  lineup: Player[];
  bench: Player[];
  rotation: Player[];
  bullpen: Player[];
  closer: Player | null;
  /** 新聞遺珠（建議 3 位），附對比對象。 */
  snubs: RosterSnub[];
}

/** 遺珠專區：未入選者 vs. 入選者的數據對照。 */
export interface RosterSnub {
  player: Player;
  /** 被拿來對比的入選者 id。 */
  comparedToPlayerId: string;
  /** 遺珠理由（媒體論點）。 */
  argument: Bilingual;
  /** 逐項數據差（正值＝遺珠較優）。 */
  deltas: Array<{
    metric: string;
    label: Bilingual;
    snubValue: number | null;
    selectedValue: number | null;
    delta: number | null;
    /** 該指標是否「越高越好」。 */
    higherIsBetter: boolean;
  }>;
  /** 新聞出處。 */
  sources: Array<{ title: string; url: string; publishedAt: string }>;
}

/* ------------------------------------------------------------------ */
/* 2. 比賽狀態                                                         */
/* ------------------------------------------------------------------ */

export type HalfInning = 'TOP' | 'BOTTOM';
export type Side = 'HOME' | 'AWAY';

/** 壘包狀態：[一壘, 二壘, 三壘]，值為跑者 playerId 或 null。 */
export type BaseState = [string | null, string | null, string | null];

/** 壘包代碼，供 RE24 查表：'___' | '1__' | '_2_' | ... | '123'。 */
export type BaseCode =
  | '___' | '1__' | '_2_' | '__3'
  | '12_' | '1_3' | '_23' | '123';

export interface MatchState {
  gameId: string;
  inning: number;
  half: HalfInning;
  outs: 0 | 1 | 2 | 3;
  balls: 0 | 1 | 2 | 3;
  strikes: 0 | 1 | 2;
  bases: BaseState;
  score: { home: number; away: number };
  /** 目前打者 / 投手 / 捕手 playerId。 */
  batterId: string;
  pitcherId: string;
  catcherId: string;
  /** 進攻方。 */
  offense: Side;
  /** 該投手本場已投球數。 */
  pitcherPitchCount: number;
  /** 該打者是本場第幾輪面對此投手（TTOP 用，1/2/3+）。 */
  timesThroughOrder: number;
  /** 目前勝率（主隊視角，0–1）。 */
  winProbabilityHome: number;
  /** 槓桿指數。 */
  leverageIndex: number;
  /** 已用完的暫停 / 挑戰次數。 */
  challengesRemaining: { home: number; away: number };
}

/* ------------------------------------------------------------------ */
/* 3. 逐球資料 (Pitch-by-pitch)                                        */
/* ------------------------------------------------------------------ */

export type PitchType =
  | 'FF' | 'SI' | 'FC' | 'SL' | 'CU' | 'CH' | 'FS' | 'KN' | 'ST' | 'SV';

export type PitchResult =
  | 'BALL' | 'CALLED_STRIKE' | 'SWINGING_STRIKE' | 'FOUL'
  | 'IN_PLAY_OUT' | 'IN_PLAY_HIT' | 'HBP' | 'PITCH_CLOCK_VIOLATION';

export type BattedBallType = 'GB' | 'LD' | 'FB' | 'PU' | null;

/** PitchCom 訊號紀錄 —— 暗號通訊模擬 HUD 的原始資料。 */
export interface PitchComSignal {
  /** 發訊者：捕手主導或投手搖頭改由投手主導。 */
  sender: 'CATCHER' | 'PITCHER';
  /** 發送時間戳（ms，相對於該打席開始）。 */
  sentAtMs: number;
  /** 投手確認時間戳（ms）。 */
  acknowledgedAtMs: number | null;
  requestedPitch: PitchType;
  requestedLocation: { x: number; z: number };
  /** 是否經歷變更（搖頭 / 重打訊號）。 */
  changed: boolean;
  changeCount: number;
  /** 機具故障或訊號延誤（ms），0 表示正常。 */
  malfunctionDelayMs: number;
  malfunctionNote: Bilingual | null;
}

export interface PitchData {
  id: string;
  gameId: string;
  /** 第幾個打席。 */
  atBatIndex: number;
  /** 該打席第幾球。 */
  pitchNumber: number;
  /** 該投手本場累計球數（投完這球之後）。 */
  cumulativePitchCount: number;
  inning: number;
  half: HalfInning;
  pitcherId: string;
  batterId: string;
  catcherId: string;
  pitchType: PitchType;
  velocity: number;
  spinRate: number | null;
  /** 進壘點，x 為水平（英尺，負為打者內角側），z 為高度。 */
  location: { x: number; z: number };
  result: PitchResult;
  battedBall: {
    type: BattedBallType;
    exitVelocity: number | null;
    launchAngle: number | null;
    /** 落點分區，用於 UZR 情境對照。 */
    zone: string | null;
  } | null;
  /** 投球前的比賽狀態快照。 */
  stateBefore: Pick<MatchState, 'inning' | 'half' | 'outs' | 'balls' | 'strikes' | 'bases' | 'score'>;
  /** 這一球造成的勝率變化（主隊視角）。 */
  deltaWinProbability: number;
  leverageIndex: number;
  /** RE24 期望得分變化。 */
  re24: number | null;
  /** Pitch Timer：投手在計時器上剩餘秒數（投球瞬間）。 */
  pitchClockRemainingSec: number | null;
  pitchClockViolation: boolean;
  pitchCom: PitchComSignal | null;
  /** 文字描述（播報）。 */
  description: Bilingual;
}

/* ------------------------------------------------------------------ */
/* 4. 用球數限制與休息規則                                             */
/* ------------------------------------------------------------------ */

export type PitchLimitPreset = 65 | 50 | 30 | 'UNLIMITED';

/**
 * 國際賽用球數限制模組設定。
 * WBC 規則：達上限即強制退場；用球數落在門檻區間會觸發強制休息天數。
 */
export interface PitchLimitConfig {
  enabled: boolean;
  preset: PitchLimitPreset;
  /** 實際生效的上限；preset 為 UNLIMITED 時為 null。 */
  limit: number | null;
  /** 提前警示門檻（例如上限前 10 球亮橘燈）。 */
  warningThreshold: number;
  /**
   * 休息規則階梯：投滿 X 球需休息 Y 天。
   * 依球數由高到低排序，取第一個命中的規則。
   */
  restRules: Array<{
    minPitches: number;
    restDays: number;
    label: Bilingual;
  }>;
  /** 是否啟用 TTOP（第三輪打者）衰退預警。 */
  ttopWarningEnabled: boolean;
  /** TTOP 觸發輪次，預設 3。 */
  ttopThreshold: number;
}

/** 達標時彈出的「行李超重／托運退場」卡片資料。 */
export interface OverweightBaggageAlert {
  pitcherId: string;
  pitchCount: number;
  limit: number;
  /** 依 restRules 推導。 */
  mandatoryRestDays: number;
  /** 下一次可登板日期（ISO）。 */
  nextAvailableDate: string | null;
  severity: 'WARNING' | 'MANDATORY_REMOVAL';
  message: Bilingual;
}

/** Pitch Timer 設定。 */
export interface PitchTimerConfig {
  enabled: boolean;
  /** 壘上無人秒數（WBC 15s）。 */
  emptyBasesSec: number;
  /** 壘上有人秒數（WBC 20s）。 */
  runnersOnSec: number;
  /** 打者須就位的剩餘秒數（8s）。 */
  batterReadySec: number;
  /** 是否播放音效。 */
  soundEnabled: boolean;
}

/** PitchCom HUD 設定。 */
export interface PitchComConfig {
  enabled: boolean;
  /** 是否顯示訊號變更與故障延誤時間軸。 */
  showTimeline: boolean;
  /** 模擬機具故障機率 0–1（0 為關閉）。 */
  malfunctionRate: number;
}

/* ------------------------------------------------------------------ */
/* 5. 總教練互動決策模式                                               */
/* ------------------------------------------------------------------ */

export type DecisionType =
  | 'PITCHING_CHANGE'  // 換投
  | 'PINCH_HITTER'     // 代打
  | 'PINCH_RUNNER'     // 代跑
  | 'BUNT'             // 觸擊
  | 'IBB'              // 敬遠
  | 'STEAL'            // 盜壘
  | 'HOLD';            // 維持現狀

export interface ManagerModeConfig {
  enabled: boolean;
  /** A–D 為預設執教哲學；CUSTOM 代表使用者完全自訂。 */
  profileId: ManagerProfileId;
  /** 使用者擔任哪一方總教練。 */
  side: Side;
  /** 觸發暫停的條件。 */
  triggers: {
    /** 槓桿指數超過此值即暫停。 */
    minLeverageIndex: number;
    /** 第幾局之後才啟用（例如 6）。 */
    fromInning: number;
    /** 投手用球數達門檻即暫停。 */
    onPitchLimitThreshold: boolean;
    /** 進入 TTOP 第三輪即暫停。 */
    onTtopThreshold: boolean;
    /** 得點圈有人即暫停。 */
    onRunnersInScoringPosition: boolean;
  };
  /** 是否在做決定前先隱藏歷史真實選擇（避免劇透）。 */
  hideHistoricalUntilAnswered: boolean;
  /** 是否顯示 AI 最佳解。 */
  showOptimalCall: boolean;
}

export type ManagerProfileId = 'COACH_A' | 'COACH_B' | 'COACH_C' | 'COACH_D' | 'CUSTOM';

export interface ManagerProfile {
  id: ManagerProfileId;
  name: Bilingual;
  title: Bilingual;
  selectionLens: Bilingual;
  tacticalStyle: Bilingual;
  defenseStyle: Bilingual;
  strengths: Bilingual[];
  weaknesses: Bilingual[];
}

/** 總教練排兵介面使用的候選人；真實環境由已驗證的 RosterMember 取代。 */
export interface ManagerCandidate {
  id: string;
  name: Bilingual;
  positions: Position[];
  offenseGrade: number;
  defenseGrade: number;
  speedGrade: number;
}

/** 一個可選的調度選項。 */
export interface DecisionOption {
  id: string;
  type: DecisionType;
  label: Bilingual;
  detail: Bilingual;
  /** 換投／代打時的目標球員。 */
  targetPlayerId: string | null;
  /** 被替換下場的球員。 */
  replacedPlayerId: string | null;
  /** 模擬後的勝率變化（主隊視角）。 */
  projectedDeltaWp: number;
  /** 期望得分變化。 */
  projectedRe24: number;
  /** 模擬信心區間。 */
  confidence: { low: number; high: number } | null;
}

/** 三方對比的單一結果。 */
export interface DecisionOutcome {
  source: 'USER' | 'HISTORICAL' | 'AI_OPTIMAL';
  option: DecisionOption;
  /** 實際／模擬的勝率變化。 */
  deltaWp: number;
  /** 歷史選擇才有真實結果描述。 */
  actualResult: Bilingual | null;
  rationale: Bilingual;
}

/** 決策節點：復盤引擎在此暫停並跳出駕駛艙 HUD。 */
export interface DecisionPoint {
  id: string;
  gameId: string;
  /** 對應的 pitch id（暫停發生在這球之前）。 */
  beforePitchId: string;
  state: MatchState;
  /** 由哪一方做決定。 */
  side: Side;
  /** 觸發原因。 */
  triggerReason: Array<'HIGH_LEVERAGE' | 'PITCH_LIMIT' | 'TTOP' | 'RISP' | 'LATE_INNING'>;
  situation: Bilingual;
  options: DecisionOption[];
  historical: DecisionOutcome;
  aiOptimal: DecisionOutcome;
}

/** 使用者在某個決策節點的作答紀錄。 */
export interface UserDecisionRecord {
  decisionPointId: string;
  chosenOptionId: string;
  decidedAt: string;
  deltaWp: number;
  /** 與 AI 最佳解的差距（負值代表比最佳解差）。 */
  gapToOptimal: number;
}

/* ------------------------------------------------------------------ */
/* 6. 關鍵轉折點 (Crucial Play)                                        */
/* ------------------------------------------------------------------ */

export type CrucialPlayCategory =
  | 'PLAY'            // 場上的一球／一打
  | 'MANAGERIAL'      // 調度
  | 'DEFENSE'         // 守備（UZR 相關）
  | 'BASERUNNING'
  | 'PITCH_CLOCK';    // 計時器違規

export interface CrucialPlay {
  id: string;
  gameId: string;
  pitchId: string | null;
  decisionPointId: string | null;
  category: CrucialPlayCategory;
  inning: number;
  half: HalfInning;
  /** 絕對值最大的勝率位移。 */
  deltaWinProbability: number;
  leverageIndex: number;
  re24: number | null;
  /** 受益方。 */
  beneficiary: Side;
  title: Bilingual;
  description: Bilingual;
  /** 黑匣子解構：拆解成 3–5 條要點。 */
  breakdown: Bilingual[];
  /** 警報等級，決定 UI 顏色（橘／紅）。 */
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  videoUrl: string | null;
}

/** 勝率曲線上的一個資料點。 */
export interface WinProbabilityPoint {
  /** 序號（等同第幾個 pitch 或第幾個打席）。 */
  index: number;
  inning: number;
  half: HalfInning;
  /** 主隊勝率 0–1。 */
  home: number;
  leverageIndex: number;
  score: { home: number; away: number };
  label: Bilingual;
  /** 若此點為關鍵轉折，帶上 CrucialPlay id。 */
  crucialPlayId: string | null;
}

/* ------------------------------------------------------------------ */
/* 7. 跨年份對決模擬器                                                 */
/* ------------------------------------------------------------------ */

export type EraMode = '2024vs2024' | '2026vs2026' | '2024vs2026';

/** 兩階段選隊流程的設定。 */
export interface MatchupModeConfig {
  eraMode: EraMode;
  homeTeamYear: Era;
  awayTeamYear: Era;
  homeTeamCode: TeamCode | null;
  awayTeamCode: TeamCode | null;
  /** 中立球場或主場優勢。 */
  venue: 'NEUTRAL' | 'HOME_ADVANTAGE';
  /** 是否套用聯盟／年代校正（跨年代對決建議開啟）。 */
  applyEraAdjustment: boolean;
  /** 套用的用球數規則。 */
  pitchLimitPreset: PitchLimitPreset;
  /** 蒙地卡羅模擬次數。 */
  simulationRuns: number;
}

/** 選隊流程的步驟狀態。 */
export type MatchupStep = 'SELECT_ERA' | 'SELECT_TEAMS' | 'CONFIRM';

/** 模擬輸出。 */
export interface MatchupSimulationResult {
  config: MatchupModeConfig;
  /** 主隊勝率 0–1。 */
  homeWinRate: number;
  awayWinRate: number;
  /** 平均比分。 */
  averageScore: { home: number; away: number };
  /** 攻守評比（0–100）。 */
  grades: {
    home: MatchupGrade;
    away: MatchupGrade;
  };
  /** 勝率推演曲線（模擬中位數路徑）。 */
  winProbabilityCurve: WinProbabilityPoint[];
  /** AI 戰術推演報告（分段）。 */
  aiReport: Array<{ heading: Bilingual; body: Bilingual }>;
  /** 關鍵對位。 */
  keyMatchups: Array<{
    batterId: string;
    pitcherId: string;
    note: Bilingual;
    expectedWoba: number | null;
  }>;
  generatedAt: string;
  /**
   * 模擬診斷 —— 引擎行為的透明度資訊，不是賽事結論。
   * 用來檢查「用球數限制是否真的咬到了」這類問題。
   */
  diagnostics?: {
    runs: number;
    elapsedMs: number;
    /** 先發平均用球數。 */
    avgStarterPitches: { home: number; away: number };
    /** 因達上限被迫換投的比例（每場）。 */
    limitForcedChangeRate: { home: number; away: number };
    avgPitchersUsed: { home: number; away: number };
    /** 進入延長賽的比例。 */
    extraInningRate: number;
    /** 提前結束比賽的比例。 */
    mercyRate: number;
    /** 勝率曲線取樣的場次數（少於 runs 以控制成本）。 */
    curveSampleSize: number;
  };
}

export interface MatchupGrade {
  offense: number;
  contact: number;
  power: number;
  defense: number;   // 以 UZR 為核心
  rotation: number;
  bullpen: number;
  baserunning: number;
  overall: number;
}

/* ------------------------------------------------------------------ */
/* 8. 比賽與復盤                                                       */
/* ------------------------------------------------------------------ */

export interface Game {
  id: string;
  tournamentId: TournamentId;
  era: Era;
  date: string;
  venue: Bilingual;
  /** 賽事分組／輪次，登機證 Gate 用。 */
  round: Bilingual;
  homeTeamCode: TeamCode;
  awayTeamCode: TeamCode;
  finalScore: { home: number; away: number } | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINAL';
  /** 航班動態看板顯示用。 */
  boardStatus: Bilingual;
  pitchLimitPreset: PitchLimitPreset;
}

/** 一場比賽的完整復盤資料包。 */
export interface GameReview {
  game: Game;
  pitches: PitchData[];
  winProbability: WinProbabilityPoint[];
  crucialPlays: CrucialPlay[];
  decisionPoints: DecisionPoint[];
  /** 投手用球數與退場紀錄。 */
  pitcherUsage: Array<{
    pitcherId: string;
    side: Side;
    pitches: number;
    battersFaced: number;
    ip: number;
    removedAtPitch: number | null;
    removalReason: 'PITCH_LIMIT' | 'PERFORMANCE' | 'MATCHUP' | 'INJURY' | 'END_OF_GAME' | null;
    mandatoryRestDays: number | null;
  }>;
  /** Pitch Timer 違規紀錄。 */
  clockViolations: Array<{
    pitchId: string;
    offender: 'PITCHER' | 'BATTER';
    playerId: string;
    penalty: Bilingual;
  }>;
}

/* ------------------------------------------------------------------ */
/* 9. 專題復盤：節奏控制與牛棚銜接                                     */
/* ------------------------------------------------------------------ */

/** Pitch Timer × PitchCom 的節奏控制影響評估。 */
export interface TempoImpact {
  pitcherId: string;
  side: Side;
  /** 平均投球間隔（秒）。 */
  avgTempoSec: number;
  /** 壘上有人時的平均間隔（秒）。 */
  avgTempoRunnersOnSec: number;
  /** 計時器剩餘 < 3 秒才出手的比例（0–1），代表被計時器逼迫的程度。 */
  rushedPitchRate: number;
  clockViolations: number;
  /** PitchCom 訊號變更總次數。 */
  pitchComChanges: number;
  /** 平均確認延遲（ms）。 */
  avgAckLatencyMs: number;
  malfunctionEvents: number;
  /**
   * 節奏快／慢兩組的投球結果對照。
   * 用來論證「被計時器逼快的球」是否品質下降。
   */
  splits: Array<{
    bucket: 'FAST' | 'SLOW';
    label: Bilingual;
    pitches: number;
    whiffPct: number;
    xwoba: number;
    avgVelocity: number;
  }>;
  note: Bilingual;
}

/** 65 球限制下的牛棚銜接檢討。 */
export interface BullpenBridgePlan {
  side: Side;
  /** 實際發生的接力段落，依局數排列。 */
  legs: Array<{
    pitcherId: string;
    fromInning: number;
    /** 含小數表示半局，例如 6.2 = 六局兩出局。 */
    toInning: number;
    pitches: number;
    battersFaced: number;
    runsAllowed: number;
    avgLeverageIndex: number;
    /** 依用球數推導的強制休息天數。 */
    restDaysIncurred: number;
    /**
     * 該段落的勝率貢獻，**以 `side` 自身視角**（正值＝對本隊有利）。
     * 與 `CrucialPlay.deltaWinProbability`（主隊視角）不同，
     * 因為牛棚檢討天然是站在該隊教練團的角度閱讀。
     */
    deltaWp: number;
    removalReason: 'PITCH_LIMIT' | 'PERFORMANCE' | 'MATCHUP' | 'INJURY' | 'END_OF_GAME' | null;
  }>;
  /** 建議的替代銜接方式。 */
  alternative: {
    label: Bilingual;
    rationale: Bilingual;
    /** 相對於實際做法的勝率增益，同樣為 `side` 自身視角。 */
    projectedDeltaWp: number;
  } | null;
  /** 對下一場的續航影響。 */
  nextGameImpact: Bilingual;
  note: Bilingual;
}

/* ------------------------------------------------------------------ */
/* 10. 散佈圖分析器                                                    */
/* ------------------------------------------------------------------ */

/** 可作為散佈圖軸的指標鍵。 */
export type MetricKey =
  | 'uzr' | 'uzr150' | 'drs' | 'oaa' | 'attendanceRate'
  | 'war' | 'wrcPlus' | 'opsPlus' | 'ops' | 'obp' | 'slg' | 'avg'
  | 'whiffPct' | 'exitVelocity' | 'sprintSpeed'
  | 'era' | 'eraPlus' | 'fip' | 'whip' | 'k9' | 'bb9'
  | 'avgVelocity' | 'velocityDeclinePer25' | 'pitchCount';

export interface MetricDefinition {
  key: MetricKey;
  label: Bilingual;
  /** 取值來源。 */
  domain: 'batting' | 'pitching' | 'fielding';
  unit: string | null;
  higherIsBetter: boolean;
  /** 建議的軸範圍。 */
  suggestedRange: [number, number] | null;
  description: Bilingual;
}

export interface ScatterPlotConfig {
  xMetric: MetricKey;
  yMetric: MetricKey;
  /** 篩選條件。 */
  filters: {
    eras: Era[];
    teamCodes: TeamCode[];
    positions: Position[];
    rosterClasses: RosterClass[];
    minInnings: number | null;
    minPlateAppearances: number | null;
  };
  /** 氣泡大小對應的指標。 */
  sizeMetric: MetricKey | null;
  /** 是否顯示趨勢線。 */
  showTrendLine: boolean;
  /** 是否標註遺珠。 */
  highlightSnubs: boolean;
}
