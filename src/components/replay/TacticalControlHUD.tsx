'use client';

import * as React from 'react';
import {
  AlertTriangle,
  BellRing,
  Headphones,
  Luggage,
  RefreshCcw,
  Repeat2,
  Timer,
  TimerOff,
  WifiOff,
} from 'lucide-react';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { PITCH_LIMIT_PRESETS, restDaysFor } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { ttopPenalty, velocityAfterPitches } from '@/lib/sabermetrics';
import { cn, clamp } from '@/lib/utils';
import { useReplayStore } from '@/store/useReplayStore';
import type { Lang, MatchState, PitchData, Player } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* Pitch Timer                                                         */
/* ------------------------------------------------------------------ */

function PitchTimerPanel({
  state,
  lang,
  /** 每次進入新打席／新一球時改變，用來重置倒數。 */
  resetKey,
}: {
  state: MatchState;
  lang: Lang;
  resetKey: string | number;
}) {
  const config = useReplayStore((s) => s.pitchTimer);
  const setTimer = useReplayStore((s) => s.setTimer);

  const runnersOn = state.bases.some(Boolean);
  const allowance = runnersOn ? config.runnersOnSec : config.emptyBasesSec;

  const [remaining, setRemaining] = React.useState(allowance);

  React.useEffect(() => {
    setRemaining(allowance);
    if (!config.enabled) return;

    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : Number((r - 0.1).toFixed(1))));
    }, 100);
    return () => window.clearInterval(id);
  }, [allowance, config.enabled, resetKey]);

  const pct = clamp(remaining / allowance, 0, 1);
  const critical = remaining <= 5;
  const expired = remaining <= 0;

  return (
    <section className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3">
      <header className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          <Timer size={12} />
          {UI.hud.pitchTimer[lang]}
        </h4>
        <ToggleChip
          on={config.enabled}
          onChange={(v) => setTimer({ enabled: v })}
          onLabel={bi('啟用', 'On')}
          offLabel={bi('停用', 'Off')}
          lang={lang}
        />
      </header>

      <div className="mt-3 flex items-center gap-4">
        <div
          className={cn(
            'relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-board',
            config.enabled && critical && !expired && 'clock-pulse',
          )}
          role="timer"
          aria-live="off"
        >
          {/* 進度環 */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={expired ? '#d9381e' : critical ? '#ff6b35' : '#ffb300'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - pct)}
            />
          </svg>
          <span
            className={cn(
              'font-[family-name:var(--font-mono-ticket)] text-2xl font-black tabular-nums text-board-text',
              expired && 'text-alert led-blink',
            )}
          >
            {config.enabled ? Math.ceil(remaining) : '--'}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5 text-xs">
          <Row
            lang={lang}
            label={bi('壘上狀況', 'Bases')}
            value={
              runnersOn
                ? `${lang === 'zh' ? '有跑者' : 'Runners on'} · ${config.runnersOnSec}s`
                : `${lang === 'zh' ? '壘上無人' : 'Empty'} · ${config.emptyBasesSec}s`
            }
          />
          <Row
            lang={lang}
            label={bi('打者就位', 'Batter ready by')}
            value={`${config.batterReadySec}s`}
          />
          {expired && config.enabled && (
            <p className="flex items-center gap-1 rounded bg-[#fdecea] px-2 py-1 font-semibold text-plum">
              <AlertTriangle size={12} />
              {UI.hud.violation[lang]} — {lang === 'zh' ? '自動增加一好球' : 'automatic strike'}
            </p>
          )}
          {!config.enabled && (
            <p className="flex items-center gap-1 text-ink-muted">
              <TimerOff size={12} />
              {lang === 'zh' ? '計時器已關閉，重現無限制節奏。' : 'Timer off — unrestricted tempo.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PitchCom                                                            */
/* ------------------------------------------------------------------ */

function PitchComPanel({ pitch, lang }: { pitch: PitchData | null; lang: Lang }) {
  const config = useReplayStore((s) => s.pitchCom);
  const setPitchCom = useReplayStore((s) => s.setPitchCom);
  const signal = pitch?.pitchCom ?? null;

  const latency =
    signal && signal.acknowledgedAtMs !== null
      ? signal.acknowledgedAtMs - signal.sentAtMs
      : null;
  const malfunctioning = (signal?.malfunctionDelayMs ?? 0) > 0;

  return (
    <section className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3">
      <header className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          <Headphones size={12} />
          {UI.hud.pitchCom[lang]}
        </h4>
        <ToggleChip
          on={config.enabled}
          onChange={(v) => setPitchCom({ enabled: v })}
          onLabel={bi('啟用', 'On')}
          offLabel={bi('停用', 'Off')}
          lang={lang}
        />
      </header>

      {!config.enabled || !signal ? (
        <p className="mt-3 text-xs text-ink-muted">
          {lang === 'zh'
            ? '此球無 PitchCom 訊號紀錄（或模組已關閉）。'
            : 'No PitchCom trace for this pitch (or the module is off).'}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {signal.sender === 'CATCHER'
                ? lang === 'zh'
                  ? '捕手主導'
                  : 'Catcher'
                : lang === 'zh'
                  ? '投手主導'
                  : 'Pitcher'}
            </span>
            <span className="font-[family-name:var(--font-mono-ticket)] text-sm font-bold text-ink">
              {signal.requestedPitch}
            </span>
            {signal.changed && (
              <span className="flex items-center gap-1 rounded-full bg-alert-soft px-2 py-0.5 text-[10px] font-bold text-alert">
                <Repeat2 size={11} />
                {lang === 'zh' ? `改訊號 ×${signal.changeCount}` : `${signal.changeCount} change(s)`}
              </span>
            )}
            {malfunctioning && (
              <span className="flex items-center gap-1 rounded-full bg-[#fdecea] px-2 py-0.5 text-[10px] font-bold text-plum">
                <WifiOff size={11} />
                {lang === 'zh' ? `故障延誤 ${signal.malfunctionDelayMs}ms` : `${signal.malfunctionDelayMs}ms fault`}
              </span>
            )}
          </div>

          {/* 時間軸 */}
          {config.showTimeline && (
            <div className="relative h-9 rounded bg-board px-2 py-1.5">
              <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/20" />
              <Marker atMs={signal.sentAtMs} max={4000} label="SENT" tone="amber" />
              {signal.acknowledgedAtMs !== null && (
                <Marker atMs={signal.acknowledgedAtMs} max={4000} label="ACK" tone="green" />
              )}
              {malfunctioning && (
                <Marker
                  atMs={signal.sentAtMs + signal.malfunctionDelayMs}
                  max={4000}
                  label="FAULT"
                  tone="alert"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Row
              lang={lang}
              label={bi('確認延遲', 'Ack latency')}
              value={latency !== null ? `${latency} ms` : '—'}
            />
            <Row
              lang={lang}
              label={bi('進壘點', 'Target')}
              value={`x ${signal.requestedLocation.x.toFixed(2)} / z ${signal.requestedLocation.z.toFixed(2)}`}
            />
          </div>

          {signal.malfunctionNote && (
            <p className="rounded bg-alert-soft px-2 py-1.5 text-[11px] leading-relaxed text-alert">
              {signal.malfunctionNote[lang]}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Marker({
  atMs,
  max,
  label,
  tone,
}: {
  atMs: number;
  max: number;
  label: string;
  tone: 'amber' | 'green' | 'alert';
}) {
  const left = clamp(atMs / max, 0, 1) * 100;
  const color =
    tone === 'amber' ? 'bg-board-amber' : tone === 'green' ? 'bg-board-green' : 'bg-alert';
  return (
    <span className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${left}%` }}>
      <span className={cn('mt-1.5 h-2.5 w-2.5 rounded-full', color)} />
      <span className="mt-0.5 text-[8px] font-bold tracking-wider text-board-text/70">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 用球數限制                                                          */
/* ------------------------------------------------------------------ */

function PitchLimitPanel({
  state,
  pitcher,
  lang,
}: {
  state: MatchState;
  pitcher: Player | null;
  lang: Lang;
}) {
  const config = useReplayStore((s) => s.pitchLimit);
  const setPreset = useReplayStore((s) => s.setPitchLimitPreset);
  const setEnabled = useReplayStore((s) => s.setPitchLimitEnabled);
  const alert = useReplayStore((s) => s.baggageAlert);
  const dismissAlert = useReplayStore((s) => s.dismissBaggageAlert);
  const evaluate = useReplayStore((s) => s.evaluatePitchCount);

  const count = state.pitcherPitchCount;

  // 用球數變動時重新評估是否要跳出超重卡片。
  React.useEffect(() => {
    evaluate(state.pitcherId, count);
  }, [count, state.pitcherId, evaluate, config.preset, config.enabled]);

  const limit = config.limit;
  const pct = limit ? clamp(count / limit, 0, 1) : 0;
  const over = limit !== null && count >= limit;
  const warning = limit !== null && !over && count >= config.warningThreshold;

  const baseVelocity = pitcher?.pitching?.avgVelocity ?? null;
  const projectedVelocity =
    baseVelocity !== null
      ? velocityAfterPitches(baseVelocity, count, pitcher?.pitching?.velocityDeclinePer25 ?? null)
      : null;

  const ttopHit =
    config.ttopWarningEnabled && state.timesThroughOrder >= config.ttopThreshold;

  return (
    <section className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          <Luggage size={12} />
          {UI.hud.pitchCount[lang]}
        </h4>
        <div className="flex items-center gap-1">
          {PITCH_LIMIT_PRESETS.map((preset) => {
            const active = config.enabled && config.preset === preset;
            return (
              <button
                key={String(preset)}
                type="button"
                onClick={() => {
                  setEnabled(true);
                  setPreset(preset);
                }}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-bold transition',
                  active ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted hover:text-ink',
                )}
              >
                {preset === 'UNLIMITED' ? (lang === 'zh' ? '無限' : '∞') : preset}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setEnabled(!config.enabled)}
            className="ml-1 rounded-full bg-paper-sunken p-1 text-ink-muted transition hover:text-ink"
            title={lang === 'zh' ? '切換模組' : 'Toggle module'}
          >
            <RefreshCcw size={12} />
          </button>
        </div>
      </header>

      {/* 行李重量條 */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-[family-name:var(--font-mono-ticket)] text-3xl font-black leading-none tabular-nums text-ink">
            {count}
            <span className="ml-1 text-sm font-bold text-ink-muted">
              / {limit ?? '∞'}
            </span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">
            {config.enabled ? UI.hud.limit[lang] : UI.hud.unlimited[lang]}
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-paper-sunken">
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              over ? 'bg-plum' : warning ? 'bg-alert' : 'bg-navy',
            )}
            style={{ width: `${(limit ? pct : 0) * 100}%` }}
          />
        </div>
      </div>

      {/* 吊牌 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <BaggageTag
          lang={lang}
          label={bi('第幾輪打序', 'Times through')}
          value={state.timesThroughOrder}
          footnote={
            ttopHit
              ? bi(
                  `TTOP 懲罰 +${(ttopPenalty(state.timesThroughOrder) * 1000).toFixed(0)} wOBA 點`,
                  `TTOP penalty +${(ttopPenalty(state.timesThroughOrder) * 1000).toFixed(0)} wOBA pts`,
                )
              : undefined
          }
          tone={ttopHit ? 'warn' : 'neutral'}
        />
        {projectedVelocity !== null && baseVelocity !== null && (
          <BaggageTag
            lang={lang}
            label={bi('推估球速', 'Projected velo')}
            value={projectedVelocity.toFixed(1)}
            unit="mph"
            footnote={bi(
              `較初速 ${(projectedVelocity - baseVelocity).toFixed(1)} mph`,
              `${(projectedVelocity - baseVelocity).toFixed(1)} mph vs. fresh`,
            )}
            tone={baseVelocity - projectedVelocity >= 1.5 ? 'warn' : 'neutral'}
          />
        )}
        {config.enabled && (
          <BaggageTag
            lang={lang}
            label={UI.hud.restDays}
            value={restDaysFor(count, config)}
            unit={lang === 'zh' ? '天' : 'd'}
            footnote={bi('依 WBC 休息規則推算', 'Per WBC rest rules')}
            tone={restDaysFor(count, config) >= 4 ? 'danger' : 'neutral'}
          />
        )}
      </div>

      {/* 超重／退場卡片 */}
      {alert && (
        <div
          className={cn(
            'relative mt-3 overflow-hidden rounded-[var(--radius-pass)] border-2 border-dashed p-3',
            alert.severity === 'MANDATORY_REMOVAL'
              ? 'border-plum bg-[#fdecea]'
              : 'border-alert bg-alert-soft',
          )}
          role="alert"
        >
          <div className="alert-sweep pointer-events-none absolute inset-0" />
          <div className="flex items-start gap-2">
            <BellRing
              size={16}
              className={alert.severity === 'MANDATORY_REMOVAL' ? 'text-plum' : 'text-alert'}
            />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.18em]',
                  alert.severity === 'MANDATORY_REMOVAL' ? 'text-plum' : 'text-alert',
                )}
              >
                {alert.severity === 'MANDATORY_REMOVAL'
                  ? UI.hud.overweight[lang]
                  : lang === 'zh'
                    ? '行李即將超重 · 牛棚準備'
                    : 'Approaching weight limit · warm the bullpen'}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink">{alert.message[lang]}</p>
              <div className="mt-1.5 font-[family-name:var(--font-mono-ticket)] text-[11px] text-ink-muted">
                {alert.pitchCount} / {alert.limit} ·{' '}
                {UI.hud.restDays[lang]} {alert.mandatoryRestDays}
                {lang === 'zh' ? ' 天' : 'd'}
              </div>
            </div>
            <button
              type="button"
              onClick={dismissAlert}
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-ink-muted hover:text-ink"
            >
              {lang === 'zh' ? '關閉' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 共用小元件                                                          */
/* ------------------------------------------------------------------ */

function Row({
  label,
  value,
  lang,
}: {
  label: { zh: string; en: string };
  value: string;
  lang: Lang;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-ink-muted">{label[lang]}</span>
      <span className="font-[family-name:var(--font-mono-ticket)] font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}

function ToggleChip({
  on,
  onChange,
  onLabel,
  offLabel,
  lang,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  onLabel: { zh: string; en: string };
  offLabel: { zh: string; en: string };
  lang: Lang;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-bold transition',
        on ? 'bg-navy text-white' : 'bg-paper-sunken text-ink-muted',
      )}
    >
      {on ? onLabel[lang] : offLabel[lang]}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface TacticalControlHUDProps {
  state: MatchState;
  /** 目前這一球（供 PitchCom 時間軸使用）。 */
  pitch: PitchData | null;
  /** 目前投手，用於球速衰退推估。 */
  pitcher: Player | null;
  lang: Lang;
  className?: string;
}

/**
 * 戰術控制台：Pitch Timer + PitchCom HUD + 國際賽用球數限制模組。
 */
export function TacticalControlHUD({
  state,
  pitch,
  pitcher,
  lang,
  className,
}: TacticalControlHUDProps) {
  return (
    <div className={cn('grid gap-3 lg:grid-cols-3', className)}>
      <PitchTimerPanel state={state} lang={lang} resetKey={pitch?.id ?? state.pitcherPitchCount} />
      <PitchComPanel pitch={pitch} lang={lang} />
      <PitchLimitPanel state={state} pitcher={pitcher} lang={lang} />
    </div>
  );
}
