'use client';

import * as React from 'react';
import {
  Activity,
  AlertOctagon,
  Gauge,
  Radio,
  ShieldAlert,
  Siren,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Barcode } from '@/components/ui/Barcode';
import { UI } from '@/lib/i18n';
import { cn, formatSigned } from '@/lib/utils';
import type { CrucialPlay, CrucialPlayCategory, Lang } from '@/types/baseball';

const CATEGORY_ICON: Record<
  CrucialPlayCategory,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  PLAY: Activity,
  MANAGERIAL: Users,
  DEFENSE: ShieldAlert,
  BASERUNNING: Gauge,
  PITCH_CLOCK: Timer,
};

const CATEGORY_LABEL: Record<CrucialPlayCategory, { zh: string; en: string }> = {
  PLAY: { zh: '場上一球', en: 'On-field play' },
  MANAGERIAL: { zh: '調度決策', en: 'Managerial call' },
  DEFENSE: { zh: '守備 (UZR)', en: 'Defense (UZR)' },
  BASERUNNING: { zh: '跑壘', en: 'Baserunning' },
  PITCH_CLOCK: { zh: '計時器違規', en: 'Pitch clock' },
};

const SEVERITY_STYLE = {
  CRITICAL: {
    frame: 'border-plum bg-[#fdecea]',
    strip: 'bg-plum',
    text: 'text-plum',
    icon: Siren,
  },
  WARNING: {
    frame: 'border-alert bg-alert-soft',
    strip: 'bg-alert',
    text: 'text-alert',
    icon: AlertOctagon,
  },
  INFO: {
    frame: 'border-line-strong bg-paper-pure',
    strip: 'bg-navy',
    text: 'text-navy',
    icon: Radio,
  },
} as const;

export interface CrucialPlayAlertProps {
  play: CrucialPlay;
  lang: Lang;
  /** 顯示為全場最大位移的主警報（較大排版）。 */
  featured?: boolean;
  onJumpToPitch?: (pitchId: string) => void;
  className?: string;
}

/**
 * 關鍵轉折點警報 —— 黑匣子 / 機場警示看板樣式。
 * 高亮全場最高 ΔWP 的 Play，並拆解成要點清單。
 */
export function CrucialPlayAlert({
  play,
  lang,
  featured = false,
  onJumpToPitch,
  className,
}: CrucialPlayAlertProps) {
  const style = SEVERITY_STYLE[play.severity];
  const SeverityIcon = style.icon;
  const CategoryIcon = CATEGORY_ICON[play.category];

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-pass)] border-2 border-dashed',
        style.frame,
        className,
      )}
      role={play.severity === 'CRITICAL' ? 'alert' : undefined}
    >
      {play.severity !== 'INFO' && (
        <span className="alert-sweep pointer-events-none absolute inset-0" />
      )}
      <span className={cn('absolute inset-y-0 left-0 w-1.5', style.strip)} />

      <div className={cn('relative pl-5 pr-4', featured ? 'py-4' : 'py-3')}>
        {/* 抬頭 */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SeverityIcon size={featured ? 18 : 15} className={style.text} />
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-[0.22em]',
                style.text,
              )}
            >
              {featured ? UI.crucial.biggestSwing[lang] : UI.crucial.title[lang]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-paper-pure/80 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
              <CategoryIcon size={11} />
              {CATEGORY_LABEL[play.category][lang]}
            </span>
            <span className="font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold text-ink-muted">
              {play.half === 'TOP' ? '▲' : '▼'} {play.inning}
              {lang === 'zh' ? ' 局' : ''}
            </span>
          </div>
        </div>

        {/* 標題與描述 */}
        <h3
          className={cn(
            'mt-1.5 font-bold leading-snug text-ink',
            featured ? 'text-xl' : 'text-base',
          )}
        >
          {play.title[lang]}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {play.description[lang]}
        </p>

        {/* 數據列 */}
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2 border-t border-dashed border-current/25 pt-3">
          <Metric
            label={{ zh: '勝率位移 ΔWP', en: 'ΔWP' }}
            value={`${formatSigned(play.deltaWinProbability * 100, 1)}%`}
            lang={lang}
            emphasis
            tone={style.text}
            icon={TrendingUp}
          />
          <Metric
            label={{ zh: '槓桿指數 LI', en: 'Leverage' }}
            value={play.leverageIndex.toFixed(2)}
            lang={lang}
          />
          {play.re24 !== null && (
            <Metric
              label={{ zh: '期望得分 RE24', en: 'RE24' }}
              value={formatSigned(play.re24, 2)}
              lang={lang}
            />
          )}
          <Metric
            label={{ zh: '受益方', en: 'Beneficiary' }}
            value={
              play.beneficiary === 'HOME'
                ? lang === 'zh'
                  ? '主隊'
                  : 'Home'
                : lang === 'zh'
                  ? '客隊'
                  : 'Away'
            }
            lang={lang}
          />
        </div>

        {/* 黑匣子解構 */}
        {play.breakdown.length > 0 && (
          <div className="mt-3 rounded-lg bg-board px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-board-amber">
              <Radio size={11} />
              {UI.crucial.blackBox[lang]}
            </div>
            <ol className="mt-1.5 space-y-1">
              {play.breakdown.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[13px] leading-relaxed text-board-text/90"
                >
                  <span className="font-[family-name:var(--font-mono-ticket)] text-board-amber">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{line[lang]}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 頁尾：條碼 + 跳轉 */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Barcode seed={play.id} bars={26} className="h-5 opacity-40" />
          {play.pitchId && onJumpToPitch && (
            <button
              type="button"
              onClick={() => onJumpToPitch(play.pitchId!)}
              className="shrink-0 rounded-full bg-navy px-3 py-1 text-[11px] font-bold text-white transition hover:bg-ink"
            >
              {lang === 'zh' ? '跳至該球' : 'Jump to pitch'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  lang,
  emphasis = false,
  tone,
  icon: Icon,
}: {
  label: { zh: string; en: string };
  value: string;
  lang: Lang;
  emphasis?: boolean;
  tone?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {Icon && <Icon size={10} />}
        {label[lang]}
      </div>
      <div
        className={cn(
          'font-[family-name:var(--font-mono-ticket)] font-bold tabular-nums',
          emphasis ? 'text-2xl' : 'text-base',
          emphasis && tone ? tone : 'text-ink',
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** 關鍵轉折點清單：依 |ΔWP| 由大到小排序，第一筆為 featured。 */
export function CrucialPlayList({
  plays,
  lang,
  onJumpToPitch,
  limit = 5,
}: {
  plays: CrucialPlay[];
  lang: Lang;
  onJumpToPitch?: (pitchId: string) => void;
  limit?: number;
}) {
  const sorted = React.useMemo(
    () =>
      [...plays]
        .sort(
          (a, b) =>
            Math.abs(b.deltaWinProbability) - Math.abs(a.deltaWinProbability),
        )
        .slice(0, limit),
    [plays, limit],
  );

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
        {lang === 'zh' ? '尚無關鍵轉折點資料。' : 'No crucial plays recorded yet.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((play, i) => (
        <CrucialPlayAlert
          key={play.id}
          play={play}
          lang={lang}
          featured={i === 0}
          onJumpToPitch={onJumpToPitch}
        />
      ))}
    </div>
  );
}
