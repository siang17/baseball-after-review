'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Activity, ChevronLeft, ChevronRight, Pause, Play, PlayCircle, RefreshCcw } from 'lucide-react';
import { CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { WinProbabilityChart } from '@/components/analysis/LazyCharts';
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
import { useLang } from '@/components/layout/LangProvider';
import { useReplayStore } from '@/store/useReplayStore';
import type {
  DecisionPoint,
  Era,
  Game,
  MatchState,
  PitchData,
  Player,
  Position,
  Roster,
  UserDecisionRecord,
  WinProbabilityPoint,
} from '@/types/baseball';

/**
 * 調度決策駕駛艙只在使用者點開決策點時才出現（內部也是 decisionPoint 為 null 就 return null），
 * 但它拖著 Radix Dialog 與一整批圖示。改成 dynamic import，把這塊從 /replay 的首次載入拿掉。
 */
const ManagerDecisionModal = dynamic(
  () => import('@/components/manager/ManagerDecisionModal').then((m) => m.ManagerDecisionModal),
  { ssr: false },
);

/** 穩定的空陣列，當某個打席查不到逐球資料時當 fallback（避免每次 render 新建陣列）。 */
const EMPTY_PITCHES: PitchData[] = [];

/* ------------------------------------------------------------------ */
/* 共用：由自訂打線/投手組出一份 Roster                                  */
/* ------------------------------------------------------------------ */

function selectablePlayers(roster: Roster): Player[] {
  return [...roster.lineup, ...roster.bench, ...roster.snubs.map((s) => s.player)];
}

function buildCustomRoster(base: Roster, lineupIds: string[], positions: Position[], pitcherId: string): Roster {
  const pool = selectablePlayers(base);
  const lineup = lineupIds.map((id, i) => {
    const player = pool.find((p) => p.id === id) ?? base.lineup[i];
    const position = positions[i] ?? player.positions[0];
    return { ...player, battingOrder: i + 1, rosterClass: 'STARTER' as const, positions: [position] };
  });
  const bench = pool.filter((p) => !lineupIds.includes(p.id) && base.bench.some((b) => b.id === p.id));
  const pitcherPool = [...base.rotation, ...base.bullpen, ...(base.closer ? [base.closer] : [])];
  const starter = pitcherPool.find((p) => p.id === pitcherId) ?? base.rotation[0];
  const rotation = [starter, ...base.rotation.filter((p) => p.id !== starter.id)];
  return { ...base, lineup, bench, rotation };
}

/** 先發打線可指派的守位；投手不在其中（投手打席不在本 app 的模擬範圍內）。 */
const LINEUP_POSITIONS: Position[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

/** 找出重複被指派的守位（不含 null／未指派），用來擋下不合理的自訂打線。 */
function findDuplicatePositions(positions: Position[]): Set<Position> {
  const seen = new Set<Position>();
  const dupes = new Set<Position>();
  for (const pos of positions) {
    if (seen.has(pos)) dupes.add(pos);
    seen.add(pos);
  }
  return dupes;
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
  const lang = useLang();
  // 分頁選擇也放在 store，切換語言後仍會停在原本那一屆賽程。
  const era = useReplayStore((s) => s.scheduleEra);
  const setEra = useReplayStore((s) => s.setScheduleEra);
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
  positions,
  pitcherId,
  onLineupChange,
  onPositionsChange,
  onPitcherChange,
  lang,
}: {
  label: string;
  roster: Roster;
  lineupIds: string[];
  positions: Position[];
  pitcherId: string;
  onLineupChange: (ids: string[]) => void;
  onPositionsChange: (positions: Position[]) => void;
  onPitcherChange: (id: string) => void;
  lang: 'zh' | 'en';
}) {
  const dupePositions = React.useMemo(() => findDuplicatePositions(positions), [positions]);
  // 這九個打線下拉選單的選項完全相同，且只跟 roster/lang 有關；
  // 原本每次 render 都重建一次名單、並在內層對每個選項做一次 snubs 線性搜尋（O(pool × snubs × 9）。
  const pool = React.useMemo(() => selectablePlayers(roster), [roster]);
  const pitcherPool = React.useMemo(
    () => [...roster.rotation, ...roster.bullpen, ...(roster.closer ? [roster.closer] : [])],
    [roster],
  );
  const snubIds = React.useMemo(() => new Set(roster.snubs.map((sn) => sn.player.id)), [roster]);
  const poolById = React.useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool]);
  const lineupOptions = React.useMemo(
    () =>
      pool.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name[lang]} ({p.positions[0]}){snubIds.has(p.id) ? ` · ${UI.replay.snubTab[lang]}` : ''}
        </option>
      )),
    [pool, snubIds, lang],
  );

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
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">{UI.replay.startingLineup[lang]}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">{UI.replay.position[lang]}</span>
        </div>
        {lineupIds.map((id, i) => {
          const current = poolById.get(id);
          const isSnub = snubIds.has(id);
          const replacedStarter = roster.lineup[i];
          const position = positions[i];
          const isDupe = dupePositions.has(position);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-ink-muted">{i + 1}</span>
              <select
                value={id}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const nextIds = [...lineupIds];
                  nextIds[i] = nextId;
                  onLineupChange(nextIds);
                  // 換人時把守位重設回新球員自己的主守位（依球員特性帶入預設值，使用者仍可再手動調整）。
                  const nextPlayer = poolById.get(nextId);
                  const fallback = nextPlayer?.positions[0];
                  if (fallback && LINEUP_POSITIONS.includes(fallback)) {
                    const nextPositions = [...positions];
                    nextPositions[i] = fallback;
                    onPositionsChange(nextPositions);
                  }
                }}
                className={cn(
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold',
                  isSnub ? 'border-alert bg-alert-soft text-alert' : 'border-line bg-paper-pure text-ink',
                )}
              >
                {lineupOptions}
              </select>
              <select
                value={position}
                onChange={(e) => {
                  const next = [...positions];
                  next[i] = e.target.value as Position;
                  onPositionsChange(next);
                }}
                className={cn(
                  'w-20 shrink-0 rounded-lg border px-2 py-1.5 text-xs font-semibold',
                  isDupe ? 'border-alert bg-alert-soft text-alert' : 'border-line bg-paper-pure text-ink',
                )}
              >
                {LINEUP_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {isSnub && current && replacedStarter && (
                <SnubImpactPanel snub={current} replaced={replacedStarter} era={roster.era} lang={lang} className="w-full basis-full" />
              )}
            </div>
          );
        })}
        {dupePositions.size > 0 && (
          <p className="text-[11px] font-semibold text-alert">{UI.replay.duplicatePosition[lang]}</p>
        )}
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
  const lang = useLang();
  const cursor = useReplayStore((s) => s.cursor);
  const setCursor = useReplayStore((s) => s.setCursor);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const setPlaying = useReplayStore((s) => s.setPlaying);
  const playbackSpeed = useReplayStore((s) => s.playbackSpeed);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const managerMode = useReplayStore((s) => s.managerMode);
  const setManagerEnabled = useReplayStore((s) => s.setManagerEnabled);
  const activeDecision = useReplayStore((s) => s.activeDecision);
  const openDecision = useReplayStore((s) => s.openDecision);
  const resolveDecision = useReplayStore((s) => s.resolveDecision);
  const dismissDecision = useReplayStore((s) => s.dismissDecision);
  const decisionLog = useReplayStore((s) => s.decisionLog);

  // 決策艙是 dynamic import，所以不在 /replay 的首次載入 bundle 裡。
  // 這個復盤畫面本身只有在使用者選完比賽、按下「產生逐球復盤」之後才會掛載，
  // 此時首次載入早已結束，直接把 chunk 拉下來不會跟任何東西搶頻寬，
  // 但能保證使用者真的點開決策點時不必等網路。
  React.useEffect(() => {
    void import('@/components/manager/ManagerDecisionModal');
  }, []);

  const pitches = review.pitches;

  // 游標每移一格就重新 render，而一場比賽動輒三位數顆球；
  // 把「按打席分組」與「pitchId → 索引」先算好，避免每次 render 都全陣列 filter/findIndex。
  const { pitchesByAtBat, indexByPitchId } = React.useMemo(() => {
    const byAtBat = new Map<number, typeof pitches>();
    const byId = new Map<string, number>();
    pitches.forEach((p, i) => {
      byId.set(p.id, i);
      const bucket = byAtBat.get(p.atBatIndex);
      if (bucket) bucket.push(p);
      else byAtBat.set(p.atBatIndex, [p]);
    });
    return { pitchesByAtBat: byAtBat, indexByPitchId: byId };
  }, [pitches]);

  const clampedCursor = Math.min(cursor, pitches.length - 1);
  const pitch = pitches[clampedCursor];

  // beforePitchId → DecisionPoint，讓自動播放能在播到那顆球時當場彈出決策卡。
  const decisionByPitchId = React.useMemo(() => {
    const map = new Map<string, DecisionPoint>();
    for (const dp of review.decisionPoints) map.set(dp.beforePitchId, dp);
    return map;
  }, [review.decisionPoints]);
  const resolvedDecisionIds = React.useMemo(
    () => new Set(decisionLog.map((r) => r.decisionPointId)),
    [decisionLog],
  );

  // 自動播放：每顆球間隔依 playbackSpeed 縮放；播到埋了決策點的球就自然彈出事件卡並暫停
  // （openDecision 本身就會把 isPlaying 設回 false，不用在這裡重複設），或播到最後一球就自動暫停。
  React.useEffect(() => {
    if (!isPlaying) return;
    if (activeDecision) {
      setPlaying(false);
      return;
    }
    const dueDecision = decisionByPitchId.get(pitch.id);
    if (dueDecision && !resolvedDecisionIds.has(dueDecision.id)) {
      openDecision(dueDecision);
      return;
    }
    if (clampedCursor >= pitches.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setCursor(clampedCursor + 1), 1800 / playbackSpeed);
    return () => clearTimeout(id);
  }, [
    isPlaying,
    activeDecision,
    clampedCursor,
    pitch.id,
    pitches.length,
    playbackSpeed,
    decisionByPitchId,
    resolvedDecisionIds,
    openDecision,
    setCursor,
    setPlaying,
  ]);

  const state = React.useMemo(() => matchStateFromPitch(pitch, review), [pitch, review]);
  const pitcher = React.useMemo(() => playerById(pitch.pitcherId), [pitch.pitcherId]);
  const batter = React.useMemo(() => playerById(pitch.batterId), [pitch.batterId]);
  const atBatPitches = pitchesByAtBat.get(pitch.atBatIndex) ?? EMPTY_PITCHES;

  const jumpToPitchId = React.useCallback(
    (pitchId: string) => {
      const idx = indexByPitchId.get(pitchId);
      if (idx !== undefined) setCursor(idx);
    },
    [indexByPitchId, setCursor],
  );

  const handleSubmit = React.useCallback(
    (record: UserDecisionRecord) => resolveDecision(record),
    [resolveDecision],
  );

  const handleSelectWinProbabilityPoint = React.useCallback(
    (point: WinProbabilityPoint) => {
      const target = pitchesByAtBat.get(point.index)?.[0];
      if (target) jumpToPitchId(target.id);
    },
    [pitchesByAtBat, jumpToPitchId],
  );

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
          onClick={() => setPlaying(!isPlaying)}
          disabled={!isPlaying && clampedCursor === pitches.length - 1}
          className={cn(
            'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold disabled:opacity-40',
            isPlaying ? 'border-plum bg-plum text-white' : 'border-line text-ink',
          )}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? UI.replay.pause[lang] : UI.replay.play[lang]}
        </button>

        <div className="flex items-center gap-1 rounded-full border border-line px-1.5 py-1">
          {([0.5, 1, 2, 4] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setSpeed(speed)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums transition',
                playbackSpeed === speed ? 'bg-navy text-white' : 'text-ink-muted hover:text-ink',
              )}
            >
              {speed}x
            </button>
          ))}
        </div>

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
        onSelectPoint={handleSelectWinProbabilityPoint}
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

      {activeDecision && (
        <ManagerDecisionModal
          decisionPoint={activeDecision}
          managerMode={managerMode}
          lang={lang}
          open
          onSubmit={handleSubmit}
          onClose={dismissDecision}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主頁面                                                               */
/* ------------------------------------------------------------------ */

export default function ReplayPage() {
  const lang = useLang();
  const setCursor = useReplayStore((s) => s.setCursor);
  const openDecision = useReplayStore((s) => s.openDecision);

  // 流程狀態住在 store，而不是這個元件的 useState：
  // 切換語言是一次真正的導覽，元件會重新掛載，但 store 能跨導覽存活，
  // 使用者不會被打回選比賽的畫面。
  const flowStep = useReplayStore((s) => s.flowStep);
  const era = useReplayStore((s) => s.era);
  const game = useReplayStore((s) => s.game);
  const homeLineup = useReplayStore((s) => s.homeLineup);
  const awayLineup = useReplayStore((s) => s.awayLineup);
  const homePositions = useReplayStore((s) => s.homePositions);
  const awayPositions = useReplayStore((s) => s.awayPositions);
  const homePitcher = useReplayStore((s) => s.homePitcher);
  const awayPitcher = useReplayStore((s) => s.awayPitcher);
  const seedNonce = useReplayStore((s) => s.seedNonce);
  const setFlowStep = useReplayStore((s) => s.setFlowStep);
  const selectGame = useReplayStore((s) => s.selectGame);
  const setHomeLineup = useReplayStore((s) => s.setHomeLineup);
  const setAwayLineup = useReplayStore((s) => s.setAwayLineup);
  const setHomePositions = useReplayStore((s) => s.setHomePositions);
  const setAwayPositions = useReplayStore((s) => s.setAwayPositions);
  const setHomePitcher = useReplayStore((s) => s.setHomePitcher);
  const setAwayPitcher = useReplayStore((s) => s.setAwayPitcher);
  const regenerate = useReplayStore((s) => s.regenerate);

  const [autoDecisionPending, setAutoDecisionPending] = React.useState(false);

  const homeRoster = game ? rosterFor(era, game.homeTeamCode) : null;
  const awayRoster = game ? rosterFor(era, game.awayTeamCode) : null;

  /** 從名單算出雙方的真實先發打線與先發投手，再交給 store 記住。 */
  const handleSelectGame = React.useCallback(
    (selectedEra: Era, selectedGame: Game, opts?: { skipToReview?: boolean }) => {
      const home = rosterFor(selectedEra, selectedGame.homeTeamCode);
      const away = rosterFor(selectedEra, selectedGame.awayTeamCode);
      if (!home || !away) return;
      selectGame({
        era: selectedEra,
        game: selectedGame,
        homeLineup: home.lineup.map((p) => p.id),
        awayLineup: away.lineup.map((p) => p.id),
        homePositions: home.lineup.map((p) => p.positions[0]),
        awayPositions: away.lineup.map((p) => p.positions[0]),
        homePitcher: home.rotation[0]?.id ?? home.bullpen[0]?.id ?? '',
        awayPitcher: away.rotation[0]?.id ?? away.bullpen[0]?.id ?? '',
        skipToReview: opts?.skipToReview,
      });
    },
    [selectGame],
  );

  // 從 /case-study 等外部連結帶 ?game=<id>&autoDecision=1 進來時，
  // 略過選比賽/編輯打線，直接產生復盤並跳到第一個調度決策點。
  // 若 store 裡已經就是這場比賽（例如剛切換完語言重新掛載），就不重設，
  // 否則游標與已做的調度都會被清掉。
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (!gameId || game?.id === gameId) return;
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
    // 守位重複只在自訂打線編輯器裡擋「產生逐球復盤」按鈕；這裡不能重複擋一次，
    // 否則「當下選擇」（直接採用真實先發）對沒有真正 DH 的隊伍（本來就有兩位野手
    // 共用同一個守位標籤）會整頁開天窗——守位純粹是顯示用途，模擬本身不吃這個欄位。
    const customHome = buildCustomRoster(homeRoster, homeLineup, homePositions, homePitcher);
    const customAway = buildCustomRoster(awayRoster, awayLineup, awayPositions, awayPitcher);
    return generateGameReviewDetailed(customHome, customAway, game, `${game.id}-v${seedNonce}`);
  }, [game, homeRoster, awayRoster, homeLineup, awayLineup, homePositions, awayPositions, homePitcher, awayPitcher, seedNonce]);

  React.useEffect(() => {
    if (!autoDecisionPending || !reviewResult) return;
    if (reviewResult.review.decisionPoints.length > 0) openDecision(reviewResult.review.decisionPoints[0]);
    setAutoDecisionPending(false);
  }, [autoDecisionPending, reviewResult, openDecision]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-black text-navy">
          <Activity size={20} />
          {UI.nav.replay[lang]}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {lang === 'zh'
            ? '選一場真實賽程，打線預設帶入該隊真實先發，可自訂或把遺珠球員換上場，逐球復盤為示範用決定性模擬結果。'
            : 'Pick a real scheduled game — lineups default to the real starters, customizable, including swapping in snubs. The pitch-by-pitch review is a deterministic, illustrative simulation.'}
        </p>
      </header>

      {flowStep === 'SELECT_GAME' && <SelectGameStep onSelect={handleSelectGame} />}

      {flowStep === 'CHOOSE_MODE' && game && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setFlowStep('SELECT_GAME')}
            className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={14} />
            {UI.replay.changeGame[lang]}
          </button>

          <h2 className="text-sm font-bold text-navy">{UI.replay.chooseModeTitle[lang]}</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFlowStep('REVIEW')}
              className="group rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4 text-left transition hover:-translate-y-0.5 hover:border-navy hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]"
            >
              <h3 className="text-base font-bold text-ink">{UI.replay.currentModeTitle[lang]}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{UI.replay.currentModeDesc[lang]}</p>
            </button>
            <button
              type="button"
              onClick={() => setFlowStep('EDIT_LINEUP')}
              className="group rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4 text-left transition hover:-translate-y-0.5 hover:border-plum hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]"
            >
              <h3 className="text-base font-bold text-ink">{UI.replay.customModeTitle[lang]}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{UI.replay.customModeDesc[lang]}</p>
            </button>
          </div>
        </div>
      )}

      {flowStep === 'EDIT_LINEUP' && game && homeRoster && awayRoster && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setFlowStep('CHOOSE_MODE')}
            className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={14} />
            {UI.replay.changeMode[lang]}
          </button>

          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLineupEditor
              label={`${getTeam(game.awayTeamCode, era)?.flagEmoji ?? ''} ${awayRoster.teamCode} (${UI.matchup.departure[lang]})`}
              roster={awayRoster}
              lineupIds={awayLineup}
              positions={awayPositions}
              pitcherId={awayPitcher}
              onLineupChange={setAwayLineup}
              onPositionsChange={setAwayPositions}
              onPitcherChange={setAwayPitcher}
              lang={lang}
            />
            <TeamLineupEditor
              label={`${getTeam(game.homeTeamCode, era)?.flagEmoji ?? ''} ${homeRoster.teamCode} (${UI.matchup.arrival[lang]})`}
              roster={homeRoster}
              lineupIds={homeLineup}
              positions={homePositions}
              pitcherId={homePitcher}
              onLineupChange={setHomeLineup}
              onPositionsChange={setHomePositions}
              onPitcherChange={setHomePitcher}
              lang={lang}
            />
          </div>

          <button
            type="button"
            disabled={findDuplicatePositions(homePositions).size > 0 || findDuplicatePositions(awayPositions).size > 0}
            onClick={() => {
              setCursor(0);
              setFlowStep('REVIEW');
            }}
            className={cn(
              'flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition',
              findDuplicatePositions(homePositions).size > 0 || findDuplicatePositions(awayPositions).size > 0
                ? 'cursor-not-allowed bg-ink-muted/50'
                : 'bg-plum hover:brightness-110',
            )}
          >
            <PlayCircle size={16} />
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
              onClick={regenerate}
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
