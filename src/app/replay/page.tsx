'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, PlaneTakeoff, RefreshCcw } from 'lucide-react';
import { CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { WinProbabilityChart } from '@/components/analysis/WinProbabilityChart';
import { ManagerDecisionModal } from '@/components/manager/ManagerDecisionModal';
import { BaseRunnerDiagram } from '@/components/replay/BaseRunnerDiagram';
import { BattingHeatZone } from '@/components/replay/BattingHeatZone';
import { BattingTrajectoryChart } from '@/components/replay/BattingTrajectoryChart';
import { BatterVsPitcherPanel } from '@/components/replay/BatterVsPitcherPanel';
import { SnubImpactPanel } from '@/components/replay/SnubImpactPanel';
import { StrikeZoneGrid } from '@/components/replay/StrikeZoneGrid';
import { TacticalControlHUD } from '@/components/replay/TacticalControlHUD';
import { playerById, rosterFor } from '@/data/rosters';
import { SCHEDULE_2024 } from '@/data/games/schedule2024';
import { SCHEDULE_2026 } from '@/data/games/schedule2026';
import { TOURNAMENTS, getTeam } from '@/lib/constants';
import { UI } from '@/lib/i18n';
import { generateGameReviewDetailed, type GameReviewResult } from '@/lib/simulation/gameReviewGenerator';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useReplayStore } from '@/store/useReplayStore';
import type { Era, Game, MatchState, Player, Roster, UserDecisionRecord } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 共用：由自訂打線/投手組出一份 Roster                                  */
/* ------------------------------------------------------------------ */

function selectablePlayers(roster: Roster): Player[] {
  return [...roster.lineup, ...roster.bench, ...roster.snubs.map((s) => s.player)];
}

function buildCustomRoster(base: Roster, lineupIds: string[], pitcherId: string): Roster {
  const pool = selectablePlayers(base);
  const lineup = lineupIds.map((id, i) => {
    const player = pool.find((p) => p.id === id) ?? base.lineup[i];
    return { ...player, battingOrder: i + 1, rosterClass: 'STARTER' as const };
  });
  const bench = pool.filter((p) => !lineupIds.includes(p.id) && base.bench.some((b) => b.id === p.id));
  const pitcherPool = [...base.rotation, ...base.bullpen, ...(base.closer ? [base.closer] : [])];
  const starter = pitcherPool.find((p) => p.id === pitcherId) ?? base.rotation[0];
  const rotation = [starter, ...base.rotation.filter((p) => p.id !== starter.id)];
  return { ...base, lineup, bench, rotation };
}

function matchStateFromPitch(pitch: GameReviewResult['review']['pitches'][number], review: GameReviewResult['review']): MatchState {
  const wpPoint = review.winProbability[pitch.atBatIndex] ?? review.winProbability[review.winProbability.length - 1];
  return {
    gameId: pitch.gameId,
    inning: pitch.inning,
    half: pitch.half,
    outs: pitch.stateBefore.outs,
    balls: pitch.stateBefore.balls,
    strikes: pitch.stateBefore.strikes,
    bases: pitch.stateBefore.bases,
    score: pitch.stateBefore.score,
    batterId: pitch.batterId,
    pitcherId: pitch.pitcherId,
    catcherId: pitch.catcherId,
    offense: pitch.half === 'TOP' ? 'AWAY' : 'HOME',
    pitcherPitchCount: pitch.cumulativePitchCount,
    timesThroughOrder: 1,
    winProbabilityHome: wpPoint?.home ?? 0.5,
    leverageIndex: pitch.leverageIndex,
    challengesRemaining: { home: 2, away: 2 },
  };
}

/* ------------------------------------------------------------------ */
/* 步驟一：選比賽                                                       */
/* ------------------------------------------------------------------ */

function SelectGameStep({ onSelect }: { onSelect: (era: Era, game: Game) => void }) {
  const lang = useAppStore((s) => s.lang);
  const [era, setEra] = React.useState<Era>(2026);
  const games = era === 2024 ? SCHEDULE_2024 : SCHEDULE_2026;

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        {([2024, 2026] as Era[]).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEra(e)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-bold transition',
              era === e ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
            )}
          >
            {e} · {TOURNAMENTS[e].name[lang]}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {games.map((game) => {
          const home = getTeam(game.homeTeamCode, era);
          const away = getTeam(game.awayTeamCode, era);
          if (!home || !away) return null;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelect(era, game)}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper-pure px-3 py-2.5 text-left transition hover:border-navy hover:bg-navy/5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span>{away.flagEmoji}</span>
                {away.code}
                <span className="text-ink-muted">@</span>
                <span>{home.flagEmoji}</span>
                {home.code}
              </span>
              <span className="text-right text-[11px] text-ink-muted">
                <span className="block">{game.round[lang]}</span>
                <span className="block font-[family-name:var(--font-mono-ticket)]">{game.date}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 步驟二：選/編輯打線                                                   */
/* ------------------------------------------------------------------ */

function TeamLineupEditor({
  label,
  roster,
  lineupIds,
  pitcherId,
  onLineupChange,
  onPitcherChange,
  lang,
}: {
  label: string;
  roster: Roster;
  lineupIds: string[];
  pitcherId: string;
  onLineupChange: (ids: string[]) => void;
  onPitcherChange: (id: string) => void;
  lang: 'zh' | 'en';
}) {
  const pool = selectablePlayers(roster);
  const pitcherPool = [...roster.rotation, ...roster.bullpen, ...(roster.closer ? [roster.closer] : [])];

  return (
    <div className="space-y-3 rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
      <h3 className="text-sm font-bold text-navy">{label}</h3>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">{UI.replay.startingPitcher[lang]}</span>
        <select
          value={pitcherId}
          onChange={(e) => onPitcherChange(e.target.value)}
          className="rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs font-semibold text-ink"
        >
          {pitcherPool.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name[lang]} ({p.pitcherRole})
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">{UI.replay.startingLineup[lang]}</span>
        {lineupIds.map((id, i) => {
          const current = pool.find((p) => p.id === id);
          const isSnub = roster.snubs.some((s) => s.player.id === id);
          const replacedStarter = roster.lineup[i];
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-ink-muted">{i + 1}</span>
              <select
                value={id}
                onChange={(e) => {
                  const next = [...lineupIds];
                  next[i] = e.target.value;
                  onLineupChange(next);
                }}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold',
                  isSnub ? 'border-alert bg-alert-soft text-alert' : 'border-line bg-paper-pure text-ink',
                )}
              >
                {pool.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name[lang]} ({p.positions[0]}){roster.snubs.some((s) => s.player.id === p.id) ? ` · ${UI.replay.snubTab[lang]}` : ''}
                  </option>
                ))}
              </select>
              {isSnub && current && replacedStarter && (
                <SnubImpactPanel snub={current} replaced={replacedStarter} era={roster.era} lang={lang} className="w-full basis-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 步驟三：逐球復盤                                                      */
/* ------------------------------------------------------------------ */

function ReviewStep({
  review,
  outcomeByPitchId,
  homeCode,
  awayCode,
}: {
  review: GameReviewResult['review'];
  outcomeByPitchId: GameReviewResult['outcomeByPitchId'];
  homeCode: string;
  awayCode: string;
}) {
  const lang = useAppStore((s) => s.lang);
  const cursor = useReplayStore((s) => s.cursor);
  const setCursor = useReplayStore((s) => s.setCursor);
  const managerMode = useReplayStore((s) => s.managerMode);
  const setManagerEnabled = useReplayStore((s) => s.setManagerEnabled);
  const activeDecision = useReplayStore((s) => s.activeDecision);
  const openDecision = useReplayStore((s) => s.openDecision);
  const resolveDecision = useReplayStore((s) => s.resolveDecision);
  const dismissDecision = useReplayStore((s) => s.dismissDecision);

  const pitches = review.pitches;
  const clampedCursor = Math.min(cursor, pitches.length - 1);
  const pitch = pitches[clampedCursor];
  const state = matchStateFromPitch(pitch, review);
  const pitcher = playerById(pitch.pitcherId);
  const batter = playerById(pitch.batterId);
  const atBatPitches = pitches.filter((p) => p.atBatIndex === pitch.atBatIndex);

  const jumpToPitchId = (pitchId: string) => {
    const idx = pitches.findIndex((p) => p.id === pitchId);
    if (idx >= 0) setCursor(idx);
  };

  const handleSubmit = (record: UserDecisionRecord) => resolveDecision(record);

  return (
    <div className="space-y-6">
      {/* 游標控制 */}
      <section className="flex flex-wrap items-center gap-3 rounded-[var(--radius-pass)] border border-line bg-paper-pure px-4 py-3">
        <button
          type="button"
          onClick={() => setCursor(Math.max(0, clampedCursor - 1))}
          disabled={clampedCursor === 0}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          {UI.replay.prevPitch[lang]}
        </button>
        <span className="font-[family-name:var(--font-mono-ticket)] text-xs text-ink-muted">
          {clampedCursor + 1} / {pitches.length} · {pitch.inning} {pitch.half === 'TOP' ? (lang === 'zh' ? '上' : 'T') : lang === 'zh' ? '下' : 'B'} ·{' '}
          {awayCode} {state.score.away} - {state.score.home} {homeCode}
        </span>
        <button
          type="button"
          onClick={() => setCursor(Math.min(pitches.length - 1, clampedCursor + 1))}
          disabled={clampedCursor === pitches.length - 1}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
        >
          {UI.replay.nextPitch[lang]}
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={managerMode.enabled}
          onClick={() => setManagerEnabled(!managerMode.enabled)}
          className={cn(
            'ml-auto rounded-full px-4 py-1.5 text-xs font-bold transition',
            managerMode.enabled ? 'bg-plum text-white' : 'bg-paper-sunken text-ink-muted',
          )}
        >
          {UI.manager.modeOn[lang]}
        </button>
      </section>

      <TacticalControlHUD state={state} pitch={pitch} pitcher={pitcher} lang={lang} />

      <div className="grid gap-3 md:grid-cols-2">
        <BaseRunnerDiagram bases={pitch.stateBefore.bases} resolvePlayer={playerById} lang={lang} />
        <StrikeZoneGrid pitches={atBatPitches} lang={lang} />
      </div>

      <WinProbabilityChart
        points={review.winProbability}
        crucialPlays={review.crucialPlays}
        lang={lang}
        homeLabel={homeCode}
        awayLabel={awayCode}
        cursorIndex={pitch.atBatIndex}
        onSelectPoint={(point) => {
          const target = pitches.find((p) => p.atBatIndex === point.index);
          if (target) jumpToPitchId(target.id);
        }}
      />

      {batter && pitcher && (
        <div className="grid gap-3 md:grid-cols-3">
          <BattingHeatZone pitches={pitches} batterId={batter.id} lang={lang} />
          <BattingTrajectoryChart pitches={pitches} outcomeByPitchId={outcomeByPitchId} batterId={batter.id} lang={lang} />
          <BatterVsPitcherPanel batter={batter} pitcher={pitcher} lang={lang} />
        </div>
      )}

      <section>
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {lang === 'zh' ? '關鍵轉折點與勝負分水嶺' : 'Crucial Plays & Turning Points'}
        </h2>
        <CrucialPlayList plays={review.crucialPlays} lang={lang} onJumpToPitch={jumpToPitchId} />
      </section>

      <section>
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {UI.replay.decisionPoints[lang]}
        </h2>
        {review.decisionPoints.length === 0 ? (
          <p className="rounded-[var(--radius-pass)] border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted">
            {UI.replay.noDecisionPoints[lang]}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {review.decisionPoints.map((dp, i) => (
              <button
                key={dp.id}
                type="button"
                onClick={() => openDecision(dp)}
                className="rounded-full border border-line px-4 py-1.5 text-xs font-bold text-ink transition hover:border-navy hover:text-navy"
              >
                {UI.replay.jumpToDecision[lang]} {i + 1} · {dp.situation[lang]}
              </button>
            ))}
          </div>
        )}
      </section>

      <ManagerDecisionModal
        decisionPoint={activeDecision}
        managerMode={managerMode}
        lang={lang}
        open={Boolean(activeDecision)}
        onSubmit={handleSubmit}
        onClose={dismissDecision}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主頁面                                                               */
/* ------------------------------------------------------------------ */

type FlowStep = 'SELECT_GAME' | 'EDIT_LINEUP' | 'REVIEW';

export default function ReplayPage() {
  const lang = useAppStore((s) => s.lang);
  const setCursor = useReplayStore((s) => s.setCursor);
  const openDecision = useReplayStore((s) => s.openDecision);

  const [flowStep, setFlowStep] = React.useState<FlowStep>('SELECT_GAME');
  const [era, setEra] = React.useState<Era>(2026);
  const [game, setGame] = React.useState<Game | null>(null);
  const [homeLineup, setHomeLineup] = React.useState<string[]>([]);
  const [awayLineup, setAwayLineup] = React.useState<string[]>([]);
  const [homePitcher, setHomePitcher] = React.useState<string>('');
  const [awayPitcher, setAwayPitcher] = React.useState<string>('');
  const [seedNonce, setSeedNonce] = React.useState(0);
  const [autoDecisionPending, setAutoDecisionPending] = React.useState(false);

  const homeRoster = game ? rosterFor(era, game.homeTeamCode) : null;
  const awayRoster = game ? rosterFor(era, game.awayTeamCode) : null;

  const handleSelectGame = (selectedEra: Era, selectedGame: Game, opts?: { skipToReview?: boolean }) => {
    const home = rosterFor(selectedEra, selectedGame.homeTeamCode);
    const away = rosterFor(selectedEra, selectedGame.awayTeamCode);
    if (!home || !away) return;
    setEra(selectedEra);
    setGame(selectedGame);
    setHomeLineup(home.lineup.map((p) => p.id));
    setAwayLineup(away.lineup.map((p) => p.id));
    setHomePitcher(home.rotation[0]?.id ?? home.bullpen[0]?.id ?? '');
    setAwayPitcher(away.rotation[0]?.id ?? away.bullpen[0]?.id ?? '');
    setFlowStep(opts?.skipToReview ? 'REVIEW' : 'EDIT_LINEUP');
    setCursor(0);
  };

  // 從 /case-study 等外部連結帶 ?game=<id>&autoDecision=1 進來時，
  // 略過選比賽/編輯打線，直接產生復盤並跳到第一個調度決策點。
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (!gameId) return;
    const found =
      SCHEDULE_2024.find((g) => g.id === gameId) ?? SCHEDULE_2026.find((g) => g.id === gameId);
    if (!found) return;
    const foundEra: Era = SCHEDULE_2024.some((g) => g.id === gameId) ? 2024 : 2026;
    handleSelectGame(foundEra, found, { skipToReview: true });
    if (params.get('autoDecision') === '1') setAutoDecisionPending(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviewResult = React.useMemo<GameReviewResult | null>(() => {
    if (!game || !homeRoster || !awayRoster || homeLineup.length !== 9 || awayLineup.length !== 9) return null;
    const customHome = buildCustomRoster(homeRoster, homeLineup, homePitcher);
    const customAway = buildCustomRoster(awayRoster, awayLineup, awayPitcher);
    return generateGameReviewDetailed(customHome, customAway, game, `${game.id}-v${seedNonce}`);
  }, [game, homeRoster, awayRoster, homeLineup, awayLineup, homePitcher, awayPitcher, seedNonce]);

  React.useEffect(() => {
    if (!autoDecisionPending || !reviewResult) return;
    if (reviewResult.review.decisionPoints.length > 0) openDecision(reviewResult.review.decisionPoints[0]);
    setAutoDecisionPending(false);
  }, [autoDecisionPending, reviewResult, openDecision]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-black text-navy">
          <PlaneTakeoff size={20} />
          {UI.nav.replay[lang]}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {lang === 'zh'
            ? '選一場真實賽程，打線預設帶入該隊真實先發，可自訂或把遺珠球員換上場，逐球復盤為示範用決定性模擬結果。'
            : 'Pick a real scheduled game — lineups default to the real starters, customizable, including swapping in snubs. The pitch-by-pitch review is a deterministic, illustrative simulation.'}
        </p>
      </header>

      {flowStep === 'SELECT_GAME' && <SelectGameStep onSelect={handleSelectGame} />}

      {flowStep === 'EDIT_LINEUP' && game && homeRoster && awayRoster && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setFlowStep('SELECT_GAME')}
            className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={14} />
            {UI.replay.changeGame[lang]}
          </button>

          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLineupEditor
              label={`${getTeam(game.awayTeamCode, era)?.flagEmoji ?? ''} ${awayRoster.teamCode} (${UI.matchup.departure[lang]})`}
              roster={awayRoster}
              lineupIds={awayLineup}
              pitcherId={awayPitcher}
              onLineupChange={setAwayLineup}
              onPitcherChange={setAwayPitcher}
              lang={lang}
            />
            <TeamLineupEditor
              label={`${getTeam(game.homeTeamCode, era)?.flagEmoji ?? ''} ${homeRoster.teamCode} (${UI.matchup.arrival[lang]})`}
              roster={homeRoster}
              lineupIds={homeLineup}
              pitcherId={homePitcher}
              onLineupChange={setHomeLineup}
              onPitcherChange={setHomePitcher}
              lang={lang}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setCursor(0);
              setFlowStep('REVIEW');
            }}
            className="flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <PlaneTakeoff size={16} />
            {UI.replay.generate[lang]}
          </button>
        </div>
      )}

      {flowStep === 'REVIEW' && game && reviewResult && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFlowStep('EDIT_LINEUP')}
              className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              <ChevronLeft size={14} />
              {UI.replay.editLineup[lang]}
            </button>
            <button
              type="button"
              onClick={() => {
                setSeedNonce((n) => n + 1);
                setCursor(0);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-navy"
            >
              <RefreshCcw size={12} />
              {UI.replay.regenerate[lang]}
            </button>
          </div>

          <ReviewStep
            review={reviewResult.review}
            outcomeByPitchId={reviewResult.outcomeByPitchId}
            homeCode={game.homeTeamCode}
            awayCode={game.awayTeamCode}
          />
        </div>
      )}
    </div>
  );
}
