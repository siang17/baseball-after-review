'use client';

import * as React from 'react';
import { CalendarClock, Lightbulb, Luggage, PlaneLanding } from 'lucide-react';
import { cn, formatSigned } from '@/lib/utils';
import type { BullpenBridgePlan, Lang, PitchLimitConfig, Player } from '@/types/baseball';
import { restDaysFor } from '@/lib/constants';

const REMOVAL_LABEL: Record<string, { zh: string; en: string }> = {
  PITCH_LIMIT: { zh: '達用球數上限', en: 'Pitch limit' },
  PERFORMANCE: { zh: '失分／內容', en: 'Performance' },
  MATCHUP: { zh: '左右對戰', en: 'Matchup' },
  INJURY: { zh: '傷勢', en: 'Injury' },
  END_OF_GAME: { zh: '完投收尾', en: 'Closed it out' },
};

/* ------------------------------------------------------------------ */

function Leg({
  leg,
  pitcher,
  limit,
  lang,
}: {
  leg: BullpenBridgePlan['legs'][number];
  pitcher: Player | null;
  limit: number | null;
  lang: Lang;
}) {
  const pct = limit ? Math.min(1, leg.pitches / limit) : 0;
  const atLimit = limit !== null && leg.pitches >= limit;
  const nearLimit = limit !== null && !atLimit && leg.pitches >= limit - 10;

  return (
    <li className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-[family-name:var(--font-mono-ticket)] text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            {lang === 'zh' ? '第' : 'INN'} {leg.fromInning.toFixed(0)}–{leg.toInning.toFixed(1)}{' '}
            {lang === 'zh' ? '局' : ''}
          </div>
          <h4 className="text-sm font-bold text-ink">
            {pitcher ? pitcher.name[lang] : leg.pitcherId}
          </h4>
        </div>

        <div className="text-right">
          <div className="font-[family-name:var(--font-mono-ticket)] text-2xl font-black leading-none tabular-nums text-ink">
            {leg.pitches}
            <span className="text-xs font-bold text-ink-muted">/{limit ?? '∞'}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            {lang === 'zh' ? '用球數' : 'pitches'}
          </div>
        </div>
      </div>

      {/* 行李重量條 */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-sunken">
        <div
          className={cn(
            'h-full rounded-full',
            atLimit ? 'bg-plum' : nearLimit ? 'bg-alert' : 'bg-navy',
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {/* 指標列 */}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-4">
        <Stat label={{ zh: '面對打者', en: 'BF' }} value={String(leg.battersFaced)} lang={lang} />
        <Stat label={{ zh: '失分', en: 'Runs' }} value={String(leg.runsAllowed)} lang={lang} />
        <Stat
          label={{ zh: '平均槓桿', en: 'Avg LI' }}
          value={leg.avgLeverageIndex.toFixed(2)}
          lang={lang}
          tone={leg.avgLeverageIndex >= 2 ? 'alert' : undefined}
        />
        <Stat
          label={{ zh: '勝率貢獻', en: 'ΔWP' }}
          value={`${formatSigned(leg.deltaWp * 100, 1)}%`}
          lang={lang}
          tone={leg.deltaWp < 0 ? 'plum' : 'good'}
        />
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-2 text-[11px]">
        {leg.removalReason && (
          <span className="rounded-full bg-paper-sunken px-2 py-0.5 font-semibold text-ink-muted">
            {REMOVAL_LABEL[leg.removalReason][lang]}
          </span>
        )}
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
            leg.restDaysIncurred >= 4
              ? 'bg-[#fdecea] text-plum'
              : leg.restDaysIncurred > 0
                ? 'bg-alert-soft text-alert'
                : 'bg-emerald-50 text-emerald-700',
          )}
        >
          <CalendarClock size={11} />
          {lang === 'zh'
            ? `強制休息 ${leg.restDaysIncurred} 天`
            : `${leg.restDaysIncurred} days rest`}
        </span>
      </div>
    </li>
  );
}

function Stat({
  label,
  value,
  lang,
  tone,
}: {
  label: { zh: string; en: string };
  value: string;
  lang: Lang;
  tone?: 'alert' | 'plum' | 'good';
}) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-wider text-ink-muted">{label[lang]}</dt>
      <dd
        className={cn(
          'font-[family-name:var(--font-mono-ticket)] font-bold tabular-nums',
          tone === 'alert' && 'text-alert',
          tone === 'plum' && 'text-plum',
          tone === 'good' && 'text-emerald-700',
          !tone && 'text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface BullpenBridgePanelProps {
  plan: BullpenBridgePlan;
  resolvePlayer: (id: string) => Player | null;
  /** 用於顯示上限與休息級距。 */
  pitchLimit: PitchLimitConfig;
  teamLabel: string;
  lang: Lang;
  className?: string;
}

/**
 * 65 球用球數限制下的換投時機與牛棚銜接檢討。
 */
export function BullpenBridgePanel({
  plan,
  resolvePlayer,
  pitchLimit,
  teamLabel,
  lang,
  className,
}: BullpenBridgePanelProps) {
  const totalPitches = plan.legs.reduce((sum, l) => sum + l.pitches, 0);
  const totalDelta = plan.legs.reduce((sum, l) => sum + l.deltaWp, 0);

  return (
    <section
      className={cn(
        'rounded-[calc(var(--radius-pass)+2px)] border border-line bg-paper p-4',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-line-strong pb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-navy">
          <PlaneLanding size={15} />
          {teamLabel}
        </h3>
        <div className="flex items-center gap-3 font-[family-name:var(--font-mono-ticket)] text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <Luggage size={12} />
            {totalPitches} {lang === 'zh' ? '球' : 'pitches'}
          </span>
          <span className={cn('font-bold', totalDelta < 0 ? 'text-plum' : 'text-emerald-700')}>
            ΔWP {formatSigned(totalDelta * 100, 1)}%
          </span>
        </div>
      </header>

      <ol className="mt-3 space-y-2">
        {plan.legs.map((leg, i) => (
          <Leg
            key={`${leg.pitcherId}-${i}`}
            leg={leg}
            pitcher={resolvePlayer(leg.pitcherId)}
            limit={pitchLimit.limit}
            lang={lang}
          />
        ))}
      </ol>

      {/* 替代方案 */}
      {plan.alternative && (
        <div className="mt-3 rounded-[var(--radius-pass)] border-2 border-dashed border-navy/30 bg-navy/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-navy">
            <Lightbulb size={12} />
            {lang === 'zh' ? '替代銜接方案' : 'Alternative bridge'}
          </div>
          <h4 className="mt-1 text-sm font-bold text-ink">
            {plan.alternative.label[lang]}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {plan.alternative.rationale[lang]}
          </p>
          <div className="mt-2 font-[family-name:var(--font-mono-ticket)] text-lg font-black text-emerald-700">
            {formatSigned(plan.alternative.projectedDeltaWp * 100, 1)}%
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              {lang === 'zh' ? '模擬勝率增益' : 'projected WP gain'}
            </span>
          </div>
        </div>
      )}

      {/* 休息級距提醒 */}
      <div className="mt-3 rounded-lg bg-paper-sunken px-3 py-2">
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
          {lang === 'zh' ? '休息規則級距' : 'Rest tiers'}
        </div>
        <ul className="mt-1 space-y-0.5 text-[11px] text-ink-soft">
          {pitchLimit.restRules.map((rule) => {
            const hit = plan.legs.some(
              (l) => restDaysFor(l.pitches, pitchLimit) === rule.restDays,
            );
            return (
              <li
                key={rule.minPitches}
                className={cn('flex items-center gap-1.5', hit && 'font-bold text-ink')}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    hit ? 'bg-plum' : 'bg-line-strong',
                  )}
                />
                {rule.label[lang]}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 border-l-2 border-plum/40 pl-3 text-sm leading-relaxed text-ink-soft">
        {plan.note[lang]}
      </p>
      <p className="mt-2 flex gap-1.5 rounded bg-alert-soft px-2 py-1.5 text-[11px] leading-relaxed text-alert">
        <CalendarClock size={12} className="mt-0.5 shrink-0" />
        {plan.nextGameImpact[lang]}
      </p>
    </section>
  );
}
