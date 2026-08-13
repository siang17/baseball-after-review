'use client';

import { cn } from '@/lib/utils';
import type { Bilingual, Lang } from '@/types/baseball';

export type BaggageTone = 'neutral' | 'good' | 'warn' | 'danger';

const TONE_STYLES: Record<BaggageTone, string> = {
  neutral: 'border-line-strong bg-paper-pure text-ink',
  good: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warn: 'border-alert bg-alert-soft text-alert',
  danger: 'border-plum bg-[#fdecea] text-plum',
};

interface BaggageTagProps {
  label: Bilingual;
  value: string | number;
  unit?: string;
  /** 副標，例如聯盟平均或百分位。 */
  footnote?: Bilingual;
  tone?: BaggageTone;
  lang: Lang;
  className?: string;
}

/**
 * 行李吊牌 (Baggage Tag) —— 用球數、體能極限與 UZR 等單項指標卡片。
 * 造型：上方有吊環打孔 + 撕票齒孔，下緣為條碼帶。
 */
export function BaggageTag({
  label,
  value,
  unit,
  footnote,
  tone = 'neutral',
  lang,
  className,
}: BaggageTagProps) {
  return (
    <div
      className={cn(
        'relative flex min-w-[128px] flex-col rounded-md border border-dashed px-3 pb-2 pt-4',
        TONE_STYLES[tone],
        className,
      )}
    >
      {/* 吊環打孔 */}
      <span className="absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-paper ring-1 ring-line-strong" />

      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
        {label[lang]}
      </span>

      <span className="mt-0.5 font-[family-name:var(--font-mono-ticket)] text-2xl leading-none font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-medium opacity-60">{unit}</span>}
      </span>

      {footnote && (
        <span className="mt-1 text-[10px] leading-tight opacity-60">{footnote[lang]}</span>
      )}

      {/* 下緣條碼帶 */}
      <span className="mt-2 block h-3 w-full [background-image:repeating-linear-gradient(to_right,currentColor_0_1px,transparent_1px_4px)] opacity-30" />
    </div>
  );
}
