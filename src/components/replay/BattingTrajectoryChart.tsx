'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Lang, PitchData } from '@/types/baseball';
import type { PlateAppearanceEvent } from '@/lib/simulation/gameSim';

const VIEW_W = 300;
const VIEW_H = 280;
const HOME = { x: 150, y: 268 };

/** 落點分區 → 方向角（度，0 = 正中外野，負值偏左、正值偏右）。 */
const ZONE_ANGLE: Record<string, number> = {
  'LF-LINE': -45,
  'LC-GAP': -22,
  CF: 0,
  'RC-GAP': 22,
  'RF-LINE': 45,
  'INFIELD-L': -28,
  'INFIELD-M': 0,
  'INFIELD-R': 28,
};

function landingPoint(battedBall: NonNullable<PitchData['battedBall']>): { x: number; y: number } {
  const angleDeg = ZONE_ANGLE[battedBall.zone ?? 'CF'] ?? 0;
  const angleRad = (angleDeg * Math.PI) / 180;
  const isInfield = (battedBall.zone ?? '').startsWith('INFIELD');
  const exitVelo = battedBall.exitVelocity ?? 80;
  const launchAngle = battedBall.launchAngle ?? 15;
  const rawDistance = exitVelo * 2.1 + launchAngle * 2.6;
  const distance = isInfield ? Math.min(70, rawDistance * 0.35) : Math.min(230, Math.max(90, rawDistance));

  return {
    x: HOME.x + distance * Math.sin(angleRad),
    y: HOME.y - distance * Math.cos(angleRad),
  };
}

export interface BattingTrajectoryChartProps {
  /** 該場所有逐球資料（未篩選）；元件內部會依 `batterId` 篩選出安打。 */
  pitches: PitchData[];
  outcomeByPitchId: Record<string, PlateAppearanceEvent['outcome']>;
  batterId: string;
  lang: Lang;
  className?: string;
}

/**
 * 打擊軌跡圖 —— 從本壘往外野的簡化拋物線；安打標籤用紅字 "hit"，
 * 全壘打標籤用黃字 "homerun"（比照使用者指定的顏色規格）。
 */
export function BattingTrajectoryChart({ pitches, outcomeByPitchId, batterId, lang, className }: BattingTrajectoryChartProps) {
  const hits = React.useMemo(
    () => pitches.filter((p) => p.batterId === batterId && p.result === 'IN_PLAY_HIT' && p.battedBall),
    [pitches, batterId],
  );

  if (hits.length === 0) {
    return (
      <div className={cn('flex h-40 items-center justify-center rounded-[var(--radius-pass)] border border-dashed border-line-strong text-xs text-ink-muted', className)}>
        {lang === 'zh' ? '這位打者本場尚無安打。' : 'No hits for this batter yet.'}
      </div>
    );
  }

  return (
    <section className={cn('rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3', className)}>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
        {lang === 'zh' ? '打擊軌跡圖' : 'Batting Trajectory'}
      </h4>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="mx-auto h-64 w-full max-w-[300px]" aria-hidden="true">
        {/* 外野扇形示意 */}
        <path
          d={`M ${HOME.x - 235} ${HOME.y + 30} L ${HOME.x} ${HOME.y - 245} L ${HOME.x + 235} ${HOME.y + 30}`}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth={1}
        />
        <circle cx={HOME.x} cy={HOME.y} r={4} fill="#0b2545" />

        {hits.map((pitch, i) => {
          const outcome = outcomeByPitchId[pitch.id];
          const isHomerun = outcome === 'HR';
          const point = landingPoint(pitch.battedBall!);
          const color = isHomerun ? '#ffb300' : '#d9381e';
          const label = isHomerun ? 'homerun' : 'hit';
          return (
            <g key={pitch.id}>
              <path
                d={`M ${HOME.x} ${HOME.y} Q ${(HOME.x + point.x) / 2} ${Math.min(HOME.y, point.y) - 40} ${point.x} ${point.y}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.85}
              />
              <circle cx={point.x} cy={point.y} r={5} fill={color} />
              <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>
                {label}
              </text>
              <text x={point.x} y={point.y + 18} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
                #{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
