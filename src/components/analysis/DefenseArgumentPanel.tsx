'use client';

import * as React from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { bi } from '@/lib/i18n';
import { cn, formatSigned } from '@/lib/utils';
import type { Bilingual, Lang, Player } from '@/types/baseball';

const COMPONENTS = [
  { key: 'rngR', label: bi('守備範圍 RngR', 'Range'), color: '#002244' },
  { key: 'errR', label: bi('失誤 ErrR', 'Errors'), color: '#33506f' },
  { key: 'armR', label: bi('阻殺 ArmR', 'Arm'), color: '#7b8a9c' },
  { key: 'dpr', label: bi('雙殺 DPR', 'Double plays'), color: '#c8d0d8' },
] as const;

/** 分項橫條：以最大絕對值為比例尺，正負分置於中線兩側。 */
function ComponentBars({
  components,
  lang,
}: {
  components: NonNullable<NonNullable<Player['fielding']>['uzrComponents']>;
  lang: Lang;
}) {
  const values = COMPONENTS.map((c) => ({
    ...c,
    value: components[c.key] ?? 0,
  }));
  const scale = Math.max(...values.map((v) => Math.abs(v.value)), 1);

  return (
    <ul className="space-y-1.5">
      {values.map((v) => {
        const width = (Math.abs(v.value) / scale) * 50;
        const positive = v.value >= 0;
        return (
          <li key={v.key} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-[10px] font-semibold text-ink-muted">
              {v.label[lang]}
            </span>
            <span className="relative h-3 flex-1 rounded-sm bg-paper-sunken">
              <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
              <span
                className="absolute inset-y-0 rounded-sm"
                style={{
                  backgroundColor: v.color,
                  width: `${width}%`,
                  left: positive ? '50%' : `${50 - width}%`,
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold tabular-nums text-ink">
              {formatSigned(v.value, 1)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */

function DefenderCard({
  player,
  discount,
  lang,
}: {
  player: Player;
  discount: number;
  lang: Lang;
}) {
  const f = player.fielding;
  if (!f) return null;

  const raw = f.uzr150 ?? 0;
  const adjusted = raw * discount;

  // 範圍分項佔整體 UZR 的比重 —— 論證「價值來自哪裡」的關鍵。
  const rangeShare =
    f.uzr && f.uzr !== 0 && f.uzrComponents?.rngR != null
      ? f.uzrComponents.rngR / f.uzr
      : null;

  return (
    <article className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold leading-tight text-ink">
            {player.name[lang]}
          </h3>
          <p className="text-xs text-ink-muted">
            {f.primaryPosition} · {player.club ? player.club[lang] : '—'} ·{' '}
            {f.innings.toLocaleString()} {lang === 'zh' ? '局' : 'IP'}
          </p>
        </div>
        <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {player.leagueOrigin}
        </span>
      </header>

      {/* 原始 vs 校正後 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <BaggageTag
          lang={lang}
          label={bi('UZR/150（原始）', 'UZR/150 (raw)')}
          value={formatSigned(raw, 1)}
          tone={raw >= 0 ? 'good' : 'danger'}
        />
        <BaggageTag
          lang={lang}
          label={bi('跨聯盟折算後', 'League-adjusted')}
          value={formatSigned(adjusted, 1)}
          footnote={bi(`係數 ×${discount}`, `factor ×${discount}`)}
          tone="neutral"
        />
        {rangeShare !== null && (
          <BaggageTag
            lang={lang}
            label={bi('範圍分項佔比', 'Range share')}
            value={`${Math.round(rangeShare * 100)}`}
            unit="%"
            footnote={
              rangeShare >= 0.6
                ? bi('價值來自守備範圍', 'Value comes from range')
                : bi('價值偏重低失誤', 'Value leans on error avoidance')
            }
            tone={rangeShare >= 0.6 ? 'good' : 'warn'}
          />
        )}
      </div>

      {/* 分項拆解 */}
      {f.uzrComponents && (
        <div className="mt-3 rounded-lg bg-paper p-3">
          <h4 className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            {lang === 'zh' ? 'UZR 分項拆解' : 'UZR component split'}
          </h4>
          <ComponentBars components={f.uzrComponents} lang={lang} />
        </div>
      )}

      {/* 論證 */}
      {player.scoutingNote && (
        <p className="mt-3 border-l-2 border-navy/30 pl-3 text-sm leading-relaxed text-ink-soft">
          {player.scoutingNote[lang]}
        </p>
      )}

      {/* 校正註記 */}
      {player.adjustment && (
        <p className="mt-2 flex gap-1.5 rounded bg-alert-soft px-2 py-1.5 text-[11px] leading-relaxed text-alert">
          <Info size={12} className="mt-0.5 shrink-0" />
          {player.adjustment.note[lang]}
        </p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */

export interface DefenseArgumentPanelProps {
  players: Player[];
  /** 跨聯盟折算係數（NPB → MLB）。 */
  discount: number;
  lang: Lang;
  heading?: Bilingual;
  className?: string;
}

/**
 * 守備數據論證面板：以 UZR 分項拆解說明價值來源，
 * 並標示 NPB → MLB 的跨聯盟折算區間。
 */
export function DefenseArgumentPanel({
  players,
  discount,
  lang,
  heading,
  className,
}: DefenseArgumentPanelProps) {
  const totalRaw = players.reduce((sum, p) => sum + (p.fielding?.uzr ?? 0), 0);

  return (
    <div className={cn('space-y-3', className)}>
      {heading && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-navy">
            <ShieldCheck size={15} />
            {heading[lang]}
          </h3>
          <span className="font-[family-name:var(--font-mono-ticket)] text-xs text-ink-muted">
            {lang === 'zh' ? '三人合計 UZR' : 'Combined UZR'}{' '}
            <strong className="text-ink">{formatSigned(totalRaw, 1)}</strong>
            {' → '}
            <strong className="text-ink">{formatSigned(totalRaw * discount, 1)}</strong>
          </span>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {players.map((p) => (
          <DefenderCard key={p.id} player={p} discount={discount} lang={lang} />
        ))}
      </div>
    </div>
  );
}
