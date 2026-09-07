import * as React from 'react';
import {
  ArrowRight,
  BookOpen,
  Gauge,
  Newspaper,
  PlaneTakeoff,
  Sparkles,
  Users,
} from 'lucide-react';
import { BullpenBridgePanel } from '@/components/analysis/BullpenBridgePanel';
import { CaseStudyActions } from '@/components/case-study/CaseStudyActions';
import { CrucialPlayAlert, CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { DefenseArgumentPanel } from '@/components/analysis/DefenseArgumentPanel';
import { TempoImpactPanel } from '@/components/analysis/TempoImpactPanel';
import { WinProbabilityChart } from '@/components/analysis/LazyCharts';
import { BoardingPassCard } from '@/components/boarding/BoardingPassCard';
import { SnubComparison } from '@/components/rosters/SnubComparison';
import { BaggageTag } from '@/components/ui/BaggageTag';
import {
  CASE_BULLPEN,
  CASE_SECTIONS,
  CASE_TEMPO,
  NPB_DEFENSE_DISCOUNT,
} from '@/data/case-studies/wbc2026-jpn-ven';
import { DEMO_GAME_REVIEW, REAL_RESULT } from '@/data/games/wbc2026-jpn-ven';
import { playerById, rosterFor } from '@/data/rosters';
import { DEMO_PLAYERS } from '@/data/rosters/demoPlayers';
import { createPitchLimitConfig } from '@/lib/constants';
import { UI, bi } from '@/lib/i18n';
import { deltaForSide } from '@/lib/sabermetrics';
import { cn, formatSigned } from '@/lib/utils';
import type { Bilingual, Lang, Player, WinProbabilityPoint } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 比賽過程：從勝率曲線反推每半局得分                                  */
/*                                                                     */
/* `DEMO_WIN_PROBABILITY` 的每一點都帶著當下比分快照，同一半局內比分不變，  */
/* 只在半局交接處才變動。用這個特性把逐局比分表跟得分時間軸算出來，       */
/* 不是另外編一組數字 —— 跟頁面其餘地方引用的是同一份資料。              */
/* ------------------------------------------------------------------ */

interface HalfInningRuns {
  inning: number;
  half: 'TOP' | 'BOTTOM';
  awayRuns: number;
  homeRuns: number;
}

function computeHalfInningRuns(
  points: WinProbabilityPoint[],
  finalScore: { home: number; away: number },
): HalfInningRuns[] {
  const groups: Array<{ inning: number; half: 'TOP' | 'BOTTOM'; score: { home: number; away: number } }> = [];
  for (const p of points) {
    const last = groups[groups.length - 1];
    if (!last || last.inning !== p.inning || last.half !== p.half) {
      groups.push({ inning: p.inning, half: p.half, score: p.score });
    }
  }
  return groups.map((g, i) => {
    const next = groups[i + 1]?.score ?? finalScore;
    return {
      inning: g.inning,
      half: g.half,
      awayRuns: next.away - g.score.away,
      homeRuns: next.home - g.score.home,
    };
  });
}

function computeLineScore(halfInnings: HalfInningRuns[]): Array<{ inning: number; away: number; home: number }> {
  const byInning = new Map<number, { away: number; home: number }>();
  for (const h of halfInnings) {
    const entry = byInning.get(h.inning) ?? { away: 0, home: 0 };
    if (h.half === 'TOP') entry.away += h.awayRuns;
    else entry.home += h.homeRuns;
    byInning.set(h.inning, entry);
  }
  return [...byInning.entries()].sort((a, b) => a[0] - b[0]).map(([inning, runs]) => ({ inning, ...runs }));
}

/* ------------------------------------------------------------------ */
/* 球員查找                                                            */
/* ------------------------------------------------------------------ */

/**
 * 節奏控制／牛棚銜接兩節仍引用 `demoPlayers.ts` 的舊示範球員 id（jpn-sp/ven-sp/jpn-cl），
 * 遺珠與守備論證兩節已換成 `src/data/rosters` 的真實 2026 名單，因此兩邊都要能查得到。
 */
const resolvePlayer = (id: string): Player | null =>
  playerById(id) ?? DEMO_PLAYERS.find((p) => p.id === id) ?? null;

/** 真實守位/守備分項用來論證「守備範圍 vs. 低失誤」的日本隊守備核心（捕手/游擊/三壘/中外野）。 */
const JPN_DEFENSIVE_CORE_IDS = ['2026-jpn-c1', '2026-jpn-ss1', '2026-jpn-3b1', '2026-jpn-cf1'];

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

export default async function CaseStudyPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;

  const review = DEMO_GAME_REVIEW;
  const decisionPoint = review.decisionPoints[0];

  // 這些都是建置期就固定的靜態資料，在 Server Component 裡只會算一次，不需要 useMemo。
  const pitchLimit = createPitchLimitConfig(65, true);

  // 遺珠與守備論證改吃 Phase 1 建好的 2026 日本隊真實名單（其餘敘事段落維持原本手寫的示範情境）。
  const jpnRoster = rosterFor(2026, 'JPN');
  const realSnubs = jpnRoster?.snubs ?? [];
  const realDefenders = JPN_DEFENSIVE_CORE_IDS.map((id) => playerById(id)).filter(
    (p): p is Player => p !== null,
  );
  const topPlay = [...review.crucialPlays].sort(
    (a, b) => Math.abs(b.deltaWinProbability) - Math.abs(a.deltaWinProbability),
  )[0];

  // 比賽過程：逐局比分表 + 得分時間軸，兩者都是從 winProbability 反推，不是另存一組數字。
  const finalScore = review.game.finalScore ?? { home: 0, away: 0 };
  const halfInningRuns = computeHalfInningRuns(review.winProbability, finalScore);
  const lineScore = computeLineScore(halfInningRuns);
  const scoringPlays = (() => {
    let runningAway = 0;
    let runningHome = 0;
    return halfInningRuns
      .filter((h) => h.awayRuns > 0 || h.homeRuns > 0)
      .map((h) => {
        runningAway += h.awayRuns;
        runningHome += h.homeRuns;
        const scorer = h.half === 'TOP' ? 'VEN' : 'JPN';
        const runs = h.half === 'TOP' ? h.awayRuns : h.homeRuns;
        return {
          label: bi(
            `第 ${h.inning} 局${h.half === 'TOP' ? '上' : '下'} · ${scorer} 得 ${runs} 分`,
            `Inning ${h.inning} ${h.half === 'TOP' ? 'top' : 'bottom'} · ${scorer} scores ${runs}`,
          ),
          scoreAfter: { away: runningAway, home: runningHome },
        };
      });
  })();

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
          fields={[
            { label: UI.boardingPass.flight, value: 'WBC 026' },
            { label: UI.boardingPass.gate, value: 'C', emphasis: true },
            { label: UI.boardingPass.seat, value: 'QF', emphasis: true },
            { label: UI.boardingPass.boarding, value: '19:00', align: 'right' },
          ]}
          cabin={bi('專題 CASE STUDY', 'CASE STUDY')}
          barcodeSeed="wbc2026-jpn-ven"
          route={{ from: 'VEN', to: 'JPN' }}
          stubBadge="26"
        >
          <div className="flex flex-wrap gap-2">
            <BaggageTag
              lang={lang}
              label={bi('總教練模式結果', 'Manager mode result')}
              value={`${review.game.finalScore?.away}–${review.game.finalScore?.home}`}
              footnote={bi('模擬情境，非真實比分', 'Simulated, not the real score')}
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

        {/* 真實結果 —— 這場八強賽是真實比賽，跟上面「總教練模式」的模擬情境刻意分開標示。 */}
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-navy/25 bg-navy/[0.03] px-3 py-2.5">
          <Newspaper size={15} className="mt-0.5 shrink-0 text-navy" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy">
                {lang === 'zh' ? '真實結果' : 'Real result'}
              </span>
              <span className="font-[family-name:var(--font-mono-ticket)] text-sm font-black text-navy">
                VEN {REAL_RESULT.finalScore.away} – {REAL_RESULT.finalScore.home} JPN
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{REAL_RESULT.summary[lang]}</p>
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-alert/40 bg-alert-soft px-3 py-2 text-xs leading-relaxed text-alert">
          {lang === 'zh'
            ? '⚠️ 上方「真實結果」已查證，但這頁其餘內容（登機證上的「總教練模式結果」、逐局比分、逐球內容、決策節點）都是假設日本總教練在七局下做了另一種調度決定的「總教練模式」情境模擬，不是真實發生的事。「球員遺珠評估」與「日本隊守備論證」兩節使用 2026 日本隊真實名單與真實預測遺珠，守備分項本身仍是示範數字，不可作為真實賽事結論引用。'
            : '⚠️ The "Real result" above is verified. Everything else on this page — the "manager mode result" on the boarding pass, the inning-by-inning score, pitch-by-pitch content, and decision points — is a simulated "manager mode" scenario imagining Japan’s manager making a different 7th-inning call. It did not really happen. The "Roster Snubs" and "Japan Defense Argument" sections use the real 2026 Japan roster and real predicted snubs, but the defensive splits themselves are still illustrative placeholder numbers.'}
        </p>
      </section>

      <SectionNav lang={lang} />

      <div className="space-y-10">
        {/* ---------------- 01 比賽過程 ---------------- */}
        <section id="gameflow" className="scroll-mt-28">
          <SectionHeading
            index={1}
            lang={lang}
            title={CASE_SECTIONS[0].label}
            blurb={bi(
              '以下是「總教練模式」情境的逐局比分，不是真實比分（真實結果見上方 Hero 卡片）——但跟本頁其餘分析引用的是同一份模擬資料，不是另外編的數字。',
              'This is the inning-by-inning line for the "manager mode" simulation, not the real score (see the Real Result callout above) — but it is derived from the same simulated data used across this page, not separately invented numbers.',
            )}
          />

          <div className="overflow-x-auto rounded-[var(--radius-pass)] border border-line bg-paper-pure">
            <table className="w-full min-w-[420px] border-collapse font-[family-name:var(--font-mono-ticket)] text-xs">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="px-3 py-2 text-left font-semibold">{lang === 'zh' ? '隊伍' : 'Team'}</th>
                  {lineScore.map((row) => (
                    <th key={row.inning} className="px-2 py-2 text-center font-semibold">
                      {row.inning}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-bold text-navy">R</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line-strong">
                  <td className="px-3 py-2 text-left font-bold text-ink">🇻🇪 VEN</td>
                  {lineScore.map((row) => (
                    <td key={row.inning} className="px-2 py-2 text-center tabular-nums text-ink">
                      {row.away || <span className="text-ink-muted">·</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-base font-black text-navy">{finalScore.away}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-left font-bold text-ink">🇯🇵 JPN</td>
                  {lineScore.map((row) => (
                    <td key={row.inning} className="px-2 py-2 text-center tabular-nums text-ink">
                      {row.home || <span className="text-ink-muted">·</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-base font-black text-navy">{finalScore.home}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ol className="mt-4 space-y-2">
            {scoringPlays.map((play, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-line bg-paper-pure px-3 py-2 text-xs"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-sunken font-[family-name:var(--font-mono-ticket)] text-[10px] font-bold text-ink-muted">
                  {i + 1}
                </span>
                <span className="flex-1 text-ink">{play.label[lang]}</span>
                <span className="font-[family-name:var(--font-mono-ticket)] text-sm font-bold text-navy">
                  {play.scoreAfter.away}–{play.scoreAfter.home}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- 02 遺珠 ---------------- */}
        <section id="snubs" className="scroll-mt-28">
          <SectionHeading
            index={2}
            lang={lang}
            title={CASE_SECTIONS[1].label}
            blurb={bi(
              '從新聞與數據挑出 3 位未入選的遺珠，逐項對比入選者。重點不在「誰比較強」，而在最終名單暴露了哪一類系統性偏好。',
              'Three players left off the roster, compared category by category against the man who made it. The question is not who is better — it is what the final roster reveals about the selectors\' systematic preferences.',
            )}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {realSnubs.map((snub) => (
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
              ? '三位遺珠橫跨捕手、外野、牛棚三個位置，各自代表一種容易被最終名單低估的價值面向（配球/框選、長打/守備範圍、局數彈性）——真正的取捨不是「誰比較強」，而是名單建構時哪一類價值被系統性看輕。'
              : 'The three snubs span catcher, outfield, and bullpen — each representing a type of value the final roster tends to under-weight (framing, power/range, multi-inning flexibility). The real question is not who is better, but which category of value gets systematically discounted when a roster gets built.'}
          </p>
        </section>

        {/* ---------------- 03 守備論證 ---------------- */}
        <section id="defense" className="scroll-mt-28">
          <SectionHeading
            index={3}
            lang={lang}
            title={CASE_SECTIONS[2].label}
            blurb={bi(
              '日本隊守備核心的 UZR 分項拆解，並套用 NPB → MLB 校正。判斷跨聯盟可信度的關鍵不是 UZR 總值，而是它由哪些分項組成。',
              'A component-level breakdown of Japan\'s defensive core with an NPB → MLB adjustment applied. What survives a league change is not the UZR total — it is which components produced it.',
            )}
          />
          <DefenseArgumentPanel
            players={realDefenders}
            discount={NPB_DEFENSE_DISCOUNT}
            lang={lang}
            heading={bi('守備範圍 vs. 低失誤：價值來源拆解', 'Range vs. error avoidance: where the value comes from')}
          />
        </section>

        {/* ---------------- 04 關鍵 Play ---------------- */}
        <section id="crucial" className="scroll-mt-28">
          <SectionHeading
            index={4}
            lang={lang}
            title={CASE_SECTIONS[3].label}
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
                  {lang === 'zh' ? '模擬情境原始選擇' : "Simulation's baseline call"}
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

        {/* ---------------- 05 節奏 ---------------- */}
        <section id="tempo" className="scroll-mt-28">
          <SectionHeading
            index={5}
            lang={lang}
            title={CASE_SECTIONS[4].label}
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

        {/* ---------------- 06 用球數與牛棚 ---------------- */}
        <section id="bullpen" className="scroll-mt-28">
          <SectionHeading
            index={6}
            lang={lang}
            title={CASE_SECTIONS[5].label}
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

        {/* ---------------- 07 互動體驗 ---------------- */}
        <section id="interactive" className="scroll-mt-28">
          <SectionHeading
            index={7}
            lang={lang}
            title={CASE_SECTIONS[6].label}
            blurb={bi(
              '換你坐上駕駛艙。以客隊總教練身分重做七局下那個決定，或把這支日本隊拉到跨年代對決裡測試。',
              'Your turn in the cockpit. Retake the 7th-inning decision as Venezuela\'s manager, or drop this Japan roster into a cross-era matchup.',
            )}
          />

          <CaseStudyActions lang={lang} />

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
