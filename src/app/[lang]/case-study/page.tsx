import * as React from 'react';
import {
  ArrowRight,
  BookOpen,
  Gauge,
  Newspaper,
  Sparkles,
  Users,
} from 'lucide-react';
import { BullpenBridgePanel } from '@/components/analysis/BullpenBridgePanel';
import { CaseStudyActions } from '@/components/case-study/CaseStudyActions';
import { CrucialPlayAlert, CrucialPlayList } from '@/components/analysis/CrucialPlayAlert';
import { DefenseArgumentPanel } from '@/components/analysis/DefenseArgumentPanel';
import { TempoImpactPanel } from '@/components/analysis/TempoImpactPanel';
import { WinProbabilityChart } from '@/components/analysis/LazyCharts';
import { MatchCard } from '@/components/cards/TeamCard';
import { SnubComparison } from '@/components/rosters/SnubComparison';
import { StatTag } from '@/components/ui/StatTag';
import {
  CASE_BULLPEN,
  CASE_SECTIONS,
  CASE_TEMPO,
  NPB_DEFENSE_DISCOUNT,
} from '@/data/case-studies/wbc2026-jpn-ven';
import {
  DEMO_GAME_REVIEW,
  REAL_CRUCIAL_PLAYS,
  REAL_LINE_SCORE,
  REAL_PITCHING_USAGE,
  REAL_RESULT,
  REAL_SCORING_TIMELINE,
} from '@/data/games/wbc2026-jpn-ven';
import { playerById, rosterFor } from '@/data/rosters';
import { createPitchLimitConfig, getTeam } from '@/lib/constants';
import { bi } from '@/lib/i18n';
import { deltaForSide } from '@/lib/sabermetrics';
import { cn, formatSigned } from '@/lib/utils';
import type { Bilingual, Lang, Player } from '@/types/baseball';

/* ------------------------------------------------------------------ */
/* 球員查找                                                            */
/* ------------------------------------------------------------------ */

const resolvePlayer = (id: string): Player | null => playerById(id);

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

  const venTeam = getTeam('VEN', 2026)!;
  const jpnTeam = getTeam('JPN', 2026)!;

  // 遺珠與守備論證改吃 Phase 1 建好的 2026 日本隊真實名單（其餘敘事段落維持原本手寫的示範情境）。
  const jpnRoster = rosterFor(2026, 'JPN');
  const realSnubs = jpnRoster?.snubs ?? [];
  const realDefenders = JPN_DEFENSIVE_CORE_IDS.map((id) => playerById(id)).filter(
    (p): p is Player => p !== null,
  );

  // 「互動情境模擬」段落仍然用假設性的 DEMO_CRUCIAL_PLAYS 找出模擬情境裡的最大波動。
  const topSimulatedPlay = [...review.crucialPlays].sort(
    (a, b) => Math.abs(b.deltaWinProbability) - Math.abs(a.deltaWinProbability),
  )[0];
  // 「真實關鍵事件」用真實查證到的 6 個事件裡最大波動的一個當作 Hero 卡片與精選卡。
  const topRealPlay = [...REAL_CRUCIAL_PLAYS].sort(
    (a, b) => Math.abs(b.deltaWinProbability) - Math.abs(a.deltaWinProbability),
  )[0];
  const realHomeRunCount = REAL_CRUCIAL_PLAYS.filter((p) => p.category === 'PLAY').length;

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="mb-6">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-plum">
          <BookOpen size={12} />
          {lang === 'zh' ? '核心示範專題' : 'Featured Case Study'}
        </p>

        <MatchCard
          lang={lang}
          title={bi('2026 WBC 日本 vs. 委內瑞拉', '2026 WBC Japan vs. Venezuela')}
          subtitle={bi(
            '戰術復盤 · 65 球限制下的牛棚銜接與節奏控制',
            'Tactical review · bullpen sequencing and tempo control under a 65-pitch limit',
          )}
          badge={bi('專題', 'CASE STUDY')}
          away={{ code: venTeam.code, flagEmoji: venTeam.flagEmoji, name: venTeam.name, colorPrimary: venTeam.colorPrimary }}
          home={{ code: jpnTeam.code, flagEmoji: jpnTeam.flagEmoji, name: jpnTeam.name, colorPrimary: jpnTeam.colorPrimary }}
          fields={[
            { label: bi('賽事', 'Tournament'), value: 'WBC 026' },
            { label: bi('回合', 'Round'), value: 'QF', emphasis: true },
          ]}
        >
          <div className="flex flex-wrap gap-2">
            <StatTag
              lang={lang}
              label={bi('真實比分', 'Real score')}
              value={`${REAL_RESULT.finalScore.away}–${REAL_RESULT.finalScore.home}`}
              footnote={bi('VEN 逆轉淘汰衛冕軍日本', 'VEN upsets defending champion JPN')}
            />
            <StatTag
              lang={lang}
              label={bi('真實最大勝率位移', 'Real max ΔWP')}
              value={formatSigned(topRealPlay.deltaWinProbability * 100, 1)}
              unit="%"
              tone="danger"
            />
            <StatTag
              lang={lang}
              label={bi('真實最高槓桿', 'Real peak LI')}
              value={topRealPlay.leverageIndex.toFixed(2)}
              tone="warn"
            />
            <StatTag
              lang={lang}
              label={bi('全場全壘打', 'Home runs')}
              value={realHomeRunCount}
            />
          </div>
        </MatchCard>

        {/* 真實結果 —— 這場八強賽是真實比賽，跟下方「互動情境模擬」段落刻意分開標示。 */}
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
            ? '⚠️ 「比賽過程」「真實關鍵事件」「真實牛棚使用」「球員遺珠評估」「日本隊守備論證」都是查證過的真實資料（比分/事件來源同上方「真實結果」；守備分項 UZR/DRS/OAA 除外，目前查無可信來源，以說明取代虛構數字）。「互動情境模擬」段落（含決策節點、節奏 Tempo、示範牛棚銜接數字）是假設日本教練在七局下做了另一種調度決定的練習情境，不是真實發生的事，請以段落內的標示為準。'
            : '⚠️ "Game Flow," "Real Crucial Events," "Real Bullpen Usage," "Roster Snubs," and "Japan Defense Argument" are all verified real data (scores/events share the source cited under "Real result" above; the exception is UZR/DRS/OAA defensive components, which have no verified source yet, so a note stands in for invented numbers). The "Interactive What-If Simulation" section (decision points, tempo, and the illustrative bullpen numbers) is a hypothetical exercise imagining a different 7th-inning call — it did not really happen; look for the label on that section.'}
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
              '以下是這場八強賽真實的逐局比分（ESPN boxscore gameId 401845798，交叉核對 CBS Sports 報導），不是總教練模式的模擬情境。',
              'The real inning-by-inning line for this quarterfinal (ESPN boxscore gameId 401845798, cross-checked against CBS Sports) — not the manager-mode simulation.',
            )}
          />

          <div className="overflow-x-auto rounded-[var(--radius-pass)] border border-line bg-paper-pure">
            <table className="w-full min-w-[420px] border-collapse font-[family-name:var(--font-mono-ticket)] text-xs">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="px-3 py-2 text-left font-semibold">{lang === 'zh' ? '隊伍' : 'Team'}</th>
                  {REAL_LINE_SCORE.map((row) => (
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
                  {REAL_LINE_SCORE.map((row) => (
                    <td key={row.inning} className="px-2 py-2 text-center tabular-nums text-ink">
                      {row.away || <span className="text-ink-muted">·</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-base font-black text-navy">{REAL_RESULT.finalScore.away}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-left font-bold text-ink">🇯🇵 JPN</td>
                  {REAL_LINE_SCORE.map((row) => (
                    <td key={row.inning} className="px-2 py-2 text-center tabular-nums text-ink">
                      {row.home || <span className="text-ink-muted">·</span>}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-base font-black text-navy">{REAL_RESULT.finalScore.home}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ol className="mt-4 space-y-2">
            {REAL_SCORING_TIMELINE.map((play, i) => (
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
              '先看這場真實比賽的關鍵事件；下半段則是「總教練模式」的假設情境——如果日本教練在七局下做了另一種調度，勝率曲線與決策會怎麼走。',
              'Start with the real crucial events from the actual game; the second half is the "manager mode" what-if scenario — how the win-probability curve and decision would have gone had Japan\'s manager made a different 7th-inning call.',
            )}
          />

          {/* 真實關鍵事件 */}
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-navy">
            <Newspaper size={15} />
            {lang === 'zh' ? '真實關鍵事件' : 'Real Crucial Events'}
          </h3>
          <div className="mt-3">
            <CrucialPlayAlert play={topRealPlay} lang={lang} featured />
          </div>
          <div className="mt-4">
            <CrucialPlayList
              plays={REAL_CRUCIAL_PLAYS.filter((p) => p.id !== topRealPlay.id)}
              lang={lang}
            />
          </div>

          {/* 真實牛棚使用 */}
          <h3 className="mt-6 text-sm font-bold text-navy">
            {lang === 'zh' ? '真實牛棚使用' : 'Real Bullpen Usage'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {lang === 'zh'
              ? '只列查證到姓名與局數的投手，雙方牛棚其餘未點名的投手不編造。'
              : 'Only pitchers whose name and innings were confirmed by the source are listed — the rest of each bullpen goes unnamed rather than invented.'}
          </p>
          <div className="mt-2 overflow-x-auto rounded-[var(--radius-pass)] border border-line bg-paper-pure">
            <table className="w-full min-w-[480px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="px-3 py-2 text-left font-semibold">{lang === 'zh' ? '投手' : 'Pitcher'}</th>
                  <th className="px-2 py-2 text-center font-semibold">IP</th>
                  <th className="px-2 py-2 text-center font-semibold">H</th>
                  <th className="px-2 py-2 text-center font-semibold">R</th>
                  <th className="px-2 py-2 text-center font-semibold">BB</th>
                  <th className="px-2 py-2 text-center font-semibold">K</th>
                  <th className="px-2 py-2 text-center font-semibold">HR</th>
                  <th className="px-3 py-2 text-center font-semibold">{lang === 'zh' ? '結果' : 'Dec.'}</th>
                </tr>
              </thead>
              <tbody>
                {REAL_PITCHING_USAGE.map((line) => {
                  const pitcher = playerById(line.playerId);
                  return (
                    <tr key={line.playerId} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-2 font-semibold text-ink">
                        {line.side === 'AWAY' ? '🇻🇪' : '🇯🇵'} {pitcher ? pitcher.name[lang] : line.playerId}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.ip.toFixed(1)}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.hitsAllowed}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.runsAllowed}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.walks}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.strikeouts}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-ink">{line.homeRunsAllowed}</td>
                      <td className="px-3 py-2 text-center font-bold text-navy">{line.decision ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 互動情境模擬 */}
          <div className="mt-8 flex items-center gap-2 border-t border-dashed border-line-strong pt-6">
            <Gauge size={15} className="text-plum" />
            <h3 className="text-sm font-bold text-plum">
              {lang === 'zh' ? '互動情境模擬（假設情境，非真實發生）' : 'Interactive What-If Simulation (hypothetical, did not really happen)'}
            </h3>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            {lang === 'zh'
              ? '以下勝率曲線、關鍵轉折點與調度決策，全部來自「如果日本教練在七局下續投先發而非換投」的模擬情境，用來示範總教練模式怎麼運作，不是真實比賽內容。'
              : "The win-probability curve, turning points, and decision comparison below all come from a simulated 'what if the Japanese manager had held his starter instead of changing pitchers in the 7th' scenario — a demo of how manager mode works, not real game content."}
          </p>

          <div className="mt-3">
            <WinProbabilityChart
              points={review.winProbability}
              crucialPlays={review.crucialPlays}
              lang={lang}
              homeLabel="JPN"
              awayLabel="VEN"
              height={320}
            />
          </div>

          <div className="mt-4">
            <CrucialPlayAlert play={topSimulatedPlay} lang={lang} featured />
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
              {lang === 'zh' ? '其餘關鍵轉折點（模擬情境）' : 'Other turning points (simulated)'}
            </h3>
            <CrucialPlayList
              plays={review.crucialPlays.filter((p) => p.id !== topSimulatedPlay.id)}
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
