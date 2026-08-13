'use client';

import * as React from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { UI } from '@/lib/i18n';
import { cn, formatSigned } from '@/lib/utils';
import type { CrucialPlay, Lang, WinProbabilityPoint } from '@/types/baseball';

const NAVY = '#002244';
const PLUM = '#d9381e';
const ALERT = '#ff6b35';
const LINE = '#e2e6ea';
const MUTED = '#7b8a9c';

interface ChartRow extends WinProbabilityPoint {
  homePct: number;
  awayPct: number;
  /** 局數標籤，例如 "▲6"。 */
  tick: string;
}

function toRows(points: WinProbabilityPoint[]): ChartRow[] {
  return points.map((p) => ({
    ...p,
    homePct: p.home * 100,
    awayPct: (1 - p.home) * 100,
    tick: `${p.half === 'TOP' ? '▲' : '▼'}${p.inning}`,
  }));
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  lang,
  homeLabel,
  awayLabel,
}: TooltipProps<number, string> & {
  lang: Lang;
  homeLabel: string;
  awayLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ChartRow;

  return (
    <div className="rounded-lg border border-line bg-paper-pure px-3 py-2 shadow-lg">
      <div className="font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold text-navy">
        {row.tick} · {row.score.away}-{row.score.home}
      </div>
      <p className="mt-1 max-w-[220px] text-xs leading-snug text-ink">
        {row.label[lang]}
      </p>
      <dl className="mt-1.5 space-y-0.5 text-[11px] tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{homeLabel}</dt>
          <dd className="font-bold text-navy">{row.homePct.toFixed(1)}%</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{awayLabel}</dt>
          <dd className="font-bold text-ink-soft">{row.awayPct.toFixed(1)}%</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{UI.chart.leverage[lang]}</dt>
          <dd className={cn('font-bold', row.leverageIndex >= 1.5 ? 'text-alert' : 'text-ink')}>
            {row.leverageIndex.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface WinProbabilityChartProps {
  points: WinProbabilityPoint[];
  lang: Lang;
  homeLabel: string;
  awayLabel: string;
  /** 在曲線上標出的關鍵轉折點。 */
  crucialPlays?: CrucialPlay[];
  /** 目前復盤游標位置（index）。 */
  cursorIndex?: number;
  /** 是否顯示槓桿指數背景長條。 */
  showLeverage?: boolean;
  height?: number;
  onSelectPoint?: (point: WinProbabilityPoint) => void;
  className?: string;
}

/**
 * 勝率曲線 (Win Probability Chart)。
 * 主隊勝率以面積呈現，50% 為分水嶺；背景長條為槓桿指數，
 * 關鍵轉折點以警示色圓點標註。
 */
export function WinProbabilityChart({
  points,
  lang,
  homeLabel,
  awayLabel,
  crucialPlays = [],
  cursorIndex,
  showLeverage = true,
  height = 300,
  onSelectPoint,
  className,
}: WinProbabilityChartProps) {
  const rows = React.useMemo(() => toRows(points), [points]);

  /** 每一局第一個資料點的 index，用來畫局數分隔線。 */
  const inningTicks = React.useMemo(() => {
    const seen = new Set<string>();
    return rows
      .filter((r) => {
        const key = `${r.inning}-${r.half}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((r) => r.index);
  }, [rows]);

  const crucialDots = React.useMemo(() => {
    const byId = new Map(crucialPlays.map((p) => [p.id, p]));
    return rows
      .filter((r) => r.crucialPlayId && byId.has(r.crucialPlayId))
      .map((r) => ({ row: r, play: byId.get(r.crucialPlayId!)! }));
  }, [rows, crucialPlays]);

  if (rows.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-[var(--radius-pass)] border border-dashed border-line-strong text-sm text-ink-muted">
        {lang === 'zh' ? '尚無勝率資料。' : 'No win probability data.'}
      </div>
    );
  }

  return (
    <figure className={cn('rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3', className)}>
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {UI.chart.winProbability[lang]}
        </h4>
        <div className="flex items-center gap-3 text-[11px]">
          <LegendSwatch color={NAVY} label={homeLabel} />
          <LegendSwatch color={MUTED} label={awayLabel} />
          {showLeverage && <LegendSwatch color={ALERT} label={UI.chart.leverage[lang]} faded />}
        </div>
      </figcaption>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 4, left: -18 }}
          onClick={(e) => {
            const idx = typeof e?.activeTooltipIndex === 'number' ? e.activeTooltipIndex : null;
            if (idx !== null && rows[idx]) onSelectPoint?.(rows[idx]);
          }}
        >
          <defs>
            <linearGradient id="wpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NAVY} stopOpacity={0.28} />
              <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={LINE} vertical={false} />

          <XAxis
            dataKey="index"
            tickFormatter={(v: number) => rows.find((r) => r.index === v)?.tick ?? ''}
            ticks={inningTicks}
            tick={{ fontSize: 10, fill: MUTED }}
            axisLine={{ stroke: LINE }}
            tickLine={false}
          />

          <YAxis
            yAxisId="wp"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 10, fill: MUTED }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="li" orientation="right" domain={[0, 6]} hide />

          <Tooltip
            content={
              <ChartTooltip lang={lang} homeLabel={homeLabel} awayLabel={awayLabel} />
            }
          />

          {showLeverage && (
            <Bar
              yAxisId="li"
              dataKey="leverageIndex"
              fill={ALERT}
              fillOpacity={0.12}
              isAnimationActive={false}
            />
          )}

          {/* 50% 分水嶺 */}
          <ReferenceLine yAxisId="wp" y={50} stroke={MUTED} strokeDasharray="4 4" />

          {/* 局數分隔 */}
          {inningTicks.map((idx) => (
            <ReferenceLine key={idx} yAxisId="wp" x={idx} stroke={LINE} />
          ))}

          <Area
            yAxisId="wp"
            type="stepAfter"
            dataKey="homePct"
            stroke={NAVY}
            strokeWidth={2}
            fill="url(#wpFill)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, fill: NAVY }}
          />

          {/* 關鍵轉折點 */}
          {crucialDots.map(({ row, play }) => (
            <ReferenceDot
              key={play.id}
              yAxisId="wp"
              x={row.index}
              y={row.homePct}
              r={5}
              fill={play.severity === 'CRITICAL' ? PLUM : ALERT}
              stroke="#fff"
              strokeWidth={2}
              isFront
            />
          ))}

          {/* 復盤游標 */}
          {typeof cursorIndex === 'number' && (
            <ReferenceLine
              yAxisId="wp"
              x={cursorIndex}
              stroke={PLUM}
              strokeWidth={1.5}
              strokeDasharray="2 3"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 最大位移註記 */}
      {crucialDots.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-dashed border-line pt-2">
          {crucialDots.slice(0, 3).map(({ play }) => (
            <li key={play.id} className="flex items-baseline gap-2 text-[11px]">
              <span
                className="mt-[3px] h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: play.severity === 'CRITICAL' ? PLUM : ALERT }}
              />
              <span className="font-[family-name:var(--font-mono-ticket)] font-bold text-ink">
                {formatSigned(play.deltaWinProbability * 100, 1)}%
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-muted">
                {play.title[lang]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

function LegendSwatch({
  color,
  label,
  faded = false,
}: {
  color: string;
  label: string;
  faded?: boolean;
}) {
  return (
    <span className="flex items-center gap-1 text-ink-muted">
      <span
        className="h-2 w-4 rounded-sm"
        style={{ backgroundColor: color, opacity: faded ? 0.25 : 1 }}
      />
      {label}
    </span>
  );
}
