'use client';

import * as React from 'react';
import { ZONE } from '@/lib/simulation/pitchSynthesizer';
import { cn } from '@/lib/utils';
import type { Lang, PitchData } from '@/types/baseball';

const VIEW_W = 200;
const VIEW_H = 220;
const X_MIN = ZONE.xMin - 0.6;
const X_MAX = ZONE.xMax + 0.6;
const Z_MIN = ZONE.zMin - 0.6;
const Z_MAX = ZONE.zMax + 0.6;
const GRID = 5;

function mapX(x: number): number {
  return 10 + ((x - X_MIN) / (X_MAX - X_MIN)) * (VIEW_W - 20);
}

function mapZ(z: number): number {
  return VIEW_H - 10 - ((z - Z_MIN) / (Z_MAX - Z_MIN)) * (VIEW_H - 20);
}

export interface BattingHeatZoneProps {
  /** 該場所有逐球資料（未篩選）；元件內部會依 `batterId` 篩選。 */
  pitches: PitchData[];
  batterId: string;
  lang: Lang;
  className?: string;
}

/** 打擊熱區 —— 把該打者本場所有進壘點分桶成 5×5 網格，用色塊濃淡呈現。 */
export function BattingHeatZone({ pitches, batterId, lang, className }: BattingHeatZoneProps) {
  const batterPitches = React.useMemo(() => pitches.filter((p) => p.batterId === batterId), [pitches, batterId]);

  const grid = React.useMemo(() => {
    const cells = Array.from({ length: GRID * GRID }, () => 0);
    for (const p of batterPitches) {
      const col = Math.min(GRID - 1, Math.max(0, Math.floor(((p.location.x - X_MIN) / (X_MAX - X_MIN)) * GRID)));
      const row = Math.min(GRID - 1, Math.max(0, Math.floor(((Z_MAX - p.location.z) / (Z_MAX - Z_MIN)) * GRID)));
      cells[row * GRID + col] += 1;
    }
    return cells;
  }, [batterPitches]);

  const maxCount = Math.max(1, ...grid);
  const cellW = (VIEW_W - 20) / GRID;
  const cellH = (VIEW_H - 20) / GRID;

  const zoneLeft = mapX(ZONE.xMin);
  const zoneRight = mapX(ZONE.xMax);
  const zoneTop = mapZ(ZONE.zMax);
  const zoneBottom = mapZ(ZONE.zMin);

  if (batterPitches.length === 0) {
    return (
      <div className={cn('flex h-40 items-center justify-center rounded-[var(--radius-pass)] border border-dashed border-line-strong text-xs text-ink-muted', className)}>
        {lang === 'zh' ? '這位打者本場尚無進壘資料。' : 'No pitch data for this batter yet.'}
      </div>
    );
  }

  return (
    <section className={cn('rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3', className)}>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
        {lang === 'zh' ? '打擊熱區' : 'Batting Heat Zone'}
      </h4>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="mx-auto h-52 w-48" aria-hidden="true">
        {grid.map((count, i) => {
          const row = Math.floor(i / GRID);
          const col = i % GRID;
          const opacity = count === 0 ? 0 : 0.15 + 0.75 * (count / maxCount);
          return (
            <rect
              key={i}
              x={10 + col * cellW}
              y={10 + row * cellH}
              width={cellW}
              height={cellH}
              fill="#d9381e"
              fillOpacity={opacity}
            />
          );
        })}
        <rect x={zoneLeft} y={zoneTop} width={zoneRight - zoneLeft} height={zoneBottom - zoneTop} fill="none" stroke="#0b2545" strokeWidth={1.5} />
      </svg>
      <p className="mt-1 text-center text-[10px] text-ink-muted">
        {lang === 'zh' ? `依 ${batterPitches.length} 顆進壘球統計` : `Based on ${batterPitches.length} pitches`}
      </p>
    </section>
  );
}
