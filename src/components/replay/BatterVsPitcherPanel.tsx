import { FileWarning } from 'lucide-react';
import { syntheticBvp } from '@/lib/simulation/syntheticBvp';
import { bi } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Lang, Player } from '@/types/baseball';

export interface BatterVsPitcherPanelProps {
  batter: Player;
  pitcher: Player;
  lang: Lang;
  className?: string;
}

/**
 * 對戰投手數據卡 —— 示範資料球員沒有真實歷史對戰紀錄，
 * 用決定性種子產生一組小樣本示範數據，清楚標示非真實紀錄。
 */
export function BatterVsPitcherPanel({ batter, pitcher, lang, className }: BatterVsPitcherPanelProps) {
  const bvp = syntheticBvp(batter.id, pitcher.id);

  return (
    <section className={cn('rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3', className)}>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
        {lang === 'zh' ? '對戰投手數據' : 'Batter vs. Pitcher'}
      </h4>
      <p className="mt-1 text-xs text-ink">
        {batter.name[lang]} <span className="text-ink-muted">vs.</span> {pitcher.name[lang]}
      </p>

      <dl className="mt-2 grid grid-cols-4 gap-2 text-center">
        {[
          { label: bi('打席', 'PA'), value: bvp.pa },
          { label: bi('打數', 'AB'), value: bvp.ab },
          { label: bi('安打', 'H'), value: bvp.h },
          { label: bi('全壘打', 'HR'), value: bvp.hr },
        ].map((row) => (
          <div key={row.label.en} className="rounded-lg bg-paper-sunken py-1.5">
            <dt className="text-[9px] uppercase tracking-widest text-ink-muted">{row.label[lang]}</dt>
            <dd className="font-[family-name:var(--font-mono-ticket)] text-base font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-ink-muted">{lang === 'zh' ? '打擊率' : 'AVG'}</span>
        <span className="font-[family-name:var(--font-mono-ticket)] font-bold text-ink">
          {bvp.avg !== null ? bvp.avg.toFixed(3) : '—'}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted">
        <FileWarning size={11} />
        {lang === 'zh' ? '示範用途，非真實對戰紀錄。' : 'Illustrative sample only — not a real head-to-head record.'}
      </p>
    </section>
  );
}
