import { ArrowLeftRight } from 'lucide-react';
import { buildBatterProfile, buildPitcherProfile } from '@/lib/simulation/ratings';
import { bi } from '@/lib/i18n';
import { cn, formatSigned } from '@/lib/utils';
import type { Bilingual, Era, Lang, Player } from '@/types/baseball';

interface DeltaRow {
  label: Bilingual;
  snubValue: number;
  replacedValue: number;
  higherIsBetter: boolean;
}

/** 雙向長條：正負值分置中線兩側，比照 DefenseArgumentPanel 的 ComponentBars 手法。 */
function DeltaBar({ row, lang }: { row: DeltaRow; lang: Lang }) {
  const delta = row.snubValue - row.replacedValue;
  const scale = Math.max(Math.abs(delta), 0.1);
  const width = Math.min(50, (Math.abs(delta) / scale) * 50);
  const favoursSnub = row.higherIsBetter ? delta > 0 : delta < 0;

  return (
    <li className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[10px] font-semibold text-ink-muted">{row.label[lang]}</span>
      <span className="relative h-3 flex-1 rounded-sm bg-paper-sunken">
        <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
        <span
          className="absolute inset-y-0 rounded-sm"
          style={{
            backgroundColor: favoursSnub ? '#2ecc71' : '#d9381e',
            width: `${width}%`,
            left: delta >= 0 ? '50%' : `${50 - width}%`,
          }}
        />
      </span>
      <span className="w-14 shrink-0 text-right font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold tabular-nums text-ink">
        {formatSigned(delta, 2)}
      </span>
    </li>
  );
}

export interface SnubImpactPanelProps {
  snub: Player;
  replaced: Player;
  era: Era;
  lang: Lang;
  className?: string;
}

/**
 * 遺珠代入評估卡 —— 把遺珠球員與被換下的先發球員做能力指數比較
 * （攻擊指數／壓制指數／UZR），沿用 `DefenseArgumentPanel` 的雙向長條圖手法。
 * 真正的比賽結果差異則反映在換人後重新產生的逐球復盤裡。
 */
export function SnubImpactPanel({ snub, replaced, era, lang, className }: SnubImpactPanelProps) {
  const rows: DeltaRow[] = [];

  const isPitcherComparison = snub.pitching !== null || replaced.pitching !== null;

  if (isPitcherComparison) {
    const snubProfile = snub.pitching ? buildPitcherProfile(snub, { applyEraAdjustment: false, era }) : null;
    const replacedProfile = replaced.pitching ? buildPitcherProfile(replaced, { applyEraAdjustment: false, era }) : null;
    if (snubProfile && replacedProfile) {
      rows.push({
        label: bi('壓制指數', 'Suppression'),
        snubValue: snubProfile.suppressionIndex,
        replacedValue: replacedProfile.suppressionIndex,
        higherIsBetter: true,
      });
      rows.push({
        label: bi('三振傾向', 'Strikeout rate'),
        snubValue: snubProfile.strikeoutIndex,
        replacedValue: replacedProfile.strikeoutIndex,
        higherIsBetter: true,
      });
    }
  } else {
    const snubProfile = buildBatterProfile(snub, { applyEraAdjustment: false, era });
    const replacedProfile = buildBatterProfile(replaced, { applyEraAdjustment: false, era });
    rows.push({
      label: bi('攻擊指數', 'Offense'),
      snubValue: snubProfile.offenseIndex,
      replacedValue: replacedProfile.offenseIndex,
      higherIsBetter: true,
    });
    rows.push({
      label: bi('長打指數', 'Power'),
      snubValue: snubProfile.powerIndex,
      replacedValue: replacedProfile.powerIndex,
      higherIsBetter: true,
    });
  }

  if (snub.fielding && replaced.fielding) {
    rows.push({
      label: bi('UZR/150', 'UZR/150'),
      snubValue: snub.fielding.uzr150 ?? 0,
      replacedValue: replaced.fielding.uzr150 ?? 0,
      higherIsBetter: true,
    });
  }

  return (
    <section className={cn('rounded-[var(--radius-pass)] border border-dashed border-alert/50 bg-paper-pure p-3', className)}>
      <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-alert">
        <ArrowLeftRight size={12} />
        {lang === 'zh' ? '遺珠代入評估' : 'Snub Swap Impact'}
      </h4>
      <p className="mt-1 text-xs text-ink">
        <span className="font-bold text-alert">{snub.name[lang]}</span>
        <span className="text-ink-muted"> {lang === 'zh' ? '換下' : 'replaces'} </span>
        <span className="font-bold text-ink-soft">{replaced.name[lang]}</span>
      </p>

      <ul className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <DeltaBar key={row.label.en} row={row} lang={lang} />
        ))}
      </ul>

      <p className="mt-2 text-[10px] leading-relaxed text-ink-muted">
        {lang === 'zh'
          ? '能力指數差異僅供參考；實際比賽結果差異請看換人後重新產生的逐球復盤。'
          : 'Index deltas are indicative only — the real impact shows up in the regenerated pitch-by-pitch review after the swap.'}
      </p>
    </section>
  );
}
