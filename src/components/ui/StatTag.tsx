import { cn } from '@/lib/utils';
import type { Bilingual, Lang } from '@/types/baseball';

export type StatTagTone = 'neutral' | 'good' | 'warn' | 'danger';

const TONE_STYLES: Record<StatTagTone, string> = {
  neutral: 'bg-paper-sunken text-ink',
  good: 'bg-emerald-50 text-emerald-900',
  warn: 'bg-alert-soft text-alert',
  danger: 'bg-[#fdecea] text-plum',
};

const TONE_BAR: Record<StatTagTone, string> = {
  neutral: 'bg-line-strong',
  good: 'bg-emerald-500',
  warn: 'bg-alert',
  danger: 'bg-plum',
};

interface StatTagProps {
  label: Bilingual;
  value: string | number;
  unit?: string;
  /** 副標，例如聯盟平均或百分位。 */
  footnote?: Bilingual;
  tone?: StatTagTone;
  lang: Lang;
  className?: string;
}

/** 單項數據小卡（打擊率、UZR、用球數等），扁平色條 + 大數字的 stat tile 樣式。 */
export function StatTag({ label, value, unit, footnote, tone = 'neutral', lang, className }: StatTagProps) {
  return (
    <div className={cn('relative flex min-w-[128px] flex-col overflow-hidden rounded-lg px-3 py-2', TONE_STYLES[tone], className)}>
      <span className={cn('absolute inset-y-0 left-0 w-1', TONE_BAR[tone])} />

      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{label[lang]}</span>

      <span className="mt-0.5 font-[family-name:var(--font-mono-ticket)] text-2xl leading-none font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-medium opacity-60">{unit}</span>}
      </span>

      {footnote && <span className="mt-1 text-[10px] leading-tight opacity-60">{footnote[lang]}</span>}
    </div>
  );
}
