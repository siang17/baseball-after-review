import * as React from 'react';
import { Shield } from 'lucide-react';
import { ROSTER_TIER_LABELS, getTeam } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Bilingual, Era, Lang, Player, TeamCode } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 分級色塊                                                            */
/* ------------------------------------------------------------------ */

const TONE_BLOCK: Record<string, string> = {
  primary: 'bg-navy',
  secondary: 'bg-ink-soft',
  reserve: 'bg-ink-muted',
  staff: 'bg-plum',
  watch: 'bg-alert',
};

const TONE_BADGE: Record<string, string> = {
  primary: 'bg-navy text-white',
  secondary: 'bg-ink-soft text-white',
  reserve: 'bg-ink-muted text-white',
  staff: 'bg-plum text-white',
  watch: 'bg-alert text-white',
};

/* ------------------------------------------------------------------ */
/* 共用小元件                                                          */
/* ------------------------------------------------------------------ */

export interface CardField {
  label: Bilingual;
  value: React.ReactNode;
  align?: 'left' | 'right';
  emphasis?: boolean;
}

function Field({ label, value, lang, align = 'left', emphasis = false }: CardField & { lang: Lang }) {
  return (
    <div className={cn('flex flex-col', align === 'right' && 'items-end text-right')}>
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label[lang]}
      </span>
      <span
        className={cn(
          'font-[family-name:var(--font-mono-ticket)] leading-tight text-ink tabular-nums',
          emphasis ? 'text-xl font-bold' : 'text-sm font-semibold',
        )}
      >
        {value}
      </span>
    </div>
  );
}

const FIELD_GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/* ------------------------------------------------------------------ */
/* PlayerCard：球隊色塊球員卡                                          */
/* ------------------------------------------------------------------ */

type PlayerCardTab = 'overview' | 'stats';

function PlayerCardTabs({
  active,
  onChange,
  lang,
}: {
  active: PlayerCardTab;
  onChange: (tab: PlayerCardTab) => void;
  lang: Lang;
}) {
  const tabs: Array<{ id: PlayerCardTab; label: Bilingual }> = [
    { id: 'overview', label: UI.playerCard.overviewTab },
    { id: 'stats', label: UI.playerCard.playerStats },
  ];
  return (
    <div className="flex gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={active === tab.id}
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition',
            active === tab.id ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
          )}
        >
          {tab.label[lang]}
        </button>
      ))}
    </div>
  );
}

/** 左右投／左右打拆分小表：obp/slg/ops 在目前所有資料裡都是 null，只留 AVG 一行。 */
function SplitTable({
  lang,
  title,
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  lang: Lang;
  title: Bilingual;
  leftLabel: Bilingual;
  rightLabel: Bilingual;
  left: { avg: number | null } | null;
  right: { avg: number | null } | null;
}) {
  const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—');
  return (
    <div className="space-y-1">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {title[lang]}
      </div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-[9px] uppercase tracking-wide text-ink-muted">
            <th className="w-10 text-left font-semibold">&nbsp;</th>
            <th className="text-right font-semibold">{leftLabel[lang]}</th>
            <th className="text-right font-semibold">{rightLabel[lang]}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-dashed border-line">
            <td className="py-0.5 font-[family-name:var(--font-mono-ticket)] font-semibold text-ink-muted">AVG</td>
            <td className="py-0.5 text-right font-[family-name:var(--font-mono-ticket)] tabular-nums text-ink">
              {fmt(left?.avg)}
            </td>
            <td className="py-0.5 text-right font-[family-name:var(--font-mono-ticket)] tabular-nums text-ink">
              {fmt(right?.avg)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const SPLIT_TITLE_BATTING = bi('對戰左／右投手', 'Splits vs. Pitcher Handedness');
const SPLIT_TITLE_PITCHING = bi('對戰左／右打者', 'Splits vs. Batter Handedness');
const VS_LHP = bi('面對左投', 'vs LHP');
const VS_RHP = bi('面對右投', 'vs RHP');
const VS_LHB = bi('面對左打', 'vs LHB');
const VS_RHB = bi('面對右打', 'vs RHB');

function StatsTab({ player, lang, children }: { player: Player; lang: Lang; children?: React.ReactNode }) {
  const bioRows: Array<{ label: Bilingual; value: string }> = [
    { label: UI.playerCard.batsThrows, value: `${player.bats}/${player.throws}` },
    { label: UI.playerCard.league, value: player.leagueOrigin },
    { label: UI.playerCard.age, value: player.age !== null ? String(player.age) : '—' },
  ];

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {bioRows.map((row, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-2 border-b border-dashed border-line pb-1"
          >
            <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {row.label[lang]}
            </dt>
            <dd className="font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {player.batting && (
        <SplitTable lang={lang} title={SPLIT_TITLE_BATTING} leftLabel={VS_LHP} rightLabel={VS_RHP} left={player.batting.vsLHP} right={player.batting.vsRHP} />
      )}
      {player.pitching && (
        <SplitTable lang={lang} title={SPLIT_TITLE_PITCHING} leftLabel={VS_LHB} rightLabel={VS_RHB} left={player.pitching.vsLHB} right={player.pitching.vsRHB} />
      )}

      {player.scoutingNote && (
        <p className="text-xs leading-relaxed text-ink-soft">{player.scoutingNote[lang]}</p>
      )}

      {children}
    </div>
  );
}

function headlineStats(player: Player, lang: Lang): Array<{ label: string; value: string }> {
  if (player.batting) {
    return [
      { label: 'AVG', value: player.batting.avg.toFixed(3) },
      { label: 'OBP', value: player.batting.obp.toFixed(3) },
      { label: 'SLG', value: player.batting.slg.toFixed(3) },
    ];
  }
  if (player.pitching) {
    return [
      { label: 'ERA', value: player.pitching.era.toFixed(2) },
      { label: 'WHIP', value: player.pitching.whip.toFixed(2) },
    ];
  }
  return [];
}

export interface PlayerCardProps {
  player: Player;
  lang: Lang;
  className?: string;
  children?: React.ReactNode;
}

/** 球隊色塊球員卡：左側色塊放大背號，右側姓名／守位／關鍵數據，取代舊的登機證票券卡。 */
export function PlayerCard({ player, lang, className, children }: PlayerCardProps) {
  const [tab, setTab] = React.useState<PlayerCardTab>('overview');
  const team = getTeam(player.teamCode, player.era);
  const tier = ROSTER_TIER_LABELS[player.rosterClass];
  const positionLabel = player.pitcherRole ?? player.positions.join('/');
  const stats = headlineStats(player, lang);

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-[var(--radius-pass)] bg-paper-pure ring-1 ring-line-strong',
        'shadow-[var(--shadow-ticket)]',
        className,
      )}
    >
      {/* 球隊色塊 + 背號 */}
      <div
        className="flex w-16 shrink-0 flex-col items-center justify-center gap-1"
        style={{ backgroundColor: team?.colorPrimary ?? '#0b2545' }}
      >
        <span className="text-2xl leading-none" aria-hidden>
          {team?.flagEmoji ?? '⚾'}
        </span>
        <span className="font-[family-name:var(--font-mono-ticket)] text-2xl font-black leading-none text-white">
          {player.jersey !== null ? player.jersey : '—'}
        </span>
      </div>

      <div className="flex-1 px-4 pb-3 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight text-ink">{player.name[lang]}</h3>
            <p className="truncate text-xs text-ink-muted">
              {team?.code ?? player.teamCode} · {positionLabel}
            </p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', TONE_BADGE[tier.tone])}>
            {tier[lang]}
          </span>
        </div>

        <div className="mt-2">
          <PlayerCardTabs active={tab} onChange={setTab} lang={lang} />
        </div>

        {tab === 'overview' ? (
          <>
            {stats.length > 0 && (
              <div className={cn('mt-3 grid gap-2', FIELD_GRID_COLS[stats.length] ?? 'grid-cols-3')}>
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{s.label}</span>
                    <span className="font-[family-name:var(--font-mono-ticket)] text-lg font-bold tabular-nums text-ink">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field lang={lang} label={UI.playerCard.club} value={player.club ? player.club[lang] : '—'} />
              <Field lang={lang} label={UI.playerCard.country} value={`${team?.flagEmoji ?? ''} ${player.teamCode}`.trim()} align="right" />
            </div>
            {children && <div className="mt-3">{children}</div>}
          </>
        ) : (
          <div className="mt-3">
            <StatsTab player={player} lang={lang}>
              {children}
            </StatsTab>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ManagerCard                                                        */
/* ------------------------------------------------------------------ */

export function ManagerCard({
  name,
  teamCode,
  era,
  lang,
  className,
}: {
  name: Bilingual;
  teamCode: TeamCode;
  era: Era;
  lang: Lang;
  className?: string;
}) {
  const team = getTeam(teamCode, era);
  const tier = ROSTER_TIER_LABELS.MANAGER;

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-[var(--radius-pass)] bg-paper-pure ring-1 ring-line-strong',
        'shadow-[var(--shadow-ticket)]',
        className,
      )}
    >
      <div
        className="flex w-16 shrink-0 flex-col items-center justify-center gap-1"
        style={{ backgroundColor: team?.colorPrimary ?? '#0b2545' }}
      >
        <Shield size={22} className="text-white" />
      </div>
      <div className="flex-1 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight text-ink">{name[lang]}</h3>
            <p className="truncate text-xs text-ink-muted">{team?.name[lang] ?? teamCode}</p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', TONE_BADGE[tier.tone])}>
            {tier[lang]}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Shield size={13} />
          {lang === 'zh' ? '總教練 · 調度決策權限' : 'Manager · Tactical authority'}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MatchCard：雙方對戰卡                                                */
/* ------------------------------------------------------------------ */

interface MatchSide {
  code: string;
  flagEmoji: string;
  name: Bilingual;
  colorPrimary?: string;
}

export interface MatchCardProps {
  lang: Lang;
  title: Bilingual;
  subtitle?: Bilingual;
  badge?: Bilingual;
  away: MatchSide;
  home: MatchSide;
  fields?: CardField[];
  children?: React.ReactNode;
  className?: string;
}

function TeamChip({ side, lang, align }: { side: MatchSide; lang: Lang; align: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-2', align === 'right' && 'flex-row-reverse text-right')}>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: side.colorPrimary ?? '#0b2545' }}
        aria-hidden
      >
        {side.flagEmoji}
      </span>
      <div className="min-w-0">
        <div className="font-[family-name:var(--font-mono-ticket)] text-xl font-black tracking-tight text-navy">{side.code}</div>
        <div className="truncate text-[10px] text-ink-muted">{side.name[lang]}</div>
      </div>
    </div>
  );
}

/** 雙方對戰卡：取代舊的「出發地 → 抵達地」航線登機證，改成置中 VS 的對戰預覽。 */
export function MatchCard({ lang, title, subtitle, badge, away, home, fields = [], children, className }: MatchCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[calc(var(--radius-pass)+4px)] bg-paper-pure ring-1 ring-line-strong',
        'shadow-[var(--shadow-ticket)]',
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-navy" />
      <div className="px-4 pb-4 pt-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-ink-muted">{UI.brand[lang]} · BAR</div>
            <h3 className="mt-1 truncate text-lg font-bold leading-tight text-ink">{title[lang]}</h3>
            {subtitle && <p className="truncate text-xs text-ink-muted">{subtitle[lang]}</p>}
          </div>
          {badge && (
            <span className="shrink-0 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {badge[lang]}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <TeamChip side={away} lang={lang} align="left" />
          <span className="shrink-0 font-[family-name:var(--font-mono-ticket)] text-sm font-black text-ink-muted">VS</span>
          <TeamChip side={home} lang={lang} align="right" />
        </div>

        {fields.length > 0 && (
          <div className={cn('mt-4 grid gap-2 border-t border-dashed border-line pt-3', FIELD_GRID_COLS[fields.length] ?? 'grid-cols-4')}>
            {fields.map((field, i) => (
              <Field key={i} lang={lang} {...field} />
            ))}
          </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
