import { bi } from './i18n';
import type {
  Era,
  MetricDefinition,
  MetricKey,
  PitchLimitConfig,
  PitchLimitPreset,
  RosterClass,
  Team,
  TeamCode,
  Tournament,
} from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 賽事                                                                */
/* ------------------------------------------------------------------ */

export const TOURNAMENTS: Record<Era, Tournament> = {
  2024: {
    id: 'PREMIER12_2024',
    era: 2024,
    name: bi('2024 世界棒球 12 強賽', '2024 WBSC Premier12'),
    flightPrefix: 'P12',
    defaultPitchLimit: 65,
    teamCodes: ['TPE', 'JPN', 'VEN', 'USA'],
  },
  2026: {
    id: 'WBC_2026',
    era: 2026,
    name: bi('2026 世界棒球經典賽', '2026 World Baseball Classic'),
    flightPrefix: 'WBC',
    defaultPitchLimit: 65,
    teamCodes: ['JPN', 'VEN', 'USA', 'CAN', 'PUR', 'ITA', 'KOR', 'DOM'],
  },
};

const TEAM_META: Record<
  TeamCode,
  { name: [string, string]; short: [string, string]; flag: string; primary: string; accent: string }
> = {
  TPE: { name: ['中華隊', 'Chinese Taipei'], short: ['中華', 'TPE'], flag: '🇹🇼', primary: '#0b2545', accent: '#d9381e' },
  JPN: { name: ['日本隊', 'Japan'], short: ['日本', 'JPN'], flag: '🇯🇵', primary: '#1b2f6b', accent: '#bc002d' },
  VEN: { name: ['委內瑞拉隊', 'Venezuela'], short: ['委內', 'VEN'], flag: '🇻🇪', primary: '#8b1a1a', accent: '#ffcc00' },
  USA: { name: ['美國隊', 'United States'], short: ['美國', 'USA'], flag: '🇺🇸', primary: '#0a3161', accent: '#b31942' },
  CAN: { name: ['加拿大隊', 'Canada'], short: ['加國', 'CAN'], flag: '🇨🇦', primary: '#a6192e', accent: '#ffffff' },
  PUR: { name: ['波多黎各隊', 'Puerto Rico'], short: ['波多', 'PUR'], flag: '🇵🇷', primary: '#0050a4', accent: '#ed0000' },
  ITA: { name: ['義大利隊', 'Italy'], short: ['義國', 'ITA'], flag: '🇮🇹', primary: '#008c45', accent: '#cd212a' },
  KOR: { name: ['韓國隊', 'South Korea'], short: ['韓國', 'KOR'], flag: '🇰🇷', primary: '#0f2d69', accent: '#cd2e3a' },
  DOM: { name: ['多明尼加隊', 'Dominican Republic'], short: ['多明', 'DOM'], flag: '🇩🇴', primary: '#002d62', accent: '#ce1126' },
};

/** 分組（Gate）指派：僅為介面示意，實際分組請以官方賽程為準。 */
const GROUPS: Partial<Record<Era, Record<string, string>>> = {
  2024: { TPE: 'B', JPN: 'B', VEN: 'A', USA: 'A' },
  2026: { JPN: 'C', KOR: 'C', VEN: 'A', USA: 'D', CAN: 'D', PUR: 'A', ITA: 'B', DOM: 'B' },
};

export function buildTeam(code: TeamCode, era: Era): Team {
  const meta = TEAM_META[code];
  return {
    code,
    era,
    tournamentId: TOURNAMENTS[era].id,
    name: bi(meta.name[0], meta.name[1]),
    shortName: bi(meta.short[0], meta.short[1]),
    group: GROUPS[era]?.[code] ?? '—',
    flagEmoji: meta.flag,
    colorPrimary: meta.primary,
    colorAccent: meta.accent,
  };
}

export const TEAMS_BY_ERA: Record<Era, Team[]> = {
  2024: TOURNAMENTS[2024].teamCodes.map((c) => buildTeam(c, 2024)),
  2026: TOURNAMENTS[2026].teamCodes.map((c) => buildTeam(c, 2026)),
};

export function getTeam(code: TeamCode, era: Era): Team | undefined {
  return TEAMS_BY_ERA[era].find((t) => t.code === code);
}

/* ------------------------------------------------------------------ */
/* 登機證艙等對應                                                      */
/* ------------------------------------------------------------------ */

export const CABIN_BY_CLASS: Record<RosterClass, { zh: string; en: string; tone: 'first' | 'business' | 'economy' | 'crew' | 'standby' }> = {
  STARTER: { zh: '頭等艙 先發', en: 'FIRST · STARTER', tone: 'first' },
  CLOSER: { zh: '頭等艙 終結者', en: 'FIRST · CLOSER', tone: 'first' },
  ROTATION: { zh: '商務艙 先發輪值', en: 'BUSINESS · ROTATION', tone: 'business' },
  BULLPEN: { zh: '商務艙 牛棚', en: 'BUSINESS · BULLPEN', tone: 'business' },
  BENCH: { zh: '經濟艙 替補', en: 'ECONOMY · BENCH', tone: 'economy' },
  MANAGER: { zh: '機組員 總教練', en: 'CREW · MANAGER', tone: 'crew' },
  SNUB: { zh: '候補 遺珠', en: 'STANDBY · SNUB', tone: 'standby' },
};

/* ------------------------------------------------------------------ */
/* 用球數限制                                                          */
/* ------------------------------------------------------------------ */

export const PITCH_LIMIT_PRESETS: PitchLimitPreset[] = [65, 50, 30, 'UNLIMITED'];

/**
 * WBC 休息規則：50 球以上休 4 天、30–49 球休 1 天。
 * 連續兩天出賽後亦須休息 1 天（此規則另於賽程層級處理）。
 */
export const DEFAULT_REST_RULES: PitchLimitConfig['restRules'] = [
  { minPitches: 50, restDays: 4, label: bi('投滿 50 球以上 → 休息 4 天', '50+ pitches → 4 days rest') },
  { minPitches: 30, restDays: 1, label: bi('投滿 30–49 球 → 休息 1 天', '30–49 pitches → 1 day rest') },
  { minPitches: 0, restDays: 0, label: bi('未滿 30 球 → 無強制休息', 'Under 30 pitches → no mandatory rest') },
];

export function createPitchLimitConfig(
  preset: PitchLimitPreset = 65,
  enabled = true,
): PitchLimitConfig {
  const limit = preset === 'UNLIMITED' ? null : preset;
  return {
    enabled,
    preset,
    limit,
    warningThreshold: limit ? Math.max(0, limit - 10) : Number.POSITIVE_INFINITY,
    restRules: DEFAULT_REST_RULES,
    ttopWarningEnabled: true,
    ttopThreshold: 3,
  };
}

export function restDaysFor(pitchCount: number, config: PitchLimitConfig): number {
  return config.restRules.find((r) => pitchCount >= r.minPitches)?.restDays ?? 0;
}

/* ------------------------------------------------------------------ */
/* 散佈圖可用指標                                                      */
/* ------------------------------------------------------------------ */

export const METRICS: Record<MetricKey, MetricDefinition> = {
  uzr: { key: 'uzr', label: bi('UZR 綜合守備', 'UZR'), domain: 'fielding', unit: 'runs', higherIsBetter: true, suggestedRange: [-15, 20], description: bi('守備範圍、失誤、阻殺與雙殺的綜合失分節省值。', 'Composite runs saved from range, errors, arm and double plays.') },
  uzr150: { key: 'uzr150', label: bi('UZR/150', 'UZR/150'), domain: 'fielding', unit: 'runs/150G', higherIsBetter: true, suggestedRange: [-20, 25], description: bi('換算為 150 場的 UZR 率值，跨出賽數比較用。', 'UZR scaled to 150 games; use when innings differ.') },
  drs: { key: 'drs', label: bi('DRS 防守失分節省', 'DRS'), domain: 'fielding', unit: 'runs', higherIsBetter: true, suggestedRange: [-15, 25], description: bi('Defensive Runs Saved。', 'Defensive Runs Saved.') },
  oaa: { key: 'oaa', label: bi('OAA 出局數增值', 'OAA'), domain: 'fielding', unit: 'outs', higherIsBetter: true, suggestedRange: [-15, 25], description: bi('Outs Above Average。', 'Outs Above Average.') },
  attendanceRate: { key: 'attendanceRate', label: bi('出勤率', 'Attendance Rate'), domain: 'fielding', unit: '%', higherIsBetter: true, suggestedRange: [0, 1], description: bi('該守位的出賽局數佔比。', 'Share of team innings played at the position.') },
  war: { key: 'war', label: bi('WAR 勝場貢獻', 'WAR'), domain: 'batting', unit: 'wins', higherIsBetter: true, suggestedRange: [-1, 10], description: bi('Wins Above Replacement。', 'Wins Above Replacement.') },
  wrcPlus: { key: 'wrcPlus', label: bi('wRC+ 打擊創造', 'wRC+'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [40, 200], description: bi('校正球場與聯盟後的打擊創造，100 為聯盟平均。', 'Park- and league-adjusted offense; 100 is league average.') },
  opsPlus: { key: 'opsPlus', label: bi('OPS+', 'OPS+'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [40, 200], description: bi('校正後的 OPS，100 為聯盟平均。', 'Adjusted OPS; 100 is league average.') },
  ops: { key: 'ops', label: bi('OPS', 'OPS'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [0.4, 1.2], description: bi('上壘率加長打率。', 'On-base plus slugging.') },
  obp: { key: 'obp', label: bi('上壘率', 'OBP'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [0.2, 0.5], description: bi('上壘率。', 'On-base percentage.') },
  slg: { key: 'slg', label: bi('長打率', 'SLG'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [0.2, 0.75], description: bi('長打率。', 'Slugging percentage.') },
  avg: { key: 'avg', label: bi('打擊率', 'AVG'), domain: 'batting', unit: null, higherIsBetter: true, suggestedRange: [0.15, 0.4], description: bi('打擊率。', 'Batting average.') },
  whiffPct: { key: 'whiffPct', label: bi('揮空率', 'Whiff%'), domain: 'batting', unit: '%', higherIsBetter: false, suggestedRange: [0, 0.45], description: bi('揮棒落空次數 ÷ 揮棒次數。', 'Swings and misses divided by swings.') },
  exitVelocity: { key: 'exitVelocity', label: bi('平均擊球初速', 'Exit Velocity'), domain: 'batting', unit: 'mph', higherIsBetter: true, suggestedRange: [80, 98], description: bi('擊球出棒瞬間的球速。', 'Average speed of the ball off the bat.') },
  sprintSpeed: { key: 'sprintSpeed', label: bi('離壘速度', 'Sprint Speed'), domain: 'batting', unit: 'ft/s', higherIsBetter: true, suggestedRange: [23, 31], description: bi('最佳衝刺區間的平均速度。', 'Feet per second in the fastest one-second window.') },
  era: { key: 'era', label: bi('防禦率', 'ERA'), domain: 'pitching', unit: null, higherIsBetter: false, suggestedRange: [0, 8], description: bi('每 9 局自責分。', 'Earned runs per nine innings.') },
  eraPlus: { key: 'eraPlus', label: bi('ERA+', 'ERA+'), domain: 'pitching', unit: null, higherIsBetter: true, suggestedRange: [40, 220], description: bi('校正後防禦率，100 為聯盟平均。', 'Adjusted ERA; 100 is league average.') },
  fip: { key: 'fip', label: bi('FIP 獨立防禦率', 'FIP'), domain: 'pitching', unit: null, higherIsBetter: false, suggestedRange: [1, 7], description: bi('僅計三振、保送、觸身與全壘打。', 'Fielding Independent Pitching.') },
  whip: { key: 'whip', label: bi('WHIP', 'WHIP'), domain: 'pitching', unit: null, higherIsBetter: false, suggestedRange: [0.6, 2], description: bi('每局被上壘率。', 'Walks plus hits per inning pitched.') },
  k9: { key: 'k9', label: bi('K/9', 'K/9'), domain: 'pitching', unit: null, higherIsBetter: true, suggestedRange: [3, 15], description: bi('每 9 局三振數。', 'Strikeouts per nine innings.') },
  bb9: { key: 'bb9', label: bi('BB/9', 'BB/9'), domain: 'pitching', unit: null, higherIsBetter: false, suggestedRange: [0, 8], description: bi('每 9 局保送數。', 'Walks per nine innings.') },
  avgVelocity: { key: 'avgVelocity', label: bi('平均球速', 'Avg Velocity'), domain: 'pitching', unit: 'mph', higherIsBetter: true, suggestedRange: [82, 102], description: bi('速球平均球速。', 'Average fastball velocity.') },
  velocityDeclinePer25: { key: 'velocityDeclinePer25', label: bi('球速下滑率 / 25 球', 'Velo Decline per 25'), domain: 'pitching', unit: 'mph', higherIsBetter: false, suggestedRange: [0, 1.5], description: bi('每多投 25 球的球速衰退幅度，用球數限制議題核心。', 'Fastball velocity lost per additional 25 pitches.') },
  pitchCount: { key: 'pitchCount', label: bi('用球數', 'Pitch Count'), domain: 'pitching', unit: 'pitches', higherIsBetter: true, suggestedRange: [0, 110], description: bi('單場用球數。', 'Pitches thrown in a game.') },
};

export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[];
