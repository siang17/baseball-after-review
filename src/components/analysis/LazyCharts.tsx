'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type { ScatterPlotStudioProps } from './ScatterPlotStudio';
import type { WinProbabilityChartProps } from './WinProbabilityChart';

/* ------------------------------------------------------------------ */
/* 延後載入圖表                                                        */
/*                                                                     */
/* Recharts（含 d3-scale/d3-shape 等相依）是這個站台最大的單一相依，    */
/* 但只有勝率曲線與散佈圖分析器用得到，而兩者都在頁面中段以下。         */
/* 改成 dynamic import 之後，/replay、/case-study、/scatter 的首次      */
/* 載入不再需要先下載整包圖表程式碼；外層 div 先把版位高度佔好，        */
/* 圖表載入完成時不會造成版面位移 (CLS)。                              */
/* ------------------------------------------------------------------ */

function ChartPlaceholder({ height, className }: { height: number; className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-pass)] border border-dashed border-line-strong bg-paper-sunken',
        className,
      )}
      style={{ height }}
      aria-hidden
    />
  );
}

const WinProbabilityChartImpl = dynamic(
  () => import('./WinProbabilityChart').then((m) => m.WinProbabilityChart),
  { ssr: false, loading: () => null },
);

/** 與 `WinProbabilityChart` 介面相同，但圖表本體延後載入。 */
export function WinProbabilityChart(props: WinProbabilityChartProps) {
  const height = props.height ?? 300;
  return (
    <div style={{ minHeight: height }}>
      <WinProbabilityChartImpl {...props} />
    </div>
  );
}

const ScatterPlotStudioImpl = dynamic(
  () => import('./ScatterPlotStudio').then((m) => m.ScatterPlotStudio),
  { ssr: false, loading: () => <ChartPlaceholder height={380} /> },
);

/** 與 `ScatterPlotStudio` 介面相同，但整個分析器延後載入。 */
export function ScatterPlotStudio(props: ScatterPlotStudioProps) {
  return <ScatterPlotStudioImpl {...props} />;
}
