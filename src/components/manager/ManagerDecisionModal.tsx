'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Ban,
  Bot,
  Footprints,
  Gauge,
  Hand,
  History,
  Repeat,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { UI, bi } from '@/lib/i18n';
import { deltaForSide } from '@/lib/sabermetrics';
import { cn, formatPct, formatSigned } from '@/lib/utils';
import type {
  Bilingual,
  DecisionOption,
  DecisionOutcome,
  DecisionPoint,
  DecisionType,
  Lang,
  ManagerModeConfig,
  UserDecisionRecord,
} from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 選項樣式                                                            */
/* ------------------------------------------------------------------ */

const DECISION_ICON: Record<DecisionType, React.ComponentType<{ size?: number; className?: string }>> = {
  PITCHING_CHANGE: Repeat,
  PINCH_HITTER: User,
  PINCH_RUNNER: Footprints,
  BUNT: Target,
  IBB: Ban,
  STEAL: Gauge,
  HOLD: Hand,
};

const TRIGGER_LABEL: Record<DecisionPoint['triggerReason'][number], { zh: string; en: string }> = {
  HIGH_LEVERAGE: { zh: '高槓桿情境', en: 'High leverage' },
  PITCH_LIMIT: { zh: '接近用球數上限', en: 'Pitch limit' },
  TTOP: { zh: '第三輪打序', en: 'Third time through' },
  RISP: { zh: '得點圈有人', en: 'Runners in scoring position' },
  LATE_INNING: { zh: '中後段關鍵局', en: 'Late innings' },
};

/* ------------------------------------------------------------------ */
/* 情境條                                                              */
/* ------------------------------------------------------------------ */

function SituationStrip({ dp, lang }: { dp: DecisionPoint; lang: Lang }) {
  const s = dp.state;
  const basesLabel = s.bases.map((r, i) => (r ? ['1B', '2B', '3B'][i] : null)).filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-board px-4 py-3 font-[family-name:var(--font-mono-ticket)] text-board-text sm:grid-cols-5">
      <Readout lang={lang} label={bi('局數', 'INNING')} value={`${s.half === 'TOP' ? '▲' : '▼'} ${s.inning}`} />
      <Readout lang={lang} label={bi('出局', 'OUTS')} value={`${s.outs}`} />
      <Readout
        lang={lang}
        label={bi('壘包', 'BASES')}
        value={basesLabel.length ? basesLabel.join('·') : '—'}
      />
      <Readout lang={lang} label={bi('比數', 'SCORE')} value={`${s.score.away}-${s.score.home}`} />
      <Readout
        lang={lang}
        label={bi('槓桿 LI', 'LI')}
        value={s.leverageIndex.toFixed(2)}
        tone={s.leverageIndex >= 2 ? 'alert' : s.leverageIndex >= 1.5 ? 'amber' : 'default'}
      />
    </div>
  );
}

function Readout({
  label,
  value,
  lang,
  tone = 'default',
}: {
  label: { zh: string; en: string };
  value: string;
  lang: Lang;
  tone?: 'default' | 'amber' | 'alert';
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] opacity-60">{label[lang]}</div>
      <div
        className={cn(
          'text-lg font-bold leading-tight tabular-nums',
          tone === 'amber' && 'text-board-amber',
          tone === 'alert' && 'text-alert led-blink',
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 依選項與勝率變化生成的結果敘述                                        */
/*                                                                     */
/* 這個 app 沒有替每個調度選項各自重新跑一次逐球模擬，所以「維持現狀」    */
/* 直接借用歷史真實的那一球結果（選它就是真的照原計畫進行）；換人／代打  */
/* 則依該選項自己算好的 ΔWP 正負，套用對應的敘述模板——同一顆決策點下，  */
/* 選不同選項會讀到不同文字與數字，而不是同一句通用的「已送出」。       */
/* ------------------------------------------------------------------ */

const ALT_NARRATIVE: Record<'PINCH_HITTER' | 'PITCHING_CHANGE', Record<'up' | 'down' | 'flat', Bilingual>> = {
  PINCH_HITTER: {
    up: bi('代打奏效：換上的打者打出關鍵一擊，扭轉了這個打席的走向。', 'The pinch-hit paid off — the substitute came through with a timely knock that swung the at-bat.'),
    down: bi('代打未能奏效：換上的打者沒能抓住機會，情勢未見改善。', "The pinch-hit didn't pan out — the substitute came up empty, no better than sticking with the incumbent."),
    flat: bi('代打換人對這個打席影響有限，勝率幾乎沒有變化。', 'The pinch-hit swap barely moved the needle on this at-bat.'),
  },
  PITCHING_CHANGE: {
    up: bi('換投奏效：新投手壓制了對方打線，化解了這波危機。', 'The pitching change worked — the new arm shut the door on the threat.'),
    down: bi('換投未能奏效：牛棚投手同樣遭到擊破，未能改善局勢。', "The move to the bullpen didn't help — the new pitcher got hit too."),
    flat: bi('換投對這個打席影響有限，勝率幾乎沒有變化。', 'The pitching change barely moved the needle on this at-bat.'),
  },
};

/** 你的選擇對應的結果敘述；HOLD 借用歷史真實結果，其餘依 ΔWP 正負套模板。 */
function narrativeForChoice(option: DecisionOption, delta: number, historicalResult: Bilingual): Bilingual {
  if (option.type === 'HOLD') return historicalResult;
  if (option.type !== 'PINCH_HITTER' && option.type !== 'PITCHING_CHANGE') return historicalResult;
  const bucket = delta > 0.01 ? 'up' : delta < -0.01 ? 'down' : 'flat';
  return ALT_NARRATIVE[option.type][bucket];
}

/* ------------------------------------------------------------------ */
/* ΔWP 顯示                                                            */
/* ------------------------------------------------------------------ */

function DeltaBadge({ delta, lang }: { delta: number; lang: Lang }) {
  const positive = delta >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-[#fdecea] text-plum',
      )}
      title={UI.manager.deltaWp[lang]}
    >
      <Icon size={12} strokeWidth={2.5} />
      {formatSigned(delta * 100, 1)}%
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 三方對比卡                                                          */
/* ------------------------------------------------------------------ */

const SOURCE_META = {
  USER: { icon: User, label: UI.manager.yourCall, ring: 'ring-navy', bar: 'bg-navy' },
  HISTORICAL: { icon: History, label: UI.manager.historical, ring: 'ring-ink-muted', bar: 'bg-ink-muted' },
  AI_OPTIMAL: { icon: Bot, label: UI.manager.optimal, ring: 'ring-plum', bar: 'bg-plum' },
} as const;

function OutcomeCard({
  outcome,
  lang,
  /** 三張卡中最大的 |ΔWP|，用來畫等比長條。 */
  scale,
  highlight,
}: {
  outcome: DecisionOutcome;
  lang: Lang;
  scale: number;
  highlight?: boolean;
}) {
  const meta = SOURCE_META[outcome.source];
  const Icon = meta.icon;
  const width = scale > 0 ? Math.min(100, (Math.abs(outcome.deltaWp) / scale) * 100) : 0;

  return (
    <div
      className={cn(
        'flex flex-col rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3 ring-1 ring-transparent',
        highlight && `${meta.ring} ring-2`,
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
        <Icon size={12} />
        {meta.label[lang]}
      </div>

      <div className="mt-1.5 text-sm font-bold leading-snug text-ink">
        {outcome.option.label[lang]}
      </div>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
        {outcome.option.detail[lang]}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <DeltaBadge delta={outcome.deltaWp} lang={lang} />
        <span className="font-[family-name:var(--font-mono-ticket)] text-[10px] text-ink-muted">
          RE24 {formatSigned(outcome.option.projectedRe24, 2)}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-sunken">
        <div className={cn('h-full rounded-full', meta.bar)} style={{ width: `${width}%` }} />
      </div>

      {outcome.actualResult && (
        <p className="mt-2 rounded bg-paper px-2 py-1.5 text-[11px] leading-relaxed text-ink">
          {outcome.actualResult[lang]}
        </p>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        {outcome.rationale[lang]}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface ManagerDecisionModalProps {
  decisionPoint: DecisionPoint | null;
  managerMode: ManagerModeConfig;
  lang: Lang;
  open: boolean;
  onSubmit: (record: UserDecisionRecord) => void;
  onClose: () => void;
}

/**
 * 情境決策駕駛艙 (Cockpit Decision HUD)。
 *
 * 使用者選擇調度 → 送出後揭曉三方對比：
 * 你的決策 / 歷史真實總教練選擇 / AI 數據最佳解。
 */
export function ManagerDecisionModal({
  decisionPoint,
  managerMode,
  lang,
  open,
  onSubmit,
  onClose,
}: ManagerDecisionModalProps) {
  const [chosenId, setChosenId] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  // 換到新的決策節點時重置作答狀態。
  React.useEffect(() => {
    setChosenId(null);
    setRevealed(false);
  }, [decisionPoint?.id]);

  if (!decisionPoint) return null;

  const side = managerMode.side;
  const chosen = decisionPoint.options.find((o) => o.id === chosenId) ?? null;

  /** 三方 ΔWP 一律轉成「你執掌那一方」的視角，比較才有意義。 */
  const userDelta = chosen ? deltaForSide(chosen.projectedDeltaWp, side) : 0;
  const historicalDelta = deltaForSide(decisionPoint.historical.deltaWp, side);
  const optimalDelta = deltaForSide(decisionPoint.aiOptimal.deltaWp, side);
  const scale = Math.max(
    Math.abs(userDelta),
    Math.abs(historicalDelta),
    Math.abs(optimalDelta),
    0.001,
  );

  const handleSubmit = () => {
    if (!chosen) return;
    setRevealed(true);
    onSubmit({
      decisionPointId: decisionPoint.id,
      chosenOptionId: chosen.id,
      decidedAt: new Date().toISOString(),
      deltaWp: userDelta,
      gapToOptimal: userDelta - optimalDelta,
    });
  };

  const userOutcome: DecisionOutcome | null = chosen
    ? {
        source: 'USER',
        option: chosen,
        deltaWp: userDelta,
        actualResult: narrativeForChoice(chosen, userDelta, decisionPoint.historical.actualResult ?? bi('', '')),
        rationale: bi(
          '依據你選擇的調度所做的蒙地卡羅推演結果。',
          'Monte Carlo projection for the move you selected.',
        ),
      }
    : null;

  const aiOptimalOutcome: DecisionOutcome = {
    ...decisionPoint.aiOptimal,
    deltaWp: optimalDelta,
    actualResult: narrativeForChoice(decisionPoint.aiOptimal.option, optimalDelta, decisionPoint.historical.actualResult ?? bi('', '')),
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(920px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[calc(var(--radius-pass)+4px)] border border-line bg-paper p-5 shadow-2xl"
          aria-describedby="decision-situation"
        >
          {/* 抬頭 */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-line-strong pb-3">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-base font-bold text-navy">
                <Users size={17} />
                {UI.manager.modeOn[lang]} ·{' '}
                {side === 'HOME' ? UI.manager.home[lang] : UI.manager.away[lang]}
              </Dialog.Title>
              <Dialog.Description
                id="decision-situation"
                className="mt-1 text-xs leading-relaxed text-ink-muted"
              >
                {decisionPoint.situation[lang]}
              </Dialog.Description>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {decisionPoint.triggerReason.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-alert-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-alert"
                >
                  {TRIGGER_LABEL[r][lang]}
                </span>
              ))}
            </div>
          </div>

          {/* 情境看板 */}
          <div className="mt-4">
            <SituationStrip dp={decisionPoint} lang={lang} />
          </div>

          {/* 選項 */}
          {!revealed && (
            <>
              <h3 className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                {lang === 'zh' ? '調度選項' : 'Available moves'}
              </h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {decisionPoint.options.map((option) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    lang={lang}
                    selected={chosenId === option.id}
                    onSelect={() => setChosenId(option.id)}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] text-ink-muted">
                  {managerMode.hideHistoricalUntilAnswered
                    ? lang === 'zh'
                      ? '送出後才會揭曉歷史真實調度，避免劇透。'
                      : 'The historical call stays hidden until you commit.'
                    : ''}
                </p>
                <button
                  type="button"
                  disabled={!chosen}
                  onClick={handleSubmit}
                  className={cn(
                    'rounded-full px-6 py-2 text-sm font-bold text-white transition',
                    chosen ? 'bg-plum hover:brightness-110' : 'cursor-not-allowed bg-ink-muted/50',
                  )}
                >
                  {UI.manager.submit[lang]}
                </button>
              </div>
            </>
          )}

          {/* 三方對比 */}
          {revealed && userOutcome && (
            <>
              <h3 className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                {lang === 'zh' ? '決策結果三方對比' : 'Three-way comparison'}
              </h3>

              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <OutcomeCard outcome={userOutcome} lang={lang} scale={scale} highlight />
                <OutcomeCard
                  outcome={{ ...decisionPoint.historical, deltaWp: historicalDelta }}
                  lang={lang}
                  scale={scale}
                />
                {managerMode.showOptimalCall && (
                  <OutcomeCard outcome={aiOptimalOutcome} lang={lang} scale={scale} />
                )}
              </div>

              {/* 總評 */}
              <div className="mt-4 rounded-[var(--radius-pass)] border border-navy/20 bg-navy/[0.03] px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                  {lang === 'zh' ? '與最佳解的差距' : 'Gap to optimal'}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-3">
                  <span
                    className={cn(
                      'font-[family-name:var(--font-mono-ticket)] text-3xl font-black tabular-nums',
                      userDelta - optimalDelta >= -0.005 ? 'text-emerald-600' : 'text-plum',
                    )}
                  >
                    {formatSigned((userDelta - optimalDelta) * 100, 1)}%
                  </span>
                  <span className="text-xs text-ink-muted">
                    {lang === 'zh'
                      ? `你 ${formatPct(userDelta, 1)} · 歷史 ${formatPct(historicalDelta, 1)} · AI ${formatPct(optimalDelta, 1)}`
                      : `You ${formatPct(userDelta, 1)} · Historical ${formatPct(historicalDelta, 1)} · AI ${formatPct(optimalDelta, 1)}`}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-navy px-6 py-2 text-sm font-bold text-white transition hover:bg-ink"
                >
                  {lang === 'zh' ? '繼續復盤' : 'Resume replay'}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */

function OptionButton({
  option,
  lang,
  selected,
  onSelect,
}: {
  option: DecisionOption;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = DECISION_ICON[option.type];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex flex-col rounded-[var(--radius-pass)] border bg-paper-pure p-3 text-left transition',
        selected
          ? 'border-plum ring-1 ring-plum'
          : 'border-line hover:border-line-strong hover:bg-paper',
      )}
    >
      <span className="flex items-center gap-2">
        <Icon size={15} className={selected ? 'text-plum' : 'text-navy'} />
        <span className="text-sm font-bold text-ink">{option.label[lang]}</span>
      </span>
      <span className="mt-1 text-xs leading-relaxed text-ink-muted">
        {option.detail[lang]}
      </span>
    </button>
  );
}
