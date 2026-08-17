import { METRICS } from './constants';
import type { MetricKey, Player, ScatterPlotConfig } from '@/types/baseball';

/**
 * 每個指標鍵對應到 Player 底下的實際欄位。
 * 與 `MetricDefinition.domain` 對齊，但用顯式存取子避免用字串索引繞過型別檢查。
 */
const METRIC_ACCESSORS: Record<MetricKey, (p: Player) => number | null> = {
  uzr: (p) => p.fielding?.uzr ?? null,
  uzr150: (p) => p.fielding?.uzr150 ?? null,
  drs: (p) => p.fielding?.drs ?? null,
  oaa: (p) => p.fielding?.oaa ?? null,
  attendanceRate: (p) => p.fielding?.attendanceRate ?? null,
  war: (p) => p.batting?.war ?? null,
  wrcPlus: (p) => p.batting?.wrcPlus ?? null,
  opsPlus: (p) => p.batting?.opsPlus ?? null,
  ops: (p) => p.batting?.ops ?? null,
  obp: (p) => p.batting?.obp ?? null,
  slg: (p) => p.batting?.slg ?? null,
  avg: (p) => p.batting?.avg ?? null,
  whiffPct: (p) => p.batting?.whiffPct ?? null,
  exitVelocity: (p) => p.batting?.exitVelocity ?? null,
  sprintSpeed: (p) => p.batting?.sprintSpeed ?? null,
  era: (p) => p.pitching?.era ?? null,
  eraPlus: (p) => p.pitching?.eraPlus ?? null,
  fip: (p) => p.pitching?.fip ?? null,
  whip: (p) => p.pitching?.whip ?? null,
  k9: (p) => p.pitching?.k9 ?? null,
  bb9: (p) => p.pitching?.bb9 ?? null,
  avgVelocity: (p) => p.pitching?.avgVelocity ?? null,
  velocityDeclinePer25: (p) => p.pitching?.velocityDeclinePer25 ?? null,
  // 球季累計數據沒有「單場用球數」這個維度，僅存在於單場模擬 HUD。
  pitchCount: () => null,
};

export function getMetricValue(player: Player, key: MetricKey): number | null {
  return METRIC_ACCESSORS[key](player);
}

/** 依指標的數值型態決定顯示位數／百分比格式。 */
export function formatMetricValue(key: MetricKey, value: number): string {
  const metric = METRICS[key];
  if (metric.unit === '%') return `${(value * 100).toFixed(1)}%`;
  if (['avg', 'obp', 'slg', 'ops'].includes(key)) return value.toFixed(3);
  if (['wrcPlus', 'opsPlus', 'eraPlus', 'war'].includes(key)) return value.toFixed(1);
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export type ScatterFilters = ScatterPlotConfig['filters'];

export function filterPlayers(players: Player[], filters: ScatterFilters): Player[] {
  return players.filter((p) => {
    if (filters.eras.length && !filters.eras.includes(p.era)) return false;
    if (filters.teamCodes.length && !filters.teamCodes.includes(p.teamCode)) return false;
    if (filters.positions.length && !p.positions.some((pos) => filters.positions.includes(pos))) return false;
    if (filters.rosterClasses.length && !filters.rosterClasses.includes(p.rosterClass)) return false;
    if (filters.minInnings != null && (p.fielding?.innings ?? 0) < filters.minInnings) return false;
    if (filters.minPlateAppearances != null && (p.batting?.pa ?? 0) < filters.minPlateAppearances) return false;
    return true;
  });
}

export interface ScatterPoint {
  player: Player;
  x: number;
  y: number;
  /** 氣泡大小指標值；沒有選 sizeMetric 或該球員無資料時為 null（畫圖時套用預設大小）。 */
  z: number | null;
}

export function buildScatterPoints(
  players: Player[],
  xMetric: MetricKey,
  yMetric: MetricKey,
  sizeMetric: MetricKey | null,
): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  for (const player of players) {
    const x = getMetricValue(player, xMetric);
    const y = getMetricValue(player, yMetric);
    if (x === null || y === null) continue;
    const z = sizeMetric ? getMetricValue(player, sizeMetric) : null;
    points.push({ player, x, y, z });
  }
  return points;
}

/** 最小平方法線性迴歸，回傳兩端點供畫趨勢線；不足兩點時回傳 null。 */
export function computeTrendLine(
  points: ScatterPoint[],
): [{ x: number; y: number }, { x: number; y: number }] | null {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumXX = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
}
