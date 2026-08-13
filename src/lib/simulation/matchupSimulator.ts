import { bi } from '@/lib/i18n';
import { clamp } from '@/lib/utils';
import type {
  Era,
  MatchupGrade,
  MatchupModeConfig,
  MatchupSimulationResult,
  TeamCode,
  WinProbabilityPoint,
} from '@/types/baseball';
import { DEFAULT_SIM_OPTIONS, simulateGame, type GameResult, type SimTeam } from './gameSim';
import { makeRng, seedFrom } from './random';
import { expectedWoba, plateAppearanceProbs, type BatterProfile, type PitcherProfile } from './ratings';

/**
 * Transparent baseline ratings for demo teams. These are scenario inputs,
 * not official roster projections. Replace them with roster-derived ratings
 * when verified player data is connected.
 */
const TEAM_BASELINES: Record<TeamCode, { offense: number; pitching: number; defense: number; speed: number }> = {
  TPE: { offense: 0.96, pitching: 1.02, defense: 1.04, speed: 1.01 },
  JPN: { offense: 1.12, pitching: 1.16, defense: 1.14, speed: 1.06 },
  VEN: { offense: 1.10, pitching: 1.04, defense: 0.99, speed: 1.03 },
  USA: { offense: 1.14, pitching: 1.09, defense: 1.02, speed: 1.02 },
  CAN: { offense: 0.99, pitching: 0.98, defense: 0.98, speed: 1.00 },
  PUR: { offense: 1.06, pitching: 1.06, defense: 1.02, speed: 1.05 },
  ITA: { offense: 0.94, pitching: 0.95, defense: 0.97, speed: 0.98 },
  KOR: { offense: 1.02, pitching: 1.00, defense: 1.03, speed: 1.00 },
  DOM: { offense: 1.15, pitching: 1.08, defense: 1.00, speed: 1.06 },
};

const ERA_ENVIRONMENT: Record<Era, number> = { 2024: 0.98, 2026: 1 };

/**
 * 把基準值重新置中到 1.0。
 *
 * 手寫的 TEAM_BASELINES 九隊平均約 1.05，代表「每一隊都在平均之上」——
 * 這與 ratings.ts 的 LEAGUE 基準（1.0 = 聯盟平均）互相矛盾，會把
 * 模擬得分環境整體墊高。這裡除以各維度平均，保留隊伍間的相對差距，
 * 只把絕對水準拉回基準。
 */
const BASELINE_KEYS = ['offense', 'pitching', 'defense', 'speed'] as const;

const NORMALISED_BASELINES: typeof TEAM_BASELINES = (() => {
  const codes = Object.keys(TEAM_BASELINES) as TeamCode[];
  const means = Object.fromEntries(
    BASELINE_KEYS.map((key) => [
      key,
      codes.reduce((sum, code) => sum + TEAM_BASELINES[code][key], 0) / codes.length,
    ]),
  ) as Record<(typeof BASELINE_KEYS)[number], number>;

  return Object.fromEntries(
    codes.map((code) => [
      code,
      Object.fromEntries(
        BASELINE_KEYS.map((key) => [key, TEAM_BASELINES[code][key] / means[key]]),
      ),
    ]),
  ) as typeof TEAM_BASELINES;
})();

/**
 * 牛棚梯隊深度。WBC 名單實際帶 13–14 名投手，模擬用 8 人已足以呈現
 * 「用球數上限把好投手燒完後只能用差投手」這個核心取捨。
 * 越後段的中繼壓制力越低——這正是緊縮上限的代價來源。
 */
const RELIEVER_DEPTH = 6;

function makeTeam(code: TeamCode, era: Era, adjustEra: boolean): SimTeam {
  const base = NORMALISED_BASELINES[code];
  const env = adjustEra ? ERA_ENVIRONMENT[era] : 1;
  const lineup: BatterProfile[] = Array.from({ length: 9 }, (_, index) => {
    const orderEffect = 1.075 - index * 0.018;
    return {
      playerId: `${era}-${code}-bat-${index + 1}`,
      offenseIndex: base.offense * orderEffect * env,
      powerIndex: base.offense * (1.08 - index * 0.015),
      strikeoutIndex: clamp(1.08 - (base.offense - 1) * 0.45 + index * 0.01, 0.7, 1.3),
      walkIndex: clamp(0.94 + (base.offense - 1) * 0.7, 0.75, 1.25),
      speed: 27 * base.speed + (index % 3) * 0.25,
    };
  });
  // 順序即調度順序：先發 → 中繼（品質遞減）→ 終結者（名單最後一位）。
  const pitchers: PitcherProfile[] = [
    { playerId: `${era}-${code}-sp`, suppressionIndex: base.pitching * 1.04 * env, strikeoutIndex: base.pitching * 1.03, walkIndex: 1.04 / base.pitching, velocityDeclinePer25: 0.42, role: 'SP' },
    ...Array.from({ length: RELIEVER_DEPTH }, (_, index) => ({
      playerId: `${era}-${code}-rp${index + 1}`,
      // 深度懲罰：第 1 名中繼優於先發，第 6 名明顯較差。
      suppressionIndex: base.pitching * (1.05 - index * 0.05) * env,
      strikeoutIndex: base.pitching * (1.06 - index * 0.03),
      walkIndex: (1.0 + index * 0.04) / base.pitching,
      velocityDeclinePer25: 0.32 + index * 0.02,
      role: 'RP' as const,
    })),
    { playerId: `${era}-${code}-cl`, suppressionIndex: base.pitching * 1.1 * env, strikeoutIndex: base.pitching * 1.12, walkIndex: 0.98 / base.pitching, velocityDeclinePer25: 0.38, role: 'CL' },
  ];
  return { code, era, lineup, pitchers };
}

function grade(code: TeamCode): MatchupGrade {
  // 用置中後的基準值，50 分才真的代表「這批球隊的平均」。
  const b = NORMALISED_BASELINES[code];
  const n = (value: number) => Math.round(clamp(50 + (value - 1) * 125, 0, 100));
  const offense = n(b.offense);
  const rotation = n(b.pitching * 1.04);
  const bullpen = n(b.pitching * 1.03);
  const defense = n(b.defense);
  const baserunning = n(b.speed);
  return { offense, contact: n(b.offense * 0.99), power: n(b.offense * 1.03), defense, rotation, bullpen, baserunning, overall: Math.round(offense * 0.30 + rotation * 0.22 + bullpen * 0.18 + defense * 0.18 + baserunning * 0.12) };
}

function homeProbability(point: GameResult['timeline'][number], final: GameResult): number {
  const inningsRemaining = Math.max(0.35, 9 - point.inning + (point.half === 'TOP' ? 0.5 : 0));
  const scoreDelta = point.home - point.away;
  if (point.inning === final.innings && point.half === 'BOTTOM') return final.homeScore > final.awayScore ? 1 : 0;
  return clamp(1 / (1 + Math.exp(-(scoreDelta * 0.78 + 0.12) / Math.sqrt(inningsRemaining))), 0.02, 0.98);
}

function curve(result: GameResult): WinProbabilityPoint[] {
  return result.timeline.map((point, index) => ({
    index,
    inning: point.inning,
    half: point.half,
    home: homeProbability(point, result),
    leverageIndex: Number((1 + Math.min(2.5, Math.abs(point.home - point.away) === 0 ? point.inning / 4 : point.inning / (Math.abs(point.home - point.away) + 2))).toFixed(2)),
    score: { home: point.home, away: point.away },
    label: bi(`${point.inning} 局${point.half === 'TOP' ? '上' : '下'}`, `${point.half === 'TOP' ? 'Top' : 'Bottom'} ${point.inning}`),
    crucialPlayId: null,
  }));
}

/**
 * 關鍵對位：列出期望 wOBA 最高的打者／投手組合。
 *
 * 只取「投手狀態全新」（無 TTOP 懲罰、無疲勞）的基準值，
 * 目的是回答「誰對誰最危險」，而不是重現某一個特定情境。
 */
function keyMatchupsFor(
  home: SimTeam,
  away: SimTeam,
): MatchupSimulationResult['keyMatchups'] {
  const fresh = { ttopPenalty: 0, fatigue: 0, homeBoost: 1 };
  const candidates: Array<{ batterId: string; pitcherId: string; woba: number; offenseSide: 'HOME' | 'AWAY'; pitcherRole: PitcherProfile['role'] }> = [];

  for (const [offense, defense, side] of [
    [home, away, 'HOME'],
    [away, home, 'AWAY'],
  ] as const) {
    // 先發與終結者是每場必然登板的兩個節點。
    const anchors = [defense.pitchers[0], defense.pitchers[defense.pitchers.length - 1]];
    for (const batter of offense.lineup.slice(0, 5)) {
      for (const pitcher of anchors) {
        candidates.push({
          batterId: batter.playerId,
          pitcherId: pitcher.playerId,
          woba: expectedWoba(plateAppearanceProbs(batter, pitcher, fresh)),
          offenseSide: side,
          pitcherRole: pitcher.role,
        });
      }
    }
  }

  return candidates
    .sort((a, b) => b.woba - a.woba)
    .slice(0, 3)
    .map((entry) => ({
      batterId: entry.batterId,
      pitcherId: entry.pitcherId,
      expectedWoba: entry.woba,
      note: bi(
        `${entry.offenseSide === 'HOME' ? '主隊' : '客隊'}打者對上${entry.pitcherRole === 'SP' ? '先發' : '終結者'}，期望 wOBA ${entry.woba.toFixed(3)}，為全場最危險的對位之一。`,
        `${entry.offenseSide === 'HOME' ? 'Home' : 'Away'} bat versus the ${entry.pitcherRole === 'SP' ? 'starter' : 'closer'} — an expected wOBA of ${entry.woba.toFixed(3)}, among the most dangerous matchups in the game.`,
      ),
    }));
}

export function runMatchupSimulation(config: MatchupModeConfig): MatchupSimulationResult {
  if (!config.homeTeamCode || !config.awayTeamCode) throw new Error('Both teams must be selected.');
  const runs = clamp(Math.floor(config.simulationRuns || 10000), 100, 20000);
  const home = makeTeam(config.homeTeamCode, config.homeTeamYear, config.applyEraAdjustment);
  const away = makeTeam(config.awayTeamCode, config.awayTeamYear, config.applyEraAdjustment);
  const options = { ...DEFAULT_SIM_OPTIONS, pitchLimit: config.pitchLimitPreset === 'UNLIMITED' ? null : config.pitchLimitPreset, homeBoost: config.venue === 'HOME_ADVANTAGE' ? 1.018 : 1 };
  const started = Date.now();
  let homeWins = 0;
  let homeRuns = 0;
  let awayRuns = 0;
  let extraInnings = 0;
  let mercy = 0;
  let starterHome = 0;
  let starterAway = 0;
  let forcedHomeGames = 0;
  let forcedAwayGames = 0;
  let pitchersHome = 0;
  let pitchersAway = 0;
  const samples: GameResult[] = [];
  for (let i = 0; i < runs; i++) {
    const result = simulateGame(home, away, options, makeRng(seedFrom(config.homeTeamCode, config.awayTeamCode, config.eraMode, config.pitchLimitPreset, i)));
    if (result.homeScore > result.awayScore) homeWins += 1;
    homeRuns += result.homeScore;
    awayRuns += result.awayScore;
    if (result.innings > 9) extraInnings += 1;
    if (result.endedByMercy) mercy += 1;
    starterHome += result.starterPitches.home;
    starterAway += result.starterPitches.away;
    if (result.limitForcedChanges.home > 0) forcedHomeGames += 1;
    if (result.limitForcedChanges.away > 0) forcedAwayGames += 1;
    pitchersHome += result.pitchersUsed.home;
    pitchersAway += result.pitchersUsed.away;
    if (samples.length < 80) samples.push(result);
  }
  const representative = samples.sort((a, b) => Math.abs((a.homeScore - a.awayScore)) - Math.abs((b.homeScore - b.awayScore)))[Math.floor(samples.length / 2)];
  const homeWinRate = homeWins / runs;
  const homeGrade = grade(config.homeTeamCode);
  const awayGrade = grade(config.awayTeamCode);
  return {
    config,
    homeWinRate,
    awayWinRate: 1 - homeWinRate,
    averageScore: { home: Number((homeRuns / runs).toFixed(2)), away: Number((awayRuns / runs).toFixed(2)) },
    grades: { home: homeGrade, away: awayGrade },
    winProbabilityCurve: curve(representative),
    aiReport: [
      { heading: bi('勝率結論', 'Win outlook'), body: bi(`${config.homeTeamCode} 的模擬勝率為 ${(homeWinRate * 100).toFixed(1)}%。差距主要來自先發壓制與攻擊基準的合成。`, `${config.homeTeamCode} wins ${(homeWinRate * 100).toFixed(1)}% of simulated games; starter suppression and offensive baseline drive the gap.`) },
      { heading: bi('用球數調度', 'Pitch-limit call'), body: bi(options.pitchLimit === null ? '本次採無限制模式；先發更常因第三輪打者與表現而退場。' : `本次採 ${options.pitchLimit} 球上限；達門檻時引擎會強制換投，並將牛棚耗損納入結果。`, options.pitchLimit === null ? 'No pitch limit: starters leave more often because of TTOP and performance.' : `The ${options.pitchLimit}-pitch cap forces a pitching change at the threshold and includes bullpen workload in the result.`) },
    ],
    keyMatchups: keyMatchupsFor(home, away),
    generatedAt: new Date().toISOString(),
    diagnostics: { runs, elapsedMs: Date.now() - started, avgStarterPitches: { home: Number((starterHome / runs).toFixed(1)), away: Number((starterAway / runs).toFixed(1)) }, limitForcedChangeRate: { home: forcedHomeGames / runs, away: forcedAwayGames / runs }, avgPitchersUsed: { home: Number((pitchersHome / runs).toFixed(2)), away: Number((pitchersAway / runs).toFixed(2)) }, extraInningRate: extraInnings / runs, mercyRate: mercy / runs, curveSampleSize: samples.length },
  };
}
