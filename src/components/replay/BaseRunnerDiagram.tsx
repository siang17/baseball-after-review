'use client';

import { cn } from '@/lib/utils';
import type { BaseState, Lang, Player } from '@/types/baseball';

export interface BaseRunnerDiagramProps {
  bases: BaseState;
  resolvePlayer: (id: string) => Player | null;
  lang: Lang;
  className?: string;
}

const HOME = { x: 100, y: 178 };
const FIRST = { x: 168, y: 110 };
const SECOND = { x: 100, y: 42 };
const THIRD = { x: 32, y: 110 };

function BaseMarker({
  point,
  occupied,
  label,
  name,
}: {
  point: { x: number; y: number };
  occupied: boolean;
  label: string;
  name: string | null;
}) {
  return (
    <g>
      <rect
        x={point.x - 11}
        y={point.y - 11}
        width={22}
        height={22}
        transform={`rotate(45 ${point.x} ${point.y})`}
        fill={occupied ? '#ffb300' : 'rgba(255,255,255,0.08)'}
        stroke={occupied ? '#ffb300' : 'rgba(255,255,255,0.4)'}
        strokeWidth={1.5}
      />
      <text x={point.x} y={point.y - 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)" fontWeight={700}>
        {label}
      </text>
      {occupied && name && (
        <text x={point.x} y={point.y + 28} textAnchor="middle" fontSize={9} fill="#f2f6fa" fontWeight={700}>
          {name}
        </text>
      )}
    </g>
  );
}

/** 壘包示意圖 —— 深色讀秒面板風格的鑽石圖，標示目前誰在壘上。 */
export function BaseRunnerDiagram({ bases, resolvePlayer, lang, className }: BaseRunnerDiagramProps) {
  const runnerName = (id: string | null) => {
    if (!id) return null;
    const player = resolvePlayer(id);
    if (!player) return id;
    // 姓名太長時只留兩個字方便塞進菱形圖旁邊。
    const full = player.name[lang];
    return full.length > 6 ? `${full.slice(0, 5)}…` : full;
  };

  return (
    <section className={cn('rounded-[var(--radius-pass)] bg-board p-3', className)}>
      <h4 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-board-text/70">
        {lang === 'zh' ? '壘包狀況' : 'Baserunners'}
      </h4>
      <svg viewBox="0 0 200 200" className="mx-auto h-44 w-44" aria-hidden="true">
        <path
          d={`M ${HOME.x} ${HOME.y} L ${FIRST.x} ${FIRST.y} L ${SECOND.x} ${SECOND.y} L ${THIRD.x} ${THIRD.y} Z`}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.5}
        />
        <BaseMarker point={SECOND} occupied={Boolean(bases[1])} label="2B" name={runnerName(bases[1])} />
        <BaseMarker point={THIRD} occupied={Boolean(bases[2])} label="3B" name={runnerName(bases[2])} />
        <BaseMarker point={FIRST} occupied={Boolean(bases[0])} label="1B" name={runnerName(bases[0])} />
        <rect x={HOME.x - 8} y={HOME.y - 8} width={16} height={16} transform={`rotate(45 ${HOME.x} ${HOME.y})`} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" />
      </svg>
    </section>
  );
}
