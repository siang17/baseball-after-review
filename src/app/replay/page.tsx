'use client';

import * as React from 'react';
import { CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { WinProbabilityChart } from '@/components/analysis/WinProbabilityChart';
import { ManagerDecisionModal } from '@/components/manager/ManagerDecisionModal';
import { TacticalControlHUD } from '@/components/replay/TacticalControlHUD';
import { DEMO_GAME_REVIEW, DEMO_PITCHES, DEMO_STATE } from '@/data/games/wbc2026-jpn-ven';
import { playerById } from '@/data/rosters/demoPlayers';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useReplayStore } from '@/store/useReplayStore';
import type { UserDecisionRecord } from '@/types/baseball';

export default function ReplayPage() {
  const lang = useAppStore((s) => s.lang);

  const managerMode = useReplayStore((s) => s.managerMode);
  const setManagerEnabled = useReplayStore((s) => s.setManagerEnabled);
  const setManagerSide = useReplayStore((s) => s.setManagerSide);
  const activeDecision = useReplayStore((s) => s.activeDecision);
  const openDecision = useReplayStore((s) => s.openDecision);
  const resolveDecision = useReplayStore((s) => s.resolveDecision);
  const dismissDecision = useReplayStore((s) => s.dismissDecision);

  const review = DEMO_GAME_REVIEW;
  const pitch = DEMO_PITCHES[0];
  const pitcher = playerById(DEMO_STATE.pitcherId);

  const handleSubmit = (record: UserDecisionRecord) => {
    resolveDecision(record);
  };

  return (
    <div className="space-y-6">
      {/* 總教練模式切換 */}
      <section className="flex flex-wrap items-center gap-3 rounded-[var(--radius-pass)] border border-line bg-paper-pure px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={managerMode.enabled}
          onClick={() => setManagerEnabled(!managerMode.enabled)}
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-bold transition',
            managerMode.enabled ? 'bg-plum text-white' : 'bg-paper-sunken text-ink-muted',
          )}
        >
          {lang === 'zh' ? '總教練模式' : 'Manager Mode'}
        </button>

        <div className="flex items-center gap-1">
          {(['AWAY', 'HOME'] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={!managerMode.enabled}
              onClick={() => setManagerSide(side)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                managerMode.side === side
                  ? 'bg-navy text-white'
                  : 'bg-paper-sunken text-ink-muted',
                !managerMode.enabled && 'opacity-40',
              )}
            >
              {side === 'HOME'
                ? lang === 'zh'
                  ? '主隊總教練'
                  : 'Home manager'
                : lang === 'zh'
                  ? '客隊總教練'
                  : 'Away manager'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openDecision(review.decisionPoints[0])}
          className="ml-auto rounded-full border border-line px-4 py-1.5 text-xs font-bold text-ink transition hover:border-navy hover:text-navy"
        >
          {lang === 'zh' ? '跳至七局下決策點' : 'Jump to the 7th-inning call'}
        </button>
      </section>

      {/* 戰術控制台 */}
      <TacticalControlHUD state={DEMO_STATE} pitch={pitch} pitcher={pitcher} lang={lang} />

      {/* 勝率曲線 */}
      <WinProbabilityChart
        points={review.winProbability}
        crucialPlays={review.crucialPlays}
        lang={lang}
        homeLabel="JPN"
        awayLabel="VEN"
      />

      {/* 關鍵轉折點 */}
      <section>
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {lang === 'zh' ? '關鍵轉折點與勝負分水嶺' : 'Crucial Plays & Turning Points'}
        </h2>
        <CrucialPlayList plays={review.crucialPlays} lang={lang} />
      </section>

      {/* 決策艙 */}
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
