import * as React from 'react';
import { FileWarning, Minus, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { Barcode } from '@/components/ui/Barcode';
import { cn, formatSigned } from '@/lib/utils';
import type { Lang, Player, RosterSnub } from '@/types/baseball';

/** 判斷這筆差值對遺珠而言是好是壞（考慮「越低越好」的指標）。 */
function favoursSnub(delta: number | null, higherIsBetter: boolean): boolean | null {
  if (delta === null || delta === 0) return null;
  return higherIsBetter ? delta > 0 : delta < 0;
}

function formatValue(value: number | null): string {
  if (value === null) return '—';
  // 比率型指標（OPS / 揮空率）保留三位小數。
  return Math.abs(value) < 1 && !Number.isInteger(value)
    ? value.toFixed(3)
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);
}

/* ------------------------------------------------------------------ */

function DeltaRow({
  row,
  lang,
}: {
  row: RosterSnub['deltas'][number];
  lang: Lang;
}) {
  const good = favoursSnub(row.delta, row.higherIsBetter);
  const Icon = good === null ? Minus : good ? TrendingUp : TrendingDown;

  return (
    <tr className="border-t border-line">
      <td className="py-2 pr-2 text-xs font-semibold text-ink">{row.label[lang]}</td>
      <td className="px-2 py-2 text-right font-[family-name:var(--font-mono-ticket)] text-sm font-bold tabular-nums text-alert">
        {formatValue(row.snubValue)}
      </td>
      <td className="px-2 py-2 text-right font-[family-name:var(--font-mono-ticket)] text-sm tabular-nums text-ink-muted">
        {formatValue(row.selectedValue)}
      </td>
      <td className="py-2 pl-2 text-right">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold tabular-nums',
            good === null && 'bg-paper-sunken text-ink-muted',
            good === true && 'bg-emerald-50 text-emerald-700',
            good === false && 'bg-[#fdecea] text-plum',
          )}
        >
          <Icon size={11} strokeWidth={2.5} />
          {row.delta === null
            ? '—'
            : formatSigned(
                row.delta,
                Number.isInteger(row.delta) ? 0 : Math.abs(row.delta) < 1 ? 3 : 1,
              )}
        </span>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */

export interface SnubComparisonProps {
  snub: RosterSnub;
  /** 依 id 取得入選者資料；找不到時只顯示 id。 */
  resolvePlayer: (id: string) => Player | null;
  lang: Lang;
  className?: string;
}

/**
 * 遺珠對照卡：候補登機證（STANDBY）造型 + 與入選者的逐項數據差。
 */
export function SnubComparison({
  snub,
  resolvePlayer,
  lang,
  className,
}: SnubComparisonProps) {
  const selected = resolvePlayer(snub.comparedToPlayerId);
  const wins = snub.deltas.filter((d) => favoursSnub(d.delta, d.higherIsBetter) === true).length;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[var(--radius-pass)] border border-dashed border-alert/50 bg-paper-pure',
        className,
      )}
    >
      {/* 抬頭：候補存根 */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-line-strong bg-alert-soft px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-alert">
            <Star size={11} strokeWidth={3} />
            STANDBY · {lang === 'zh' ? '候補未登機' : 'Did not board'}
          </div>
          <h3 className="mt-1 truncate text-lg font-bold leading-tight text-ink">
            {snub.player.name[lang]}
          </h3>
          <p className="text-xs text-ink-muted">
            {snub.player.positions.join('/')} ·{' '}
            {snub.player.club ? snub.player.club[lang] : '—'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {lang === 'zh' ? '領先項目' : 'Categories won'}
          </div>
          <div className="font-[family-name:var(--font-mono-ticket)] text-2xl font-black leading-none text-alert">
            {wins}
            <span className="text-sm text-ink-muted">/{snub.deltas.length}</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-3">
        {/* 論點 */}
        <p className="text-sm leading-relaxed text-ink-soft">{snub.argument[lang]}</p>

        {/* 數據對照 */}
        <table className="mt-3 w-full">
          <thead>
            <tr className="text-[9px] uppercase tracking-[0.18em] text-ink-muted">
              <th className="pb-1 pr-2 text-left font-semibold">
                {lang === 'zh' ? '指標' : 'Metric'}
              </th>
              <th className="px-2 pb-1 text-right font-semibold text-alert">
                {lang === 'zh' ? '遺珠' : 'Snub'}
              </th>
              <th className="px-2 pb-1 text-right font-semibold">
                {selected ? selected.name[lang] : snub.comparedToPlayerId}
              </th>
              <th className="pb-1 pl-2 text-right font-semibold">Δ</th>
            </tr>
          </thead>
          <tbody>
            {snub.deltas.map((row) => (
              <DeltaRow key={row.metric} row={row} lang={lang} />
            ))}
          </tbody>
        </table>

        {/* 出處 */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-line pt-2">
          <Barcode seed={snub.player.id} bars={22} className="h-4 opacity-30" />
          {snub.sources.length > 0 ? (
            <ul className="flex flex-wrap justify-end gap-2 text-[11px]">
              {snub.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy underline underline-offset-2 hover:text-plum"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-ink-muted">
              <FileWarning size={12} />
              {lang === 'zh' ? '新聞出處待補' : 'Sources pending'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
