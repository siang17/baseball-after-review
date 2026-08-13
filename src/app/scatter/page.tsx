'use client';

import { METRICS, METRIC_KEYS } from '@/lib/constants';
import { useAppStore } from '@/store/useAppStore';

/**
 * 散佈圖分析器 (Scatter Plot Studio) —— 版面骨架。
 * TODO: 接上 Recharts ScatterChart，以 ScatterPlotConfig 驅動 X/Y/氣泡大小與篩選。
 */
export default function ScatterPage() {
  const lang = useAppStore((s) => s.lang);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-navy">
          {lang === 'zh' ? '散佈圖分析器' : 'Scatter Plot Studio'}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {lang === 'zh'
            ? '自訂 X / Y 軸，例如 UZR vs. 出勤率、揮空率 vs. 離壘速度、用球數 vs. 球速下滑率。'
            : 'Pick any X/Y pair — UZR vs. attendance, whiff% vs. sprint speed, pitch count vs. velocity decline.'}
        </p>
      </header>

      <div className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {lang === 'zh' ? '可用指標' : 'Available metrics'}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {METRIC_KEYS.map((key) => {
            const metric = METRICS[key];
            return (
              <li key={key} className="rounded-lg border border-line px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{metric.label[lang]}</span>
                  <span className="font-[family-name:var(--font-mono-ticket)] text-[10px] uppercase text-ink-muted">
                    {metric.domain}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                  {metric.description[lang]}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
