import * as React from 'react';
import { Plane, Shield, Star, Ticket } from 'lucide-react';
import { Barcode, QrGlyph } from '@/components/ui/Barcode';
import { CABIN_BY_CLASS } from '@/lib/constants';
import { UI } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Bilingual, Lang, Player, RosterClass } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 樣式對應                                                            */
/* ------------------------------------------------------------------ */

const TONE_RING: Record<string, string> = {
  first: 'ring-navy/25',
  business: 'ring-ink-soft/25',
  economy: 'ring-line-strong',
  crew: 'ring-plum/30',
  standby: 'ring-alert/40',
};

const TONE_STRIPE: Record<string, string> = {
  first: 'bg-navy',
  business: 'bg-ink-soft',
  economy: 'bg-ink-muted',
  crew: 'bg-plum',
  standby: 'bg-alert',
};

/* ------------------------------------------------------------------ */
/* 子元件                                                              */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  lang,
  align = 'left',
  emphasis = false,
}: {
  label: Bilingual;
  value: React.ReactNode;
  lang: Lang;
  align?: 'left' | 'right';
  emphasis?: boolean;
}) {
  return (
    <div className={cn('flex flex-col', align === 'right' && 'items-end text-right')}>
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label[lang]}
      </span>
      <span
        className={cn(
          'font-[family-name:var(--font-mono-ticket)] leading-tight text-ink tabular-nums',
          emphasis ? 'text-xl font-bold' : 'text-sm font-semibold',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** 票券左右兩側的半圓凹口，模擬撕開的機票。 */
function Notches() {
  return (
    <>
      <span className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-paper ring-1 ring-inset ring-line" />
      <span className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-paper ring-1 ring-inset ring-line" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface BoardingPassCardProps {
  lang: Lang;
  /** 旅客／賽事名稱。 */
  title: Bilingual;
  /** 副標：所屬球團、賽事輪次等。 */
  subtitle?: Bilingual;
  /** 航班編號，例如 WBC 2026 · JPN→VEN。 */
  flightNo: string;
  /** 賽事分組。 */
  gate: string;
  /** 打順-守位，或牛棚編號。 */
  seat: string;
  /** 艙等；傳 RosterClass 會自動查表。 */
  cabin: RosterClass | Bilingual;
  /** 登機時間 / 開賽時間。 */
  boardingTime?: string;
  /** 條碼種子。 */
  barcodeSeed: string;
  /** 出發地 → 目的地（比賽 Preview 用：客隊 → 主隊）。 */
  route?: { from: string; to: string };
  /** 右側票根上方的標記（例如背號）。 */
  stubBadge?: string;
  /** 主體下方的自訂內容：通常放行李吊牌 (BaggageTag)。 */
  children?: React.ReactNode;
  /** 卡片強調色（球隊主色）。 */
  accentColor?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BoardingPassCard({
  lang,
  title,
  subtitle,
  flightNo,
  gate,
  seat,
  cabin,
  boardingTime,
  barcodeSeed,
  route,
  stubBadge,
  children,
  accentColor,
  selected = false,
  onClick,
  className,
}: BoardingPassCardProps) {
  const cabinMeta =
    typeof cabin === 'string' ? CABIN_BY_CLASS[cabin] : null;
  const cabinLabel: Bilingual = cabinMeta
    ? { zh: cabinMeta.zh, en: cabinMeta.en }
    : (cabin as Bilingual);
  const tone = cabinMeta?.tone ?? 'economy';

  const interactive = typeof onClick === 'function';
  const Root: React.ElementType = interactive ? 'button' : 'div';

  return (
    <Root
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={interactive ? selected : undefined}
      className={cn(
        'group relative w-full overflow-hidden rounded-[var(--radius-pass)] bg-paper-pure text-left',
        'ring-1 shadow-[0_1px_2px_rgba(11,37,69,0.06),0_8px_24px_-16px_rgba(11,37,69,0.35)]',
        TONE_RING[tone],
        interactive && 'transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(11,37,69,0.45)]',
        selected && 'ring-2 ring-navy',
        className,
      )}
    >
      {/* 頂端色條 */}
      <span
        className={cn('absolute inset-x-0 top-0 h-1', TONE_STRIPE[tone])}
        style={accentColor ? { backgroundColor: accentColor } : undefined}
      />

      <div className="flex">
        {/* ---------- 主聯 ---------- */}
        <div className="flex-1 px-4 pb-3 pt-4">
          {/* 抬頭 */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
                <Ticket size={11} strokeWidth={2.5} />
                {UI.brand[lang]} · BAR
              </div>
              <h3 className="mt-1 truncate text-lg font-bold leading-tight text-ink">
                {title[lang]}
              </h3>
              {subtitle && (
                <p className="truncate text-xs text-ink-muted">{subtitle[lang]}</p>
              )}
            </div>

            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
                TONE_STRIPE[tone],
              )}
              style={accentColor ? { backgroundColor: accentColor } : undefined}
            >
              {cabinLabel[lang]}
            </span>
          </div>

          {/* 航線 */}
          {route && (
            <div className="mt-3 flex items-center gap-3">
              <span className="font-[family-name:var(--font-mono-ticket)] text-2xl font-bold tracking-tight text-navy">
                {route.from}
              </span>
              <span className="relative flex-1 border-t border-dashed border-line-strong">
                <Plane
                  size={14}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-paper-pure px-[1px] text-navy"
                />
              </span>
              <span className="font-[family-name:var(--font-mono-ticket)] text-2xl font-bold tracking-tight text-navy">
                {route.to}
              </span>
            </div>
          )}

          {/* 欄位 */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Field label={UI.boardingPass.flight} value={flightNo} lang={lang} />
            <Field label={UI.boardingPass.gate} value={gate} lang={lang} emphasis />
            <Field label={UI.boardingPass.seat} value={seat} lang={lang} emphasis />
            <Field
              label={UI.boardingPass.boarding}
              value={boardingTime ?? '—'}
              lang={lang}
              align="right"
            />
          </div>

          {/* 自訂區（行李吊牌） */}
          {children && <div className="mt-3">{children}</div>}

          {/* 條碼 */}
          <div className="mt-3 border-t border-dashed border-line pt-2">
            <Barcode seed={barcodeSeed} className="h-8" showText />
          </div>
        </div>

        {/* ---------- 撕票線 ---------- */}
        <div className="relative w-px shrink-0 perforation-y">
          <Notches />
        </div>

        {/* ---------- 票根 ---------- */}
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-between bg-paper px-2 pb-3 pt-4">
          <div className="text-center">
            <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {UI.boardingPass.stub[lang]}
            </div>
            {stubBadge && (
              <div className="mt-1 font-[family-name:var(--font-mono-ticket)] text-2xl font-black leading-none text-navy">
                {stubBadge}
              </div>
            )}
          </div>

          <QrGlyph seed={barcodeSeed} size={52} />

          <div className="text-center font-[family-name:var(--font-mono-ticket)] text-[10px] leading-tight text-ink-muted">
            <div className="font-bold text-ink">{gate}</div>
            <div>{seat}</div>
          </div>
        </div>
      </div>
    </Root>
  );
}

/* ------------------------------------------------------------------ */
/* 便利包裝：球員卡                                                    */
/* ------------------------------------------------------------------ */

export function PlayerBoardingPass({
  player,
  lang,
  accentColor,
  selected,
  onClick,
  children,
  className,
}: {
  player: Player;
  lang: Lang;
  accentColor?: string;
  selected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  const pass = player.boardingPass;

  return (
    <BoardingPassCard
      lang={lang}
      title={player.name}
      subtitle={player.club ?? undefined}
      flightNo={pass.flightNo}
      gate={pass.gate}
      seat={pass.seat}
      cabin={player.rosterClass}
      barcodeSeed={pass.barcodeSeed}
      stubBadge={player.jersey !== null ? String(player.jersey) : undefined}
      accentColor={accentColor}
      selected={selected}
      onClick={onClick}
      className={className}
    >
      {children}
    </BoardingPassCard>
  );
}

/** 遺珠卡片：候補待機樣式 + 醒目標記。 */
export function SnubBoardingPass({
  player,
  lang,
  onClick,
  children,
}: {
  player: Player;
  lang: Lang;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute -right-1 -top-1 z-10 flex items-center gap-1 rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
        <Star size={10} strokeWidth={3} />
        STANDBY
      </span>
      <PlayerBoardingPass player={player} lang={lang} onClick={onClick}>
        {children}
      </PlayerBoardingPass>
    </div>
  );
}

/** 總教練卡：機組員樣式。 */
export function ManagerBoardingPass({
  name,
  club,
  lang,
  gate,
  flightNo,
  barcodeSeed,
}: {
  name: Bilingual;
  club?: Bilingual;
  lang: Lang;
  gate: string;
  flightNo: string;
  barcodeSeed: string;
}) {
  return (
    <BoardingPassCard
      lang={lang}
      title={name}
      subtitle={club}
      flightNo={flightNo}
      gate={gate}
      seat="CREW"
      cabin="MANAGER"
      barcodeSeed={barcodeSeed}
      stubBadge="C"
    >
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Shield size={13} />
        {lang === 'zh' ? '駕駛艙 · 調度決策權限' : 'Cockpit · Tactical authority'}
      </div>
    </BoardingPassCard>
  );
}
