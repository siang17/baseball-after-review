'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Gauge,
  PlaneTakeoff,
  Sparkles,
  Users,
} from 'lucide-react';
import { BullpenBridgePanel } from '@/components/analysis/BullpenBridgePanel';
import { CrucialPlayAlert, CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { DefenseArgumentPanel } from '@/components/analysis/DefenseArgumentPanel';
import { TempoImpactPanel } from '@/components/analysis/TempoImpactPanel';
import { WinProbabilityChart } from '@/components/analysis/WinProbabilityChart';
import { BoardingPassCard } from '@/components/boarding/BoardingPassCard';
import { SnubComparison } from '@/components/rosters/SnubComparison';
import { BaggageTag } from '@/components/ui/BaggageTag';
import {
  CASE_BULLPEN,
  CASE_JPN_DEFENDERS,
  CASE_SECTIONS,
  CASE_SNUBS,
  CASE_TEMPO,
  NPB_DEFENSE_DISCOUNT,
} from '@/data/case-studies/wbc2026-jpn-ven';
import { DEMO_GAME_REVIEW } from '@/data/games/wbc2026-jpn-ven';
import { DEMO_PLAYERS } from '@/data/rosters/demoPlayers';
import { createPitchLimitConfig } from '@/lib/constants';
import { bi } from '@/lib/i18n';
import { deltaForSide } from '@/lib/sabermetrics';
import { cn, formatSigned } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useMatchupStore } from '@/store/useMatchupStore';
import { useReplayStore } from '@/store/useReplayStore';
import type { Bilingual, Lang, Player } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 球員查找                                                            */
/* ------------------------------------------------------------------ */

const ALL_PLAYERS: Player[] = [
  ...DEMO_PLAYERS,
  ...CASE_JPN_DEFENDERS,
  ...CASE_SNUBS.map((s) => s.player),
];

const resolvePlayer = (id: string): Player | null =>
  ALL_PLAYERS.find((p) => p.id === id) ?? null;

/* ------------------------------------------------------------------ */
/* 版面小元件                                                          */
/* ------------------------------------------------------------------ */

function SectionHeading({
  index,
  title,
  blurb,
  lang,
}: {
  index: number;
  title: Bilingual;
  blurb: Bilingual;
  lang: Lang;
}) {
  return (
    <header className="mb-4 border-b border-dashed border-line-strong pb-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy font-[family-name:var(--font-mono-ticket)] text-[11px] font-black text-white">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="text-lg font-black text-navy">{title[lang]}</h2>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{blurb[lang]}</p>
    </header>
  );
}

function SectionNav({ lang }: { lang: Lang }) {
  return (
    <nav className="sticky top-[57px] z-20 -mx-4 mb-6 border-b border-line bg-paper/95 px-4 py-2 backdrop-blur">
      <ol className="flex gap-1 overflow-x-auto">
        {CASE_SECTIONS.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-paper-sunken hover:text-navy"
            >
              <span className="font-[family-name:var(--font-mono-ticket)] text-[10px] text-plum">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.label[lang]}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* 頁面                                                                */
/* ------------------------------------------------------------------ */

export default function CaseStudyPage() {
  const router = useRouter();
  const lang = useAppStore((s) => s.lang);

  const setManagerEnabled = useReplayStore((s) => s.setManagerEnabled);
  const setManagerSide = useReplayStore((s) => s.setManagerSide);
  const openDecision = useReplayStore((s) => s.openDecision);
  const setEraMode = useMatchupStore((s) => s.setEraMode);
  const setTeam = useMatchupStore((s) => s.setTeam);
  const setStep = useMatchupStore((s) => s.setStep);

  const review = DEMO_GAME_REVIEW;
  const pitchLimit = React.useMemo(() => createPitchLimitConfig(65, true), []);
  const decisionPoint = review.decisionPoints[0];
  const topPlay = React.useMemo(
    () =>
      [...review.crucialPlays].sort(
        (a, b) => Math.abs(b.deltaWinProbability) - Math.abs(a.deltaWinProbability),
      )[0],
    [review.crucialPlays],
  );

  /** 帶著「客隊總教練 · 七局下決策點」的狀態跳到復盤頁。 */
  const startManagerMode = () => {
    setManagerEnabled(true);
    setManagerSide('AWAY');
    openDecision(decisionPoint);
    router.push('/replay');
  };

  /** 預先設定 2024 中華隊 vs. 2026 日本隊的跨年代對決。 */
  const startCrossEraMatchup = () => {
    setEraMode('2024vs2026');
    setTeam('away', 'TPE');
    setTeam('home', 'JPN');
    setStep('CONFIRM');
    router.push('/matchup');
  };

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="mb-6">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-plum">
          <BookOpen size={12} />
          {lang === 'zh' ? '核心示範專題' : 'Featured Case Study'}
        </p>

        <BoardingPassCard
          lang={lang}
          title={bi('2026 WBC 日本 vs. 委內瑞拉', '2026 WBC Japan vs. Venezuela')}
          subtitle={bi(
            '戰術復盤 · 65 球限制下的牛棚銜接與節奏控制',
            'Tactical review · bullpen sequencing and tempo control under a 65-pitch limit',
          )}
          flightNo="WBC 026"
          gate="C"
          seat="QF"
          cabin={bi('專題 CASE STUDY', 'CASE STUDY')}
          boardingTime="19:00"
          barcodeSeed="wbc2026-jpn-ven"
          route={{ from: 'VEN', to: 'JPN' }}
          stubBadge="26"
        >
          <div className="flex flex-wrap gap-2">
            <BaggageTag
              lang={lang}
              label={bi('最終比分', 'Final')}
              value={`${review.game.finalScore?.away}–${review.game.finalScore?.home}`}
              footnote={bi('主隊日本勝', 'Home (JPN) win')}
            />
            <BaggageTag
              lang={lang}
              label={bi('最大勝率位移', 'Max ΔWP')}
              value={formatSigned(topPlay.deltaWinProbability * 100, 1)}
              unit="%"
              tone="danger"
            />
            <BaggageTag
              lang={lang}
              label={bi('最高槓桿', 'Peak LI')}
              value={topPlay.leverageIndex.toFixed(2)}
              tone="warn"
            />
            <BaggageTag
              lang={lang}
              label={bi('計時器違規', 'Clock violations')}
              value={review.clockViolations.length}
            />
          </div>
        </BoardingPassCard>

        <p className="mt-3 rounded-lg border border-alert/40 bg-alert-soft px-3 py-2 text-xs leading-relaxed text-alert">
          {lang === 'zh'
            ? '⚠️ 本專題全為示範資料：球員以「示範 XX」代稱，數值為虛構，新聞出處留空。內容用於驗證分析框架與版面，不可作為真實賽事結論引用。'
            : '⚠️ Everything on this page is placeholder data: players are labelled "Demo XX", the numbers are invented, and news sources are left blank. It exists to validate the analysis framework and layout — do not cite it as real findings.'}
        </p>
      </section>

      <SectionNav lang={lang} />

      <div className="space-y-10">
        {/* ---------------- 01 遺珠 ---------------- */}
        <section id="snubs" className="scroll-mt-28">
          <SectionHeading
            index={1}
            lang={lang}
            title={CASE_SECTIONS[0].label}
            blurb={bi(
              '從新聞與數據挑出 3 位未入選的遺珠，逐項對比入選者。重點不在「誰比較強」，而在最終名單暴露了哪一類系統性偏好。',
              'Three players left off the roster, compared category by category against the man who made it. The question is not who is better — it is what the final roster reveals about the selectors\' systematic preferences.',
            )}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {CASE_SNUBS.map((snub) => (
              <SnubComparison
                key={snub.player.id}
                snub={snub}
                resolvePlayer={resolvePlayer}
                lang={lang}
              />
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-paper-sunken px-3 py-2 text-xs leading-relaxed text-ink-soft">
            {lang === 'zh'
              ? '三位遺珠的共同點：守備與跑壘領先、打擊產能略遜。在 65 球限制造成的低比分賽制下，一分的守備價值與一分的打擊價值等重 —— 兩隊的選訓邏輯都低估了前者。'
              : 'The three snubs share a shape: better defense and baserunning, slightly worse bats. In a low-scoring format shaped by the 65-pitch limit, a run saved is worth exactly a run created — and both selection committees under-weighted the former.'}
          </p>
        </section>

        {/* ---------------- 02 守備論證 ---------------- */}
        <section id="defense" className="scroll-mt-28">
          <SectionHeading
            index={2}
            lang={lang}
            title={CASE_SECTIONS[1].label}
            blurb={bi(
              '日本隊守備核心的 UZR 分項拆解，並套用 NPB → MLB 校正。判斷跨聯盟可信度的關鍵不是 UZR 總值，而是它由哪些分項組成。',
              'A component-level breakdown of Japan\'s defensive core with an NPB → MLB adjustment applied. What survives a league change is not the UZR total — it is which components produced it.',
            )}
          />
          <DefenseArgumentPanel
            players={CASE_JPN_DEFENDERS}
            discount={NPB_DEFENSE_DISCOUNT}
            lang={lang}
            heading={bi('守備範圍 vs. 低失誤：價值來源拆解', 'Range vs. error avoidance: where the value comes from')}
          />
        </section>

        {/* ---------------- 03 關鍵 Play ---------------- */}
        <section id="crucial" className="scroll-mt-28">
          <SectionHeading
            index={3}
            lang={lang}
            title={CASE_SECTIONS[2].label}
            blurb={bi(
              '全場勝率曲線與最高 ΔWP 的一球。七局下的失分不是失投的意外，而是一連串可預期條件的匯流：第三輪打序、58 球、LI 3.41。',
              'The full win-probability curve and the single largest swing. The 7th-inning breakdown was not a fluke mistake pitch — it was the convergence of three predictable conditions: third time through, 58 pitches, an LI of 3.41.',
            )}
          />

          <WinProbabilityChart
            points={review.winProbability}
            crucialPlays={review.crucialPlays}
            lang={lang}
            homeLabel="JPN"
            awayLabel="VEN"
            height={320}
          />

          <div className="mt-4">
            <CrucialPlayAlert play={topPlay} lang={lang} featured />
          </div>

          {/* 調度解析 */}
          <div className="mt-4 rounded-[var(--radius-pass)] border border-line bg-paper-pure p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-navy">
                <Users size={15} />
                {lang === 'zh' ? '調度解析：續投 vs. 換投' : 'The call: hold vs. change'}
              </h3>
              <span className="rounded-full bg-paper-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {lang === 'zh'
                  ? '勝率以客隊（委內瑞拉）視角'
                  : 'ΔWP from Venezuela\'s (away) perspective'}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {decisionPoint.situation[lang]}
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-paper p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  {lang === 'zh' ? '歷史真實選擇' : 'Historical call'}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">
                  {decisionPoint.historical.option.label[lang]}
                </div>
                <div className="mt-1 font-[family-name:var(--font-mono-ticket)] text-2xl font-black text-plum">
                  {formatSigned(
                    deltaForSide(decisionPoint.historical.deltaWp, decisionPoint.side) * 100,
                    1,
                  )}
                  %
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {decisionPoint.historical.rationale[lang]}
                </p>
              </div>

              <div className="rounded-lg border border-plum/30 bg-plum/[0.03] p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-plum">
                  {lang === 'zh' ? 'AI 數據最佳解' : 'Optimal sabermetric call'}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">
                  {decisionPoint.aiOptimal.option.label[lang]}
                </div>
                <div className="mt-1 font-[family-name:var(--font-mono-ticket)] text-2xl font-black text-emerald-700">
                  {formatSigned(
                    deltaForSide(decisionPoint.aiOptimal.deltaWp, decisionPoint.side) * 100,
                    1,
                  )}
                  %
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {decisionPoint.aiOptimal.rationale[lang]}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
              {lang === 'zh' ? '其餘關鍵轉折點' : 'Other turning points'}
            </h3>
            <CrucialPlayList
              plays={review.crucialPlays.filter((p) => p.id !== topPlay.id)}
              lang={lang}
            />
          </div>
        </section>

        {/* ---------------- 04 節奏 ---------------- */}
        <section id="tempo" className="scroll-mt-28">
          <SectionHeading
            index={4}
            lang={lang}
            title={CASE_SECTIONS[3].label}
            blurb={bi(
              'Pitch Timer 與 PitchCom 對投打節奏的實際影響。把「被計時器逼快出手」的球獨立成一組，就能看出節奏損失是否轉化為投球品質下降。',
              'What the pitch timer and PitchCom actually did to the rhythm of this game. Isolating pitches released under three seconds shows whether lost tempo turned into lost stuff.',
            )}
          />
          <TempoImpactPanel
            impacts={CASE_TEMPO}
            resolvePlayer={resolvePlayer}
            lang={lang}
          />
        </section>

        {/* ---------------- 05 用球數與牛棚 ---------------- */}
        <section id="bullpen" className="scroll-mt-28">
          <SectionHeading
            index={5}
            lang={lang}
            title={CASE_SECTIONS[4].label}
            blurb={bi(
              '65 球上限下的換投時機檢討。關鍵不在「有沒有超過上限」，而在休息天數的級距 —— 投滿 50 球之後，續投的保留價值已經歸零。',
              'Reviewing when each side went to the bullpen under the 65-pitch cap. The binding constraint is not the cap itself but the rest tiers: past 50 pitches, there is nothing left to preserve by leaving him in.',
            )}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {CASE_BULLPEN.map((plan) => (
              <BullpenBridgePanel
                key={plan.side}
                plan={plan}
                resolvePlayer={resolvePlayer}
                pitchLimit={pitchLimit}
                teamLabel={
                  plan.side === 'HOME'
                    ? lang === 'zh'
                      ? '日本隊（主）· 牛棚銜接'
                      : 'Japan (home) · bullpen bridge'
                    : lang === 'zh'
                      ? '委內瑞拉（客）· 牛棚銜接'
                      : 'Venezuela (away) · bullpen bridge'
                }
                lang={lang}
              />
            ))}
          </div>
        </section>

        {/* ---------------- 06 互動體驗 ---------------- */}
        <section id="interactive" className="scroll-mt-28">
          <SectionHeading
            index={6}
            lang={lang}
            title={CASE_SECTIONS[5].label}
            blurb={bi(
              '換你坐上駕駛艙。以客隊總教練身分重做七局下那個決定，或把這支日本隊拉到跨年代對決裡測試。',
              'Your turn in the cockpit. Retake the 7th-inning decision as Venezuela\'s manager, or drop this Japan roster into a cross-era matchup.',
            )}
          />

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
                  ? '直接跳到七局下二出局一二壘、LI 3.41 的決策點，送出後對比歷史選擇與 AI 最佳解。'
                  : 'Jumps straight to the bottom of the 7th — two outs, runners on first and second, LI 3.41 — then compares your call against the historical and optimal ones.'}
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
                  ? '跨年代對決：2024 中華隊 vs. 2026 日本隊'
                  : 'Cross-era: 2024 Chinese Taipei vs. 2026 Japan'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {lang === 'zh'
                  ? '以 12 強冠軍中華隊對上這支日本隊，套用年代校正與 65 球規則後推演勝率。'
                  : 'Puts the Premier12 champions against this Japan roster with era adjustment and the 65-pitch rule applied.'}
              </p>
              <span className="mt-3 flex items-center gap-1 text-xs font-bold text-navy">
                <PlaneTakeoff size={13} />
                {lang === 'zh' ? '前往訂位確認頁' : 'Go to the booking confirmation'}
              </span>
            </button>
          </div>

          <p className="mt-3 rounded-lg bg-paper-sunken px-3 py-2 text-xs leading-relaxed text-ink-soft">
            {lang === 'zh'
              ? '註：對決模擬的後端（蒙地卡羅推演與 AI 戰術報告）尚未接上，確認頁的「確認開賽」目前只會輸出設定值到 console。'
              : 'Note: the simulation backend (Monte Carlo runs plus the AI tactical report) is not wired up yet — "Confirm & Simulate" currently just logs the config to the console.'}
          </p>
        </section>
      </div>
    </div>
  );
}
