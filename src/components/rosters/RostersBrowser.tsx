'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ManagerCard, PlayerCard } from '@/components/cards/TeamCard';
import { SnubComparison } from '@/components/rosters/SnubComparison';
import { StatTag } from '@/components/ui/StatTag';
import { TEAMS_BY_ERA, TOURNAMENTS, getTeam } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { playerById, rosterFor } from '@/data/rosters';
import { useLang } from '@/components/layout/LangProvider';
import { useRostersStore } from '@/store/useRostersStore';
import type { Era, Player, Roster, TeamCode } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 年份選單                                                            */
/* ------------------------------------------------------------------ */

const ERAS: Era[] = [2024, 2026];

function EraPicker({ onSelect }: { onSelect: (era: Era) => void }) {
  const lang = useLang();
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
  const lang = useLang();
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
                {lang === 'zh' ? '分組' : 'GROUP'} {team.group}
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
  const lang = useLang();
  if (players.length === 0) return null;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} lang={lang}>
          <div className="flex flex-wrap gap-2">
            {/* OPS/WHIP 是打擊／投球資料裡唯二一定有值的欄位（schema 不可為 null），
                所以放最前面：真實球季資料只查得到基本打擊率三圍時，這裡才不會整排空白。
                安打／三振是計數型數據，示範球員與尚未補上真實計數的球員都固定是 0，
                所以只在 >0 時才顯示標籤，避免看起來像「真的打了 0 支安打」。 */}
            {player.batting && (
              <StatTag lang={lang} label={bi('OPS', 'OPS')} value={player.batting.ops.toFixed(3)} />
            )}
            {player.batting?.avg != null && (
              <StatTag lang={lang} label={bi('打擊率', 'AVG')} value={player.batting.avg.toFixed(3)} />
            )}
            {player.batting && (
              <StatTag lang={lang} label={bi('上壘率', 'OBP')} value={player.batting.obp.toFixed(3)} />
            )}
            {player.batting && (
              <StatTag lang={lang} label={bi('長打率', 'SLG')} value={player.batting.slg.toFixed(3)} />
            )}
            {player.batting?.wrcPlus != null && (
              <StatTag lang={lang} label={bi('wRC+', 'wRC+')} value={player.batting.wrcPlus} />
            )}
            {player.batting?.war != null && (
              <StatTag lang={lang} label={bi('WAR', 'WAR')} value={player.batting.war.toFixed(1)} />
            )}
            {player.batting && player.batting.h > 0 && (
              <StatTag lang={lang} label={bi('安打', 'H')} value={player.batting.h} />
            )}
            {player.batting && player.batting.so > 0 && (
              <StatTag lang={lang} label={bi('三振', 'K')} value={player.batting.so} />
            )}
            {player.batting?.whiffPct != null && (
              <StatTag lang={lang} label={bi('揮空率', 'Whiff%')} value={`${(player.batting.whiffPct * 100).toFixed(1)}%`} />
            )}
            {player.batting?.sprintSpeed != null && (
              <StatTag lang={lang} label={bi('離壘速度', 'Sprint Speed')} value={player.batting.sprintSpeed.toFixed(1)} unit="ft/s" />
            )}
            {player.fielding?.uzr150 != null && (
              <StatTag
                lang={lang}
                label={bi('UZR/150', 'UZR/150')}
                value={player.fielding.uzr150.toFixed(1)}
                tone={player.fielding.uzr150 >= 0 ? 'good' : 'danger'}
              />
            )}
            {player.fielding?.attendanceRate != null && (
              <StatTag lang={lang} label={bi('出勤率', 'Attendance')} value={`${(player.fielding.attendanceRate * 100).toFixed(0)}%`} />
            )}
            {player.pitching && (
              <StatTag lang={lang} label={bi('WHIP', 'WHIP')} value={player.pitching.whip.toFixed(2)} />
            )}
            {player.pitching?.era != null && (
              <StatTag lang={lang} label={bi('防禦率', 'ERA')} value={player.pitching.era.toFixed(2)} />
            )}
            {player.pitching?.war != null && (
              <StatTag lang={lang} label={bi('WAR', 'WAR')} value={player.pitching.war.toFixed(1)} />
            )}
            {player.pitching?.k9 != null && (
              <StatTag lang={lang} label={bi('K/9', 'K/9')} value={player.pitching.k9.toFixed(1)} />
            )}
            {player.pitching && player.pitching.so > 0 && (
              <StatTag lang={lang} label={bi('三振', 'K')} value={player.pitching.so} />
            )}
            {player.pitching?.pitches != null && (
              <StatTag lang={lang} label={bi('用球數', 'Pitches')} value={player.pitching.pitches} />
            )}
            {player.pitching?.velocityDeclinePer25 != null && (
              <StatTag
                lang={lang}
                label={bi('球速下滑率', 'Velo Decline')}
                value={player.pitching.velocityDeclinePer25.toFixed(2)}
                unit="mph/25p"
              />
            )}
          </div>
        </PlayerCard>
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
  const lang = useLang();
  return (
    <div className="space-y-3">
      <ManagerCard name={roster.manager.name} teamCode={roster.teamCode} era={roster.era} lang={lang} />
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
  const lang = useLang();
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
  const lang = useLang();
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

      <Section title={UI.rosters.batters[lang]}>
        <PlayerGrid players={[...roster.lineup, ...roster.bench]} />
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
/* 瀏覽流程（client island）                                            */
/* ------------------------------------------------------------------ */

/**
 * 年代 → 隊伍 → 名單的三步瀏覽流程。選取狀態是純粹的 UI 狀態，
 * 所以這塊維持 Client Component；頁面的標題與說明已經拆到 Server Component。
 */
export function RostersBrowser() {
  const era = useRostersStore((s) => s.era);
  const teamCode = useRostersStore((s) => s.teamCode);
  const selectEra = useRostersStore((s) => s.selectEra);
  const selectTeam = useRostersStore((s) => s.selectTeam);
  const clearEra = useRostersStore((s) => s.clearEra);
  const clearTeam = useRostersStore((s) => s.clearTeam);

  if (era === null) return <EraPicker onSelect={selectEra} />;
  if (teamCode === null) {
    return <TeamPicker era={era} onSelect={selectTeam} onBack={clearEra} />;
  }
  return <RosterDetail era={era} teamCode={teamCode} onBack={clearTeam} />;
}
