'use client';

import { ZONE } from '@/lib/simulation/pitchSynthesizer';
import { cn } from '@/lib/utils';
import type { Lang, PitchData, PitchResult } from '@/types/baseball';

const VIEW_W = 200;
const VIEW_H = 240;
const X_MIN = -2.5;
const X_MAX = 2.5;
const Z_MIN = 0;
const Z_MAX = 5.5;

function mapX(x: number): number {
  return 20 + ((x - X_MIN) / (X_MAX - X_MIN)) * (VIEW_W - 40);
}

function mapZ(z: number): number {
  return VIEW_H - 20 - ((z - Z_MIN) / (Z_MAX - Z_MIN)) * (VIEW_H - 40);
}

const RESULT_COLOR: Record<PitchResult, string> = {
  BALL: 'rgba(255,255,255,0.35)',
  CALLED_STRIKE: '#ffb300',
  SWINGING_STRIKE: '#ff6b35',
  FOUL: 'rgba(255,255,255,0.65)',
  IN_PLAY_OUT: '#7b8a9c',
  IN_PLAY_HIT: '#2ecc71',
  HBP: '#d9381e',
  PITCH_CLOCK_VIOLATION: '#d9381e',
};

const RESULT_LABEL: Record<PitchResult, { zh: string; en: string }> = {
  BALL: { zh: '壞球', en: 'Ball' },
  CALLED_STRIKE: { zh: '好球', en: 'Called strike' },
  SWINGING_STRIKE: { zh: '揮空', en: 'Whiff' },
  FOUL: { zh: '界外', en: 'Foul' },
  IN_PLAY_OUT: { zh: '出局', en: 'Out' },
  IN_PLAY_HIT: { zh: '安打', en: 'Hit' },
  HBP: { zh: '觸身', en: 'HBP' },
  PITCH_CLOCK_VIOLATION: { zh: '違規', en: 'Violation' },
};

export interface StrikeZoneGridProps {
  /** 同一個打席內的逐球資料，依球序排列。 */
  pitches: PitchData[];
  lang: Lang;
  className?: string;
}

/**
 * 好球帶九宮格 —— 深色讀秒面板風格，把一個打席的逐球落點畫在好球帶上，
 * 每球標號、球種、球速、好壞球判決都列在下方清單。
 */
export function StrikeZoneGrid({ pitches, lang, className }: StrikeZoneGridProps) {
  if (pitches.length === 0) {
    return (
      <div className={cn('flex h-40 items-center justify-center rounded-[var(--radius-pass)] bg-board text-xs text-board-text/60', className)}>
        {lang === 'zh' ? '尚無逐球資料。' : 'No pitch data yet.'}
      </div>
    );
  }

  const zoneLeft = mapX(ZONE.xMin);
  const zoneRight = mapX(ZONE.xMax);
  const zoneTop = mapZ(ZONE.zMax);
  const zoneBottom = mapZ(ZONE.zMin);
  const thirdW = (zoneRight - zoneLeft) / 3;
  const thirdH = (zoneBottom - zoneTop) / 3;

  return (
    <section className={cn('rounded-[var(--radius-pass)] bg-board p-3', className)}>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-board-text/70">
        {lang === 'zh' ? '好球帶九宮格' : 'Strike Zone Grid'}
      </h4>

      <div className="flex flex-wrap items-start gap-4">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-56 w-48 shrink-0" aria-hidden="true">
          {/* 好球帶九宮格 */}
          <rect x={zoneLeft} y={zoneTop} width={zoneRight - zoneLeft} height={zoneBottom - zoneTop} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
          {[1, 2].map((i) => (
            <line key={`v${i}`} x1={zoneLeft + thirdW * i} y1={zoneTop} x2={zoneLeft + thirdW * i} y2={zoneBottom} stroke="rgba(255,255,255,0.25)" />
          ))}
          {[1, 2].map((i) => (
            <line key={`h${i}`} x1={zoneLeft} y1={zoneTop + thirdH * i} x2={zoneRight} y2={zoneTop + thirdH * i} stroke="rgba(255,255,255,0.25)" />
          ))}

          {/* 逐球落點 */}
          {pitches.map((p, i) => {
            const cx = mapX(p.location.x);
            const cy = mapZ(p.location.z);
            const isLast = i === pitches.length - 1;
            return (
              <g key={p.id}>
                <circle cx={cx} cy={cy} r={isLast ? 9 : 7} fill={RESULT_COLOR[p.result]} fillOpacity={isLast ? 1 : 0.55} stroke="#071b33" strokeWidth={1} />
                <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#071b33">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        <ul className="min-w-[160px] flex-1 space-y-1 font-[family-name:var(--font-mono-ticket)] text-[11px] text-board-text">
          {pitches.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: RESULT_COLOR[p.result] }} />
                {i + 1}. {p.pitchType}
              </span>
              <span className="tabular-nums opacity-80">{p.velocity.toFixed(1)} mph</span>
              <span className="tabular-nums" style={{ color: RESULT_COLOR[p.result] }}>
                {RESULT_LABEL[p.result][lang]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
