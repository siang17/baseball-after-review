'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Gauge, PlayCircle, Sparkles } from 'lucide-react';
import { localePath } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useMatchupStore } from '@/store/useMatchupStore';
import { useReplayStore } from '@/store/useReplayStore';
import type { Lang } from '@/types/baseball';

/**
 * 專題頁唯一需要互動的區塊：兩顆把使用者導到 /replay 或 /matchup
 * 並預先設定好情境的 CTA。拆成獨立的 client island 之後，
 * 專題頁本體（大量叙事文字與分析面板）就能維持 Server Component。
 */
export function CaseStudyActions({ lang }: { lang: Lang }) {
  const router = useRouter();
  const setManagerEnabled = useReplayStore((s) => s.setManagerEnabled);
  const setManagerSide = useReplayStore((s) => s.setManagerSide);
  const setEraMode = useMatchupStore((s) => s.setEraMode);
  const setTeam = useMatchupStore((s) => s.setTeam);
  const setStep = useMatchupStore((s) => s.setStep);

  /**
   * 以客隊（VEN）總教練身分跳到 /replay，針對 2026 JPN vs VEN 真實名單即時
   * 產生一場逐球復盤；/replay 會在載入時自動選好這場比賽、產生復盤，
   * 並跳到第一個調度決策點。
   */
  const startManagerMode = () => {
    setManagerEnabled(true);
    setManagerSide('AWAY');
    router.push(
      `${localePath(lang, '/replay')}?game=2026-wbc-03-14-jpn-ven&autoDecision=1`,
    );
  };

  /** 預先設定 2024 委內瑞拉隊 vs. 2026 日本隊的跨年代對決——問「兩年前的委內瑞拉打得過這支日本隊嗎」。 */
  const startCrossEraMatchup = () => {
    setEraMode('2024vs2026');
    setTeam('away', 'VEN');
    setTeam('home', 'JPN');
    setStep('CONFIRM');
    router.push(localePath(lang, '/matchup'));
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button
        type="button"
        onClick={startManagerMode}
        className={cn(
          'group rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4 text-left transition',
          'hover:-translate-y-0.5 hover:border-plum hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]',
        )}
      >
        <Gauge size={18} className="text-plum" />
        <h3 className="mt-2 text-base font-bold text-ink">
          {lang === 'zh' ? '以客隊總教練身分重做決定' : 'Retake the call as Venezuela'}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {lang === 'zh'
            ? '即時產生一場真實先發打線的逐球復盤，跳到全場最高槓桿的調度決策點，送出後對比歷史選擇與 AI 最佳解。'
            : 'Generates a fresh pitch-by-pitch review from the real starting lineups, jumps to the highest-leverage decision point, then compares your call against the historical and optimal ones.'}
        </p>
        <span className="mt-3 flex items-center gap-1 text-xs font-bold text-plum">
          {lang === 'zh' ? '開啟總教練模式' : 'Open manager mode'}
          <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </span>
      </button>

      <button
        type="button"
        onClick={startCrossEraMatchup}
        className={cn(
          'group rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4 text-left transition',
          'hover:-translate-y-0.5 hover:border-navy hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]',
        )}
      >
        <Sparkles size={18} className="text-navy" />
        <h3 className="mt-2 text-base font-bold text-ink">
          {lang === 'zh'
            ? '跨年代對決：2024 委內瑞拉隊 vs. 2026 日本隊'
            : 'Cross-era: 2024 Venezuela vs. 2026 Japan'}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {lang === 'zh'
            ? '還沒拿下世界冠軍的 2024 委內瑞拉隊，對上兩年後被他們淘汰的這支日本隊，套用年代校正與 65 球規則後推演勝率。'
            : 'Puts the not-yet-champion 2024 Venezuela roster against the very Japan team they would upset two years later, with era adjustment and the 65-pitch rule applied.'}
        </p>
        <span className="mt-3 flex items-center gap-1 text-xs font-bold text-navy">
          <PlayCircle size={13} />
          {lang === 'zh' ? '前往對戰設定頁' : 'Go to matchup setup'}
        </span>
      </button>
    </div>
  );
}
