'use client';

import * as React from 'react';
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  CalendarClock,
  Check,
  ChevronLeft,
  PlayCircle,
  Sparkles,
  Swords,
} from 'lucide-react';
import { MatchCard } from '@/components/cards/TeamCard';
import { PITCH_LIMIT_PRESETS, TEAMS_BY_ERA, TOURNAMENTS, getTeam } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ERA_MODE_YEARS, useMatchupStore } from '@/store/useMatchupStore';
import type {
  Bilingual,
  Era,
  EraMode,
  Lang,
  MatchupModeConfig,
  MatchupStep,
  Team,
} from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 年代模式定義                                                        */
/* ------------------------------------------------------------------ */

interface EraModeOption {
  mode: EraMode;
  title: Bilingual;
  blurb: Bilingual;
  route: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ERA_MODES: EraModeOption[] = [
  {
    mode: '2024vs2024',
    title: bi('2024 vs. 2024', '2024 vs. 2024'),
    blurb: bi('12 強賽事重演／複賽模擬', 'Premier12 rematch & re-bracket simulation'),
    route: 'P12 → P12',
    icon: CalendarClock,
  },
  {
    mode: '2026vs2026',
    title: bi('2026 vs. 2026', '2026 vs. 2026'),
    blurb: bi('WBC 經典賽同屆對決', 'Same-tournament WBC matchup'),
    route: 'WBC → WBC',
    icon: Swords,
  },
  {
    mode: '2024vs2026',
    title: bi('2024 vs. 2026', '2024 vs. 2026'),
    blurb: bi(
      '跨年代關原之戰：12 強冠軍 vs. WBC 完全體',
      'Cross-era clash: Premier12 champs vs. a full-strength WBC roster',
    ),
    route: 'P12 → WBC',
    icon: Sparkles,
  },
];

/* ------------------------------------------------------------------ */
/* 步驟指示器                                                          */
/* ------------------------------------------------------------------ */

const STEPS: Array<{ key: MatchupStep; label: Bilingual }> = [
  { key: 'SELECT_ERA', label: UI.matchup.step1 },
  { key: 'SELECT_TEAMS', label: UI.matchup.step2 },
  { key: 'CONFIRM', label: UI.matchup.step3 },
];

function StepBar({ current, lang }: { current: MatchupStep; lang: Lang }) {
  const activeIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2" aria-label="booking steps">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                done && 'bg-navy text-white',
                active && 'bg-plum text-white',
                !done && !active && 'bg-paper-sunken text-ink-muted',
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-xs font-semibold sm:inline',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {step.label[lang]}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-6 bg-line-strong sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* 隊伍選擇欄                                                          */
/* ------------------------------------------------------------------ */

function TeamColumn({
  heading,
  year,
  teams,
  selectedCode,
  disabledCode,
  lang,
  onSelect,
}: {
  heading: Bilingual;
  year: Era;
  teams: Team[];
  selectedCode: string | null;
  /** 另一側已選的隊伍（同年份時不可重複）。 */
  disabledCode: string | null;
  lang: Lang;
  onSelect: (code: Team['code']) => void;
}) {
  return (
    <div className="rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {heading[lang]}
        </h4>
        <span className="font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-navy">
          {TOURNAMENTS[year].flightPrefix} {year}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {teams.map((team) => {
          const disabled = team.code === disabledCode;
          const selected = team.code === selectedCode;
          return (
            <button
              key={team.code}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(team.code)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition',
                selected
                  ? 'border-navy bg-navy/5 ring-1 ring-navy'
                  : 'border-line hover:border-line-strong hover:bg-paper',
                disabled && 'cursor-not-allowed opacity-35 hover:border-line hover:bg-transparent',
              )}
            >
              <span className="text-xl leading-none">{team.flagEmoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">
                  {team.name[lang]}
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-ink-muted">
                  {lang === 'zh' ? '分組' : 'GROUP'} {team.group}
                </span>
              </span>
              <span className="font-[family-name:var(--font-mono-ticket)] text-sm font-bold text-navy">
                {team.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主元件                                                              */
/* ------------------------------------------------------------------ */

export interface MatchupSelectorProps {
  lang: Lang;
  /** 確認後回呼，通常在此觸發模擬 API。 */
  onConfirm?: (config: MatchupModeConfig) => void;
  className?: string;
}

/**
 * 跨年份夢幻對決選隊流程。
 *
 * Step 1 選年代模式 → Step 2 依年份動態載入國家隊 → Step 3 確認行程並開賽。
 */
export function MatchupSelector({ lang, onConfirm, className }: MatchupSelectorProps) {
  const step = useMatchupStore((s) => s.step);
  const config = useMatchupStore((s) => s.config);
  const isSimulating = useMatchupStore((s) => s.isSimulating);
  const setStep = useMatchupStore((s) => s.setStep);
  const setEraMode = useMatchupStore((s) => s.setEraMode);
  const setTeam = useMatchupStore((s) => s.setTeam);
  const swapSides = useMatchupStore((s) => s.swapSides);
  const setVenue = useMatchupStore((s) => s.setVenue);
  const setEraAdjustment = useMatchupStore((s) => s.setEraAdjustment);
  const setPitchLimitPreset = useMatchupStore((s) => s.setPitchLimitPreset);

  const awayTeams = TEAMS_BY_ERA[config.awayTeamYear];
  const homeTeams = TEAMS_BY_ERA[config.homeTeamYear];
  const sameYear = config.awayTeamYear === config.homeTeamYear;

  const awayTeam = config.awayTeamCode ? getTeam(config.awayTeamCode, config.awayTeamYear) : undefined;
  const homeTeam = config.homeTeamCode ? getTeam(config.homeTeamCode, config.homeTeamYear) : undefined;
  const teamsReady = Boolean(awayTeam && homeTeam);

  const handleEraMode = (mode: EraMode) => {
    setEraMode(mode);
    setStep('SELECT_TEAMS');
  };

  return (
    <section className={cn('rounded-[calc(var(--radius-pass)+4px)] border border-line bg-paper p-4 sm:p-6', className)}>
      {/* 抬頭 */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line-strong pb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-navy" />
          <h2 className="text-base font-bold tracking-wide text-navy">
            {UI.matchup.title[lang]}
          </h2>
        </div>
        <StepBar current={step} lang={lang} />
      </header>

      {/* ---------------- Step 1 ---------------- */}
      {step === 'SELECT_ERA' && (
        <div className="grid gap-3 md:grid-cols-3">
          {ERA_MODES.map((option) => {
            const Icon = option.icon;
            const selected = config.eraMode === option.mode;
            const [awayYear, homeYear] = ERA_MODE_YEARS[option.mode];
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => handleEraMode(option.mode)}
                aria-pressed={selected}
                className={cn(
                  'group relative overflow-hidden rounded-[var(--radius-pass)] border bg-paper-pure p-4 text-left transition',
                  selected
                    ? 'border-navy ring-1 ring-navy'
                    : 'border-line hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_28px_-18px_rgba(11,37,69,0.5)]',
                )}
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-navy" />
                <Icon size={18} className="text-plum" />
                <h3 className="mt-2 font-[family-name:var(--font-mono-ticket)] text-lg font-bold text-ink">
                  {option.title[lang]}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {option.blurb[lang]}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-2">
                  <span className="font-[family-name:var(--font-mono-ticket)] text-[11px] font-bold tracking-widest text-navy">
                    {option.route}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-ink-muted">
                    {awayYear} → {homeYear}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------- Step 2 ---------------- */}
      {step === 'SELECT_TEAMS' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <TeamColumn
              heading={UI.matchup.departure}
              year={config.awayTeamYear}
              teams={awayTeams}
              selectedCode={config.awayTeamCode}
              disabledCode={sameYear ? config.homeTeamCode : null}
              lang={lang}
              onSelect={(code) => setTeam('away', code)}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swapSides}
                title={UI.matchup.swap[lang]}
                className="flex items-center gap-1.5 rounded-full border border-line bg-paper-pure px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition hover:border-navy hover:text-navy"
              >
                <ArrowLeftRight size={13} />
                {UI.matchup.swap[lang]}
              </button>
            </div>

            <TeamColumn
              heading={UI.matchup.arrival}
              year={config.homeTeamYear}
              teams={homeTeams}
              selectedCode={config.homeTeamCode}
              disabledCode={sameYear ? config.awayTeamCode : null}
              lang={lang}
              onSelect={(code) => setTeam('home', code)}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('SELECT_ERA')}
              className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              <ChevronLeft size={14} />
              {UI.matchup.back[lang]}
            </button>

            <button
              type="button"
              disabled={!teamsReady}
              onClick={() => setStep('CONFIRM')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white transition',
                teamsReady ? 'bg-navy hover:bg-ink' : 'cursor-not-allowed bg-ink-muted/50',
              )}
            >
              {UI.matchup.next[lang]}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Step 3 ---------------- */}
      {step === 'CONFIRM' && awayTeam && homeTeam && (
        <div className="space-y-4">
          <MatchCard
            lang={lang}
            title={bi(
              `${awayTeam.shortName.zh} ${config.awayTeamYear} vs. ${homeTeam.shortName.zh} ${config.homeTeamYear}`,
              `${awayTeam.code} ${config.awayTeamYear} vs. ${homeTeam.code} ${config.homeTeamYear}`,
            )}
            subtitle={bi(
              `${TOURNAMENTS[config.awayTeamYear].name.zh} × ${TOURNAMENTS[config.homeTeamYear].name.zh}`,
              `${TOURNAMENTS[config.awayTeamYear].name.en} × ${TOURNAMENTS[config.homeTeamYear].name.en}`,
            )}
            badge={bi('模擬對決', 'SIMULATION')}
            away={{ code: awayTeam.code, flagEmoji: awayTeam.flagEmoji, name: awayTeam.name, colorPrimary: awayTeam.colorPrimary }}
            home={{ code: homeTeam.code, flagEmoji: homeTeam.flagEmoji, name: homeTeam.name, colorPrimary: homeTeam.colorPrimary }}
            fields={[
              { label: bi('對戰模式', 'Mode'), value: config.eraMode.replace('vs', ' vs. ') },
              { label: bi('分組', 'Group'), value: `${awayTeam.group}/${homeTeam.group}`, emphasis: true },
              {
                label: bi('球場', 'Venue'),
                value: config.venue === 'NEUTRAL' ? 'NEUTRAL' : 'HOME ADV',
                emphasis: true,
              },
              { label: bi('模擬場次', 'Runs'), value: `${config.simulationRuns.toLocaleString()}`, align: 'right' },
            ]}
          />

          {/* 行程選項 */}
          <div className="grid gap-3 sm:grid-cols-3">
            <OptionGroup
              label={bi('球場', 'Venue')}
              options={[
                { value: 'NEUTRAL', label: bi('中立球場', 'Neutral') },
                { value: 'HOME_ADVANTAGE', label: bi('主場優勢', 'Home advantage') },
              ]}
              value={config.venue}
              onChange={(v) => setVenue(v as MatchupModeConfig['venue'])}
              lang={lang}
            />

            <OptionGroup
              label={bi('用球數限制', 'Pitch limit')}
              options={PITCH_LIMIT_PRESETS.map((p) => ({
                value: String(p),
                label: p === 'UNLIMITED' ? UI.hud.unlimited : bi(`${p} 球`, `${p}`),
              }))}
              value={String(config.pitchLimitPreset)}
              onChange={(v) =>
                setPitchLimitPreset(v === 'UNLIMITED' ? 'UNLIMITED' : (Number(v) as 65 | 50 | 30))
              }
              lang={lang}
            />

            <OptionGroup
              label={bi('年代校正', 'Era adjustment')}
              options={[
                { value: 'on', label: bi('開啟', 'On') },
                { value: 'off', label: bi('關閉', 'Off') },
              ]}
              value={config.applyEraAdjustment ? 'on' : 'off'}
              onChange={(v) => setEraAdjustment(v === 'on')}
              lang={lang}
            />
          </div>

          {config.eraMode === '2024vs2026' && (
            <p className="rounded-lg border border-alert/40 bg-alert-soft px-3 py-2 text-xs leading-relaxed text-alert">
              {lang === 'zh'
                ? '跨年代對決：兩屆的得分環境與規則（用球數、Pitch Timer）不同，建議保持「年代校正」開啟，模擬結果才可比較。'
                : 'Cross-era matchup: the two tournaments differ in run environment and rules (pitch limits, pitch timer). Keep era adjustment on so the simulation stays comparable.'}
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('SELECT_TEAMS')}
              className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              <ChevronLeft size={14} />
              {UI.matchup.back[lang]}
            </button>

            <button
              type="button"
              disabled={isSimulating}
              onClick={() => onConfirm?.(config)}
              className="flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <PlayCircle size={16} />
              {isSimulating
                ? lang === 'zh'
                  ? '模擬中…'
                  : 'Simulating…'
                : UI.matchup.confirm[lang]}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function OptionGroup({
  label,
  options,
  value,
  onChange,
  lang,
}: {
  label: Bilingual;
  options: Array<{ value: string; label: Bilingual }>;
  value: string;
  onChange: (value: string) => void;
  lang: Lang;
}) {
  return (
    <fieldset className="rounded-lg border border-line bg-paper-pure p-3">
      <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
        {label[lang]}
      </legend>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition',
              value === option.value
                ? 'bg-navy text-white'
                : 'bg-paper-sunken text-ink-muted hover:text-ink',
            )}
          >
            {option.label[lang]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
