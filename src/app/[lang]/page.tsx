import Link from 'next/link';
import { ArrowRight, Plane } from 'lucide-react';
import { BoardingPassCard } from '@/components/boarding/BoardingPassCard';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { UI, bi, localePath } from '@/lib/i18n';
import type { Lang } from '@/types/baseball';

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-[calc(var(--radius-pass)+4px)] border border-line bg-paper-pure px-6 py-8">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-plum">
          <Plane size={12} />
          Boarding for Game Analysis
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-navy sm:text-4xl">
          Baseball After Review
        </h1>
        <p className="mt-1 text-lg font-bold text-ink">{UI.brand[lang]}</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          {UI.tagline[lang]}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={localePath(lang, '/matchup')}
            className="flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink"
          >
            {UI.nav.matchup[lang]}
            <ArrowRight size={15} />
          </Link>
          <Link
            href={localePath(lang, '/replay')}
            className="flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-navy hover:text-navy"
          >
            {UI.nav.replay[lang]}
          </Link>
        </div>
      </section>

      {/* 登機證示範 */}
      <section>
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          {lang === 'zh' ? '核心示範專題' : 'Featured Case Study'}
        </h2>
        <Link href={localePath(lang, '/case-study')} className="block transition hover:-translate-y-0.5">
          <BoardingPassCard
            lang={lang}
            title={bi('2026 WBC 日本 vs. 委內瑞拉', '2026 WBC Japan vs. Venezuela')}
            subtitle={bi('戰術復盤 · 65 球限制下的牛棚銜接', 'Tactical review · bullpen sequencing under a 65-pitch limit')}
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
              <BaggageTag lang={lang} label={bi('最大勝率位移', 'Max ΔWP')} value="+26.4" unit="%" tone="danger" />
              <BaggageTag lang={lang} label={bi('最高槓桿', 'Peak LI')} value="3.41" tone="warn" />
              <BaggageTag lang={lang} label={bi('先發用球數', 'Starter pitches')} value="65" unit="/65" />
            </div>
          </BoardingPassCard>
        </Link>
      </section>
    </div>
  );
}
