'use client';

import { BarChart3, Gauge, RotateCcw, Swords } from 'lucide-react';
import { WinProbabilityChart } from '@/components/analysis/LazyCharts';
import { getTeam } from '@/lib/constants';
import type { Lang, MatchupSimulationResult } from '@/types/baseball';

const GRADE_KEYS = ['offense', 'defense', 'rotation', 'bullpen', 'baserunning'] as const;

export function SimulationResult({ result, lang, onReset }: { result: MatchupSimulationResult; lang: Lang; onReset: () => void }) {
  const home = getTeam(result.config.homeTeamCode!, result.config.homeTeamYear);
  const away = getTeam(result.config.awayTeamCode!, result.config.awayTeamYear);
  const homePct = (result.homeWinRate * 100).toFixed(1);
  const awayPct = (result.awayWinRate * 100).toFixed(1);
  return (
    <section className="mt-8 space-y-5 border-t border-line pt-8" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-plum">Simulation complete · 模擬完成</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{away?.name[lang]} <span className="text-ink-muted">vs.</span> {home?.name[lang]}</h2>
        </div>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-muted hover:border-navy hover:text-navy"><RotateCcw size={15} />{lang === 'zh' ? '重新訂位' : 'New booking'}</button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <WinCard code={result.config.awayTeamCode!} label={away?.name[lang] ?? result.config.awayTeamCode!} win={awayPct} score={result.averageScore.away} align="right" />
        <div className="rounded-full border border-line bg-paper-pure px-4 py-2 text-center font-[family-name:var(--font-mono-ticket)] text-xs font-bold text-ink-muted">{result.diagnostics?.runs.toLocaleString()} RUNS</div>
        <WinCard code={result.config.homeTeamCode!} label={home?.name[lang] ?? result.config.homeTeamCode!} win={homePct} score={result.averageScore.home} align="left" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-xl border border-line bg-paper-pure p-4 shadow-ticket">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink"><BarChart3 size={16} className="text-plum" />{lang === 'zh' ? '代表性比賽勝率軌跡' : 'Representative game win path'}</div>
          <WinProbabilityChart points={result.winProbabilityCurve} lang={lang} homeLabel={home?.shortName[lang] ?? result.config.homeTeamCode!} awayLabel={away?.shortName[lang] ?? result.config.awayTeamCode!} />
        </div>
        <div className="rounded-xl border border-line bg-paper-pure p-4 shadow-ticket">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink"><Gauge size={16} className="text-plum" />{lang === 'zh' ? '攻守評比' : 'Matchup grades'}</div>
          <div className="space-y-3">{GRADE_KEYS.map((key) => <GradeRow key={key} label={key} away={result.grades.away[key]} home={result.grades.home[key]} />)}</div>
        </div>
      </div>

      {result.keyMatchups.length > 0 && (
        <div className="rounded-xl border border-line bg-paper-pure p-4 shadow-ticket">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Swords size={16} className="text-plum" />
            {lang === 'zh' ? '關鍵對位' : 'Key matchups'}
          </div>
          <ul className="space-y-2">
            {result.keyMatchups.map((matchup) => (
              <li
                key={`${matchup.batterId}-${matchup.pitcherId}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-2 first:border-0 first:pt-0"
              >
                <span className="font-[family-name:var(--font-mono-ticket)] text-lg font-black tabular-nums text-navy">
                  {matchup.expectedWoba?.toFixed(3) ?? '—'}
                </span>
                <span className="min-w-0 flex-1 text-xs leading-relaxed text-ink-soft">
                  {matchup.note[lang]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {result.aiReport.map((section) => <article key={section.heading.en} className="rounded-xl border border-plum/20 bg-plum/[0.03] p-4"><h3 className="text-sm font-bold text-plum">{section.heading[lang]}</h3><p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{section.body[lang]}</p></article>)}
      </div>
      <p className="rounded-lg border border-alert/30 bg-alert-soft px-3 py-2 text-xs leading-relaxed text-alert">{lang === 'zh' ? '此結果使用公開展示的隊伍基準強度模型與隨機模擬，並非真實名單預測；接入已驗證的逐球與名單資料後才可作公開分析引用。' : 'This result uses transparent demo team baselines and stochastic simulation, not a real-roster projection. Replace with verified roster and pitch data before public analysis.'}</p>
    </section>
  );
}

function WinCard({ code, label, win, score, align }: { code: string; label: string; win: string; score: number; align: 'left' | 'right' }) {
  return <div className={align === 'right' ? 'text-right' : ''}><div className="font-[family-name:var(--font-mono-ticket)] text-xs font-bold tracking-[.18em] text-ink-muted">{code}</div><div className="text-sm font-bold text-ink">{label}</div><div className="mt-1 text-4xl font-black text-navy">{win}%</div><div className="text-xs text-ink-muted">AVG {score.toFixed(2)} R</div></div>;
}

function GradeRow({ label, away, home }: { label: string; away: number; home: number }) {
  return <div><div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-ink-muted"><span>{away}</span><span>{label}</span><span>{home}</span></div><div className="flex h-1.5 overflow-hidden rounded-full bg-paper-sunken"><span className="ml-auto bg-navy" style={{ width: `${away / 2}%` }} /><span className="bg-plum" style={{ width: `${home / 2}%` }} /></div></div>;
}
