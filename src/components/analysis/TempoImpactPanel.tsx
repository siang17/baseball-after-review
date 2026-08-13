'use client';

import * as React from 'react';
import { AlertTriangle, Headphones, Timer, WifiOff, Zap } from 'lucide-react';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { bi } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Lang, Player, TempoImpact } from '@/types/baseball';

/** 快慢兩組的單一指標對照列。 */
function SplitRow({
  label,
  fast,
  slow,
  format,
  /** 慢組數值較高是否代表變差。 */
  higherIsWorse,
  lang,
}: {
  label: { zh: string; en: string };
  fast: number;
  slow: number;
  format: (v: number) => string;
  higherIsWorse: boolean;
  lang: Lang;
}) {
  const diff = slow - fast;
  const worse = higherIsWorse ? diff > 0 : diff < 0;

  return (
    <tr className="border-t border-line">
      <td className="py-1.5 pr-2 text-xs font-semibold text-ink">{label[lang]}</td>
      <td className="px-2 py-1.5 text-right font-[family-name:var(--font-mono-ticket)] text-sm tabular-nums text-ink">
        {format(fast)}
      </td>
      <td className="px-2 py-1.5 text-right font-[family-name:var(--font-mono-ticket)] text-sm font-bold tabular-nums text-alert">
        {format(slow)}
      </td>
      <td
        className={cn(
          'py-1.5 pl-2 text-right font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold tabular-nums',
          diff === 0 ? 'text-ink-muted' : worse ? 'text-plum' : 'text-emerald-700',
        )}
      >
        {format(diff).startsWith('-') ? format(diff) : `+${format(diff)}`}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */

function TempoCard({
  impact,
  pitcher,
  lang,
}: {
  impact: TempoImpact;
  pitcher: Player | null;
  lang: Lang;
}) {
  const fast = impact.splits.find((s) => s.bucket === 'FAST');
  const slow = impact.splits.find((s) => s.bucket === 'SLOW');

  return (
    <article className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold leading-tight text-ink">
            {pitcher ? pitcher.name[lang] : impact.pitcherId}
          </h3>
          <p className="text-xs text-ink-muted">
            {impact.side === 'HOME'
              ? lang === 'zh'
                ? '主隊先發'
                : 'Home starter'
              : lang === 'zh'
                ? '客隊先發'
                : 'Away starter'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {impact.clockViolations > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[#fdecea] px-2 py-0.5 text-[10px] font-bold text-plum">
              <AlertTriangle size={10} />
              {impact.clockViolations} {lang === 'zh' ? '次違規' : 'violation(s)'}
            </span>
          )}
          {impact.malfunctionEvents > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-alert-soft px-2 py-0.5 text-[10px] font-bold text-alert">
              <WifiOff size={10} />
              {impact.malfunctionEvents}
            </span>
          )}
        </div>
      </header>

      {/* 節奏指標 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <BaggageTag
          lang={lang}
          label={bi('平均投球間隔', 'Avg tempo')}
          value={impact.avgTempoSec.toFixed(1)}
          unit="s"
          footnote={bi(
            `壘上有人 ${impact.avgTempoRunnersOnSec.toFixed(1)}s`,
            `${impact.avgTempoRunnersOnSec.toFixed(1)}s with runners`,
          )}
        />
        <BaggageTag
          lang={lang}
          label={bi('被逼快出手比例', 'Rushed rate')}
          value={(impact.rushedPitchRate * 100).toFixed(0)}
          unit="%"
          footnote={bi('剩餘 < 3 秒', 'under 3s left')}
          tone={impact.rushedPitchRate >= 0.2 ? 'warn' : 'neutral'}
        />
        <BaggageTag
          lang={lang}
          label={bi('PitchCom 改訊號', 'Sign changes')}
          value={impact.pitchComChanges}
          footnote={bi(
            `平均確認 ${impact.avgAckLatencyMs} ms`,
            `${impact.avgAckLatencyMs} ms avg ack`,
          )}
          tone={impact.avgAckLatencyMs >= 1000 ? 'warn' : 'neutral'}
        />
      </div>

      {/* 快 vs 慢對照 */}
      {fast && slow && (
        <div className="mt-3 rounded-lg bg-paper p-3">
          <h4 className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            <Zap size={11} />
            {lang === 'zh' ? '從容出手 vs. 被逼快' : 'Comfortable vs. rushed'}
          </h4>
          <table className="w-full">
            <thead>
              <tr className="text-[9px] uppercase tracking-[0.16em] text-ink-muted">
                <th className="pb-1 pr-2 text-left font-semibold">
                  {lang === 'zh' ? '指標' : 'Metric'}
                </th>
                <th className="px-2 pb-1 text-right font-semibold">{fast.label[lang]}</th>
                <th className="px-2 pb-1 text-right font-semibold text-alert">
                  {slow.label[lang]}
                </th>
                <th className="pb-1 pl-2 text-right font-semibold">Δ</th>
              </tr>
            </thead>
            <tbody>
              <SplitRow
                lang={lang}
                label={{ zh: '球數', en: 'Pitches' }}
                fast={fast.pitches}
                slow={slow.pitches}
                format={(v) => String(Math.round(v))}
                higherIsWorse={false}
              />
              <SplitRow
                lang={lang}
                label={{ zh: '揮空率', en: 'Whiff%' }}
                fast={fast.whiffPct}
                slow={slow.whiffPct}
                format={(v) => `${(v * 100).toFixed(1)}%`}
                higherIsWorse={false}
              />
              <SplitRow
                lang={lang}
                label={{ zh: 'xwOBA', en: 'xwOBA' }}
                fast={fast.xwoba}
                slow={slow.xwoba}
                format={(v) => v.toFixed(3)}
                higherIsWorse
              />
              <SplitRow
                lang={lang}
                label={{ zh: '平均球速', en: 'Avg velo' }}
                fast={fast.avgVelocity}
                slow={slow.avgVelocity}
                format={(v) => v.toFixed(1)}
                higherIsWorse={false}
              />
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 border-l-2 border-alert/40 pl-3 text-sm leading-relaxed text-ink-soft">
        {impact.note[lang]}
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ */

export interface TempoImpactPanelProps {
  impacts: TempoImpact[];
  resolvePlayer: (id: string) => Player | null;
  lang: Lang;
  className?: string;
}

/**
 * Pitch Timer × PitchCom 節奏控制影響評估。
 * 核心論點：把「被計時器逼快的球」與「從容出手的球」分組對照，
 * 看投球品質是否隨節奏壓力下降。
 */
export function TempoImpactPanel({
  impacts,
  resolvePlayer,
  lang,
  className,
}: TempoImpactPanelProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3 rounded-lg bg-board px-4 py-2.5 text-board-text">
        <Timer size={15} className="text-board-amber" />
        <span className="text-xs leading-relaxed">
          {lang === 'zh'
            ? '計時器：壘上無人 15 秒／有人 20 秒，打者須於剩餘 8 秒前就位。'
            : 'Clock: 15s with the bases empty, 20s with runners on; the batter must be set with 8s left.'}
        </span>
        <Headphones size={15} className="ml-auto shrink-0 text-board-amber" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {impacts.map((impact) => (
          <TempoCard
            key={impact.pitcherId}
            impact={impact}
            pitcher={resolvePlayer(impact.pitcherId)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
