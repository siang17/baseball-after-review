'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ManagerBoardingPass, PlayerBoardingPass } from '@/components/boarding/BoardingPassCard';
import { SnubComparison } from '@/components/rosters/SnubComparison';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { TEAMS_BY_ERA, TOURNAMENTS, getTeam } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { playerById, rosterFor } from '@/data/rosters';
import { useAppStore } from '@/store/useAppStore';
import type { Era, Player, Roster, TeamCode } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 年份選單                                                            */
/* ------------------------------------------------------------------ */

const ERAS: Era[] = [2024, 2026];

function EraPicker({ onSelect }: { onSelect: (era: Era) => void }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ERAS.map((era) => (
        <button
          key={era}
          type="button"
          onClick={() => onSelect(era)}
          className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-5 text-left transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]"
        >
          <div className="font-[family-name:var(--font-mono-ticket)] text-3xl font-black text-navy">
            {era}
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">{TOURNAMENTS[era].name[lang]}</div>
          <div className="mt-2 text-[11px] uppercase tracking-widest text-ink-muted">
            {TOURNAMENTS[era].teamCodes.length} {lang === 'zh' ? '隊' : 'teams'}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 隊伍選單                                                            */
/* ------------------------------------------------------------------ */

function TeamPicker({ era, onSelect, onBack }: { era: Era; onSelect: (code: TeamCode) => void; onBack: () => void }) {
  const lang = useAppStore((s) => s.lang);
  const teams = TEAMS_BY_ERA[era];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
      >
        <ChevronLeft size={14} />
        {UI.rosters.changeEra[lang]}
      </button>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <button
            key={team.code}
            type="button"
            onClick={() => onSelect(team.code)}
            className="flex items-center gap-3 rounded-lg border border-line bg-paper-pure px-3 py-2.5 text-left transition hover:border-navy hover:bg-navy/5"
          >
            <span className="text-xl leading-none">{team.flagEmoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{team.name[lang]}</span>
              <span className="block text-[10px] uppercase tracking-widest text-ink-muted">
                GATE {team.group}
              </span>
            </span>
            <span className="font-[family-name:var(--font-mono-ticket)] text-sm font-bold text-navy">
              {team.code}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 名單區塊                                                            */
/* ------------------------------------------------------------------ */

function PlayerGrid({ players }: { players: Player[] }) {
  const lang = useAppStore((s) => s.lang);
  if (players.length === 0) return null;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {players.map((player) => (
        <PlayerBoardingPass key={player.id} player={player} lang={lang}>
          <div className="flex flex-wrap gap-2">
            {player.batting?.wrcPlus != null && (
              <BaggageTag lang={lang} label={bi('wRC+', 'wRC+')} value={player.batting.wrcPlus} />
            )}
            {player.fielding?.uzr150 != null && (
              <BaggageTag
                lang={lang}
                label={bi('UZR/150', 'UZR/150')}
                value={player.fielding.uzr150.toFixed(1)}
                tone={player.fielding.uzr150 >= 0 ? 'good' : 'danger'}
              />
            )}
            {player.pitching?.era != null && (
              <BaggageTag lang={lang} label={bi('防禦率', 'ERA')} value={player.pitching.era.toFixed(2)} />
            )}
            {player.pitching?.k9 != null && (
              <BaggageTag lang={lang} label={bi('K/9', 'K/9')} value={player.pitching.k9.toFixed(1)} />
            )}
          </div>
        </PlayerBoardingPass>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function CoachingStaffCard({ roster }: { roster: Roster }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <div className="space-y-3">
      <ManagerBoardingPass
        name={roster.manager.name}
        lang={lang}
        gate={roster.teamCode}
        flightNo={TOURNAMENTS[roster.era].flightPrefix + ' ' + roster.era}
        barcodeSeed={roster.manager.id}
      />
      {roster.coachingStaff.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {roster.coachingStaff.map((c) => (
            <div key={c.id} className="rounded-lg border border-line bg-paper-pure px-3 py-2">
              <div className="text-sm font-semibold text-ink">{c.name[lang]}</div>
              <div className="text-[11px] text-ink-muted">{c.roleLabel[lang]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SnubsSection({ roster }: { roster: Roster }) {
  const lang = useAppStore((s) => s.lang);
  if (roster.snubs.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-[var(--radius-pass)] border border-dashed border-line-strong text-sm text-ink-muted">
        {UI.rosters.noSnubs[lang]}
      </div>
    );
  }
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {roster.snubs.map((snub) => (
        <SnubComparison key={snub.player.id} snub={snub} resolvePlayer={playerById} lang={lang} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 名單詳細頁                                                          */
/* ------------------------------------------------------------------ */

function RosterDetail({ era, teamCode, onBack }: { era: Era; teamCode: TeamCode; onBack: () => void }) {
  const lang = useAppStore((s) => s.lang);
  const roster = rosterFor(era, teamCode);
  const team = getTeam(teamCode, era);

  if (!roster || !team) {
    return (
      <div className="rounded-[var(--radius-pass)] border border-dashed border-line-strong p-6 text-center text-sm text-ink-muted">
        {lang === 'zh' ? '找不到這支隊伍的名單。' : 'No roster found for this team.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={14} />
          {UI.rosters.changeTeam[lang]}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{team.flagEmoji}</span>
          <div>
            <div className="text-base font-bold text-navy">{team.name[lang]}</div>
            <div className="font-[family-name:var(--font-mono-ticket)] text-[10px] uppercase tracking-widest text-ink-muted">
              {TOURNAMENTS[era].name[lang]}
            </div>
          </div>
        </div>
      </div>

      <Section title={UI.rosters.coachingStaff[lang]}>
        <CoachingStaffCard roster={roster} />
      </Section>

      <Section title={UI.rosters.lineup[lang]}>
        <PlayerGrid players={roster.lineup} />
      </Section>

      <Section title={UI.rosters.bench[lang]}>
        <PlayerGrid players={roster.bench} />
      </Section>

      <Section title={UI.rosters.rotation[lang]}>
        <PlayerGrid players={roster.rotation} />
      </Section>

      <Section title={UI.rosters.bullpen[lang]}>
        <PlayerGrid players={roster.closer ? [...roster.bullpen, roster.closer] : roster.bullpen} />
      </Section>

      <Section title={UI.rosters.snubs[lang]}>
        <SnubsSection roster={roster} />
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主頁面                                                              */
/* ------------------------------------------------------------------ */

export default function RostersPage() {
  const lang = useAppStore((s) => s.lang);
  const [era, setEra] = React.useState<Era | null>(null);
  const [teamCode, setTeamCode] = React.useState<TeamCode | null>(null);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-navy">
          {lang === 'zh' ? '旅客名單 · 球員登機證' : 'Rosters · Player Boarding Passes'}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {lang === 'zh'
            ? '⚠️ 示範資料：姓名／守位／教練職稱為真實名單，統計數字與棒次、輪值分工為示範用虛構值。'
            : '⚠️ Placeholder data: names/positions/coaching titles are the real rosters; stats, batting order and rotation roles are illustrative fictional values.'}
        </p>
      </header>

      {era === null ? (
        <EraPicker onSelect={setEra} />
      ) : teamCode === null ? (
        <TeamPicker era={era} onSelect={setTeamCode} onBack={() => setEra(null)} />
      ) : (
        <RosterDetail era={era} teamCode={teamCode} onBack={() => setTeamCode(null)} />
      )}
    </div>
  );
}
