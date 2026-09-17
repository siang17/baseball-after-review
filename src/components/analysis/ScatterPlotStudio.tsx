'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { ROSTER_TIER_LABELS, getTeam, METRICS, METRIC_KEYS } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import {
  buildScatterPoints,
  computeTrendLine,
  filterPlayers,
  formatMetricValue,
  type ScatterPoint,
} from '@/lib/scatter';
import { cn } from '@/lib/utils';
import type {
  Bilingual,
  Era,
  Lang,
  MetricKey,
  Player,
  ScatterPlotConfig,
  TeamCode,
} from '@/types/baseball';

const NAVY = '#002244';
const MUTED = '#7b8a9c';
const PLUM = '#d9381e';

const DOMAIN_GROUP_LABEL: Record<'batting' | 'pitching' | 'fielding', Bilingual> = {
  batting: bi('打擊', 'Batting'),
  pitching: bi('投球', 'Pitching'),
  fielding: bi('守備', 'Fielding'),
};

function metricsByDomain() {
  const groups: Record<'batting' | 'pitching' | 'fielding', MetricKey[]> = {
    batting: [],
    pitching: [],
    fielding: [],
  };
  for (const key of METRIC_KEYS) groups[METRICS[key].domain].push(key);
  return groups;
}

const DEFAULT_FILTERS: ScatterPlotConfig['filters'] = {
  eras: [],
  teamCodes: [],
  positions: [],
  rosterClasses: [],
  minInnings: null,
  minPlateAppearances: null,
};

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/* ------------------------------------------------------------------ */
/* 指標下拉選單                                                        */
/* ------------------------------------------------------------------ */

function MetricSelect({
  label,
  value,
  onChange,
  lang,
  allowNone = false,
}: {
  label: Bilingual;
  value: MetricKey | null;
  onChange: (key: MetricKey | null) => void;
  lang: Lang;
  allowNone?: boolean;
}) {
  const groups = metricsByDomain();
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
        {label[lang]}
      </span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || null) as MetricKey | null)}
        className="rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs font-semibold text-ink focus:border-navy focus:outline-none"
      >
        {allowNone && <option value="">{UI.scatter.none[lang]}</option>}
        {(Object.keys(groups) as Array<'batting' | 'pitching' | 'fielding'>).map((domain) => (
          <optgroup key={domain} label={DOMAIN_GROUP_LABEL[domain][lang]}>
            {groups[domain].map((key) => (
              <option key={key} value={key}>
                {METRICS[key].label[lang]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* 篩選 chip                                                           */
/* ------------------------------------------------------------------ */

function FilterChipGroup<T extends string | number>({
  label,
  options,
  optionLabel,
  selected,
  onToggle,
  lang,
}: {
  label: Bilingual;
  options: T[];
  optionLabel: (value: T) => string;
  selected: T[];
  onToggle: (value: T) => void;
  lang: Lang;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
        {label[lang]}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={String(opt)}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                active ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
              )}
            >
              {optionLabel(opt)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

function ScatterTooltip({
  active,
  payload,
  lang,
  xMetric,
  yMetric,
  sizeMetric,
}: TooltipProps<number, string> & {
  lang: Lang;
  xMetric: MetricKey;
  yMetric: MetricKey;
  sizeMetric: MetricKey | null;
}) {
  if (!active || !payload?.length) return null;
  // 趨勢線與散佈點共用同一個 Tooltip；趨勢線的資料點沒有 `player`欄位，
  // 需要挑出真正的散佈點資料，hover 在趨勢線上時才不會整個炸掉。
  const entry = payload.find(
    (p): p is typeof p & { payload: ScatterPoint } =>
      !!p.payload && typeof p.payload === 'object' && 'player' in p.payload,
  );
  if (!entry) return null;
  const point = entry.payload;
  const team = getTeam(point.player.teamCode, point.player.era);

  return (
    <div className="rounded-lg border border-line bg-paper-pure px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
        {team?.flagEmoji}
        {point.player.name[lang]}
        <span className="font-[family-name:var(--font-mono-ticket)] text-[10px] font-normal text-ink-muted">
          {point.player.teamCode} {point.player.era}
        </span>
      </div>
      <dl className="mt-1.5 space-y-0.5 text-[11px] tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{METRICS[xMetric].label[lang]}</dt>
          <dd className="font-bold text-ink">{formatMetricValue(xMetric, point.x)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{METRICS[yMetric].label[lang]}</dt>
          <dd className="font-bold text-ink">{formatMetricValue(yMetric, point.y)}</dd>
        </div>
        {sizeMetric && point.z !== null && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{METRICS[sizeMetric].label[lang]}</dt>
            <dd className="font-bold text-ink">{formatMetricValue(sizeMetric, point.z)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface ScatterPlotStudioProps {
  players: Player[];
  lang: Lang;
  height?: number;
  className?: string;
}

/**
 * 散佈圖分析器 —— 以 `ScatterPlotConfig` 驅動 X/Y 軸、氣泡大小與篩選條件。
 * 只有兩個軸的資料域有交集的球員（例如都來自打擊或都來自守備）才會出現在圖上；
 * 打者指標配投手指標本來就不會有交集，屬於預期行為。
 */
export function ScatterPlotStudio({ players, lang, height = 380, className }: ScatterPlotStudioProps) {
  const [xMetric, setXMetric] = React.useState<MetricKey>('wrcPlus');
  const [yMetric, setYMetric] = React.useState<MetricKey>('uzr');
  const [sizeMetric, setSizeMetric] = React.useState<MetricKey | null>('war');
  const [showTrendLine, setShowTrendLine] = React.useState(false);
  const [highlightSnubs, setHighlightSnubs] = React.useState(true);
  const [filters, setFilters] = React.useState<ScatterPlotConfig['filters']>(DEFAULT_FILTERS);

  const availableEras = React.useMemo(
    () => Array.from(new Set(players.map((p) => p.era))).sort(),
    [players],
  );
  const availableTeams = React.useMemo(() => {
    const seen = new Map<TeamCode, Era>();
    for (const p of players) if (!seen.has(p.teamCode)) seen.set(p.teamCode, p.era);
    return Array.from(seen.entries());
  }, [players]);
  const availablePositions = React.useMemo(
    () => Array.from(new Set(players.flatMap((p) => p.positions))).sort(),
    [players],
  );
  const availableRosterClasses = React.useMemo(
    () => Array.from(new Set(players.map((p) => p.rosterClass))),
    [players],
  );

  const filteredPlayers = React.useMemo(() => filterPlayers(players, filters), [players, filters]);
  const points = React.useMemo(
    () => buildScatterPoints(filteredPlayers, xMetric, yMetric, sizeMetric),
    [filteredPlayers, xMetric, yMetric, sizeMetric],
  );
  const trendEndpoints = React.useMemo(
    () => (showTrendLine ? computeTrendLine(points) : null),
    [showTrendLine, points],
  );

  const hasFilters =
    filters.eras.length > 0 ||
    filters.teamCodes.length > 0 ||
    filters.positions.length > 0 ||
    filters.rosterClasses.length > 0 ||
    filters.minInnings != null ||
    filters.minPlateAppearances != null;

  return (
    <section className={cn('rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4', className)}>
      {/* 軸控制 */}
      <div className="flex flex-wrap items-end gap-3">
        <MetricSelect label={UI.scatter.xAxis} value={xMetric} onChange={(k) => k && setXMetric(k)} lang={lang} />
        <MetricSelect label={UI.scatter.yAxis} value={yMetric} onChange={(k) => k && setYMetric(k)} lang={lang} />
        <MetricSelect
          label={UI.scatter.bubbleSize}
          value={sizeMetric}
          onChange={setSizeMetric}
          lang={lang}
          allowNone
        />

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={showTrendLine}
            onClick={() => setShowTrendLine((v) => !v)}
            className={cn(
              'rounded-full px-3 py-1.5 text-[11px] font-semibold transition',
              showTrendLine ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
            )}
          >
            {UI.scatter.trendLine[lang]}
          </button>
          <button
            type="button"
            aria-pressed={highlightSnubs}
            onClick={() => setHighlightSnubs((v) => !v)}
            className={cn(
              'rounded-full px-3 py-1.5 text-[11px] font-semibold transition',
              highlightSnubs ? 'bg-plum text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
            )}
          >
            {UI.scatter.highlightSnubs[lang]}
          </button>
        </div>
      </div>

      {/* 篩選條件 */}
      <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3 border-y border-dashed border-line py-3">
        <FilterChipGroup
          label={UI.scatter.era}
          lang={lang}
          options={availableEras}
          optionLabel={(v) => String(v)}
          selected={filters.eras}
          onToggle={(v) => setFilters((f) => ({ ...f, eras: toggleInArray(f.eras, v) }))}
        />
        <FilterChipGroup
          label={UI.scatter.team}
          lang={lang}
          options={availableTeams.map(([code]) => code)}
          optionLabel={(code) => {
            const era = availableTeams.find(([c]) => c === code)?.[1];
            const team = era ? getTeam(code, era) : undefined;
            return `${team?.flagEmoji ?? ''} ${code}`.trim();
          }}
          selected={filters.teamCodes}
          onToggle={(v) => setFilters((f) => ({ ...f, teamCodes: toggleInArray(f.teamCodes, v) }))}
        />
        <FilterChipGroup
          label={UI.scatter.position}
          lang={lang}
          options={availablePositions}
          optionLabel={(v) => v}
          selected={filters.positions}
          onToggle={(v) => setFilters((f) => ({ ...f, positions: toggleInArray(f.positions, v) }))}
        />
        <FilterChipGroup
          label={UI.scatter.rosterClass}
          lang={lang}
          options={availableRosterClasses}
          optionLabel={(v) => ROSTER_TIER_LABELS[v][lang]}
          selected={filters.rosterClasses}
          onToggle={(v) =>
            setFilters((f) => ({ ...f, rosterClasses: toggleInArray(f.rosterClasses, v) }))
          }
        />

        <div className="flex gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              {UI.scatter.minInnings[lang]}
            </span>
            <input
              type="number"
              min={0}
              value={filters.minInnings ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minInnings: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              className="w-20 rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs font-semibold text-ink focus:border-navy focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
              {UI.scatter.minPa[lang]}
            </span>
            <input
              type="number"
              min={0}
              value={filters.minPlateAppearances ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPlateAppearances: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              className="w-20 rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs font-semibold text-ink focus:border-navy focus:outline-none"
            />
          </label>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="self-end text-[11px] font-semibold text-ink-muted underline-offset-2 hover:text-plum hover:underline"
          >
            {UI.scatter.reset[lang]}
          </button>
        )}
      </div>

      {/* 圖表 */}
      {points.length === 0 ? (
        <div className="mt-3 flex h-40 items-center justify-center rounded-[var(--radius-pass)] border border-dashed border-line-strong px-6 text-center text-sm text-ink-muted">
          {UI.scatter.noPoints[lang]}
        </div>
      ) : (
        <>
          <div className="mt-3 w-full" style={{ height }}>
            <ResponsiveScatter
              points={points}
              trendEndpoints={trendEndpoints}
              xMetric={xMetric}
              yMetric={yMetric}
              sizeMetric={sizeMetric}
              highlightSnubs={highlightSnubs}
              lang={lang}
            />
          </div>
          <p className="mt-2 text-right text-[11px] text-ink-muted">
            {points.length} {UI.scatter.pointCount[lang]}
          </p>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Recharts 畫布                                                       */
/* ------------------------------------------------------------------ */

function ResponsiveScatter({
  points,
  trendEndpoints,
  xMetric,
  yMetric,
  sizeMetric,
  highlightSnubs,
  lang,
}: {
  points: ScatterPoint[];
  trendEndpoints: [{ x: number; y: number }, { x: number; y: number }] | null;
  xMetric: MetricKey;
  yMetric: MetricKey;
  sizeMetric: MetricKey | null;
  highlightSnubs: boolean;
  lang: Lang;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#e2e6ea" />
        <XAxis
          type="number"
          dataKey="x"
          name={METRICS[xMetric].label[lang]}
          tick={{ fontSize: 10, fill: MUTED }}
          tickFormatter={(v: number) => formatMetricValue(xMetric, v)}
          axisLine={{ stroke: '#e2e6ea' }}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={METRICS[yMetric].label[lang]}
          tick={{ fontSize: 10, fill: MUTED }}
          tickFormatter={(v: number) => formatMetricValue(yMetric, v)}
          axisLine={false}
          tickLine={false}
        />
        {sizeMetric && <ZAxis type="number" dataKey="z" range={[80, 420]} name={METRICS[sizeMetric].label[lang]} />}
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: MUTED }}
          content={<ScatterTooltip lang={lang} xMetric={xMetric} yMetric={yMetric} sizeMetric={sizeMetric} />}
        />

        <Scatter data={points} isAnimationActive={false}>
          {points.map((pt) => {
            const team = getTeam(pt.player.teamCode, pt.player.era);
            const isSnub = highlightSnubs && pt.player.rosterClass === 'SNUB';
            return (
              <Cell
                key={pt.player.id}
                fill={team?.colorPrimary ?? NAVY}
                fillOpacity={0.82}
                stroke={isSnub ? PLUM : '#ffffff'}
                strokeWidth={isSnub ? 3 : 1}
              />
            );
          })}
        </Scatter>

        {trendEndpoints && (
          <Line
            data={trendEndpoints}
            dataKey="y"
            stroke={MUTED}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            legendType="none"
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
