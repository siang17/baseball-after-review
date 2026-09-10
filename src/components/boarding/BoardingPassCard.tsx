import * as React from 'react';
import { Plane, Shield, Ticket } from 'lucide-react';
import { Barcode, QrGlyph } from '@/components/ui/Barcode';
import { CABIN_BY_CLASS, getTeam } from '@/lib/constants';
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

/** Tailwind 的 grid-cols 工具類需要在原始碼裡逐字出現才會被掃描到，不能用樣板字串動態拼。 */
const FIELD_GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/* ------------------------------------------------------------------ */
/* 子元件                                                              */
/* ------------------------------------------------------------------ */

export interface BoardingPassField {
  label: Bilingual;
  value: React.ReactNode;
  align?: 'left' | 'right';
  emphasis?: boolean;
}

function Field({ label, value, lang, align = 'left', emphasis = false }: BoardingPassField & { lang: Lang }) {
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
  /** 標題與欄位之間的自訂內容，例如分頁切換列。 */
  bodyHeader?: React.ReactNode;
  /** 卡面主要資訊欄位（2–4 個），不同卡片型態（球員／總教練／賽事）意義不同；傳空陣列就不畫這一列。 */
  fields: BoardingPassField[];
  /** 艙等；傳 RosterClass 會自動查表，同時決定卡片色調（頂端色條／外框）。 */
  cabin: RosterClass | Bilingual;
  /** 是否顯示艙等徽章文字（右上角色塊）。預設顯示；球員卡不顯示文字，但仍用 cabin 決定色調。 */
  showCabinBadge?: boolean;
  /** 條碼種子。 */
  barcodeSeed: string;
  /** 是否顯示主聯下緣的條碼列。預設顯示。 */
  showBarcode?: boolean;
  /** 出發地 → 目的地（比賽 Preview 用：客隊 → 主隊）。 */
  route?: { from: string; to: string };
  /** 右側票根上方的標記（例如背號）。 */
  stubBadge?: string;
  /** 票根中央的圖示；預設是 QR 風格方塊，可換成國旗等。 */
  stubGlyph?: React.ReactNode;
  /** 主體下方的自訂內容：通常放行李吊牌 (BaggageTag) 或分頁內容。 */
  children?: React.ReactNode;
  /** 卡片強調色（球隊主色）。 */
  accentColor?: string;
  className?: string;
}

export function BoardingPassCard({
  lang,
  title,
  subtitle,
  bodyHeader,
  fields,
  cabin,
  showCabinBadge = true,
  barcodeSeed,
  showBarcode = true,
  route,
  stubBadge,
  stubGlyph,
  children,
  accentColor,
  className,
}: BoardingPassCardProps) {
  const cabinMeta =
    typeof cabin === 'string' ? CABIN_BY_CLASS[cabin] : null;
  const cabinLabel: Bilingual = cabinMeta
    ? { zh: cabinMeta.zh, en: cabinMeta.en }
    : (cabin as Bilingual);
  const tone = cabinMeta?.tone ?? 'economy';

  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden rounded-[var(--radius-pass)] bg-paper-pure text-left',
        'ring-1 shadow-[0_1px_2px_rgba(11,37,69,0.06),0_8px_24px_-16px_rgba(11,37,69,0.35)]',
        TONE_RING[tone],
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

            {showCabinBadge && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
                  TONE_STRIPE[tone],
                )}
                style={accentColor ? { backgroundColor: accentColor } : undefined}
              >
                {cabinLabel[lang]}
              </span>
            )}
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

          {bodyHeader && <div className="mt-3">{bodyHeader}</div>}

          {/* 欄位 */}
          {fields.length > 0 && (
            <div className={cn('mt-3 grid gap-2', FIELD_GRID_COLS[fields.length] ?? 'grid-cols-4')}>
              {fields.map((field, i) => (
                <Field key={i} lang={lang} {...field} />
              ))}
            </div>
          )}

          {/* 自訂區（行李吊牌 / 分頁內容） */}
          {children && <div className="mt-3">{children}</div>}

          {/* 條碼 */}
          {showBarcode && (
            <div className="mt-3 border-t border-dashed border-line pt-2">
              <Barcode seed={barcodeSeed} className="h-8" showText />
            </div>
          )}
        </div>

        {/* ---------- 撕票線 ---------- */}
        <div className="relative w-px shrink-0 perforation-y">
          <Notches />
        </div>

        {/* ---------- 票根 ---------- */}
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-around bg-paper px-2 pb-3 pt-4">
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

          {stubGlyph ?? <QrGlyph seed={barcodeSeed} size={52} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 便利包裝：球員卡                                                    */
/* ------------------------------------------------------------------ */

type PlayerCardTab = 'pass' | 'profile';

/** 「登機證／球員數據」分頁切換列。球員數據頁之後會再彙整更完整的履歷內容，這裡先把分頁骨架搭好。 */
function PlayerCardTabs({
  active,
  onChange,
  lang,
}: {
  active: PlayerCardTab;
  onChange: (tab: PlayerCardTab) => void;
  lang: Lang;
}) {
  const tabs: Array<{ id: PlayerCardTab; label: Bilingual }> = [
    { id: 'pass', label: UI.boardingPass.ticketTab },
    { id: 'profile', label: UI.boardingPass.playerStats },
  ];
  return (
    <div className="flex gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={active === tab.id}
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition',
            active === tab.id ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
          )}
        >
          {tab.label[lang]}
        </button>
      ))}
    </div>
  );
}

/** 「球員數據」分頁內容：打投／聯盟／年齡／身高體重等履歷欄位，缺值一律顯示「—」；下方接統計標籤。 */
function PlayerProfileTab({
  player,
  lang,
  children,
}: {
  player: Player;
  lang: Lang;
  children?: React.ReactNode;
}) {
  const bioRows: Array<{ label: Bilingual; value: string }> = [
    { label: UI.boardingPass.batsThrows, value: `${player.bats}/${player.throws}` },
    { label: UI.boardingPass.league, value: player.leagueOrigin },
    { label: UI.boardingPass.age, value: player.age !== null ? String(player.age) : '—' },
    {
      label: UI.boardingPass.heightWeight,
      value:
        player.heightCm !== null && player.weightKg !== null
          ? `${player.heightCm}cm / ${player.weightKg}kg`
          : '—',
    },
  ];

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {bioRows.map((row, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-2 border-b border-dashed border-line pb-1"
          >
            <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {row.label[lang]}
            </dt>
            <dd className="font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {player.scoutingNote && (
        <p className="text-xs leading-relaxed text-ink-soft">{player.scoutingNote[lang]}</p>
      )}

      {children}
    </div>
  );
}

export function PlayerBoardingPass({
  player,
  lang,
  accentColor,
  className,
  children,
}: {
  player: Player;
  lang: Lang;
  accentColor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [tab, setTab] = React.useState<PlayerCardTab>('pass');
  const pass = player.boardingPass;
  const team = getTeam(player.teamCode, player.era);
  /** 投手用 SP/RP/CL 這種角色分工，比單純顯示「P」更有資訊量；打者則顯示實際守位。 */
  const positionLabel = player.pitcherRole ?? player.positions.join('/');

  return (
    <BoardingPassCard
      lang={lang}
      title={player.name}
      bodyHeader={<PlayerCardTabs active={tab} onChange={setTab} lang={lang} />}
      fields={
        tab === 'pass'
          ? [
              { label: UI.boardingPass.club, value: player.club ? player.club[lang] : '—' },
              {
                label: UI.boardingPass.country,
                value: `${team?.flagEmoji ?? ''} ${player.teamCode}`.trim(),
                emphasis: true,
              },
              { label: UI.boardingPass.position, value: positionLabel, emphasis: true, align: 'right' },
            ]
          : []
      }
      showBarcode={tab === 'pass'}
      cabin={player.rosterClass}
      showCabinBadge={false}
      barcodeSeed={pass.barcodeSeed}
      stubBadge={player.jersey !== null ? String(player.jersey) : undefined}
      stubGlyph={
        <span className="text-4xl leading-none" aria-hidden>
          {team?.flagEmoji ?? '🏳️'}
        </span>
      }
      accentColor={accentColor}
      className={className}
    >
      {tab === 'profile' && (
        <PlayerProfileTab player={player} lang={lang}>
          {children}
        </PlayerProfileTab>
      )}
    </BoardingPassCard>
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
      fields={[
        { label: UI.boardingPass.flight, value: flightNo },
        { label: UI.boardingPass.gate, value: gate, emphasis: true },
        { label: UI.boardingPass.seat, value: 'CREW', emphasis: true, align: 'right' },
      ]}
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
