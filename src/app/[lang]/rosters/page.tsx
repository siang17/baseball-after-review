import { RostersBrowser } from '@/components/rosters/RostersBrowser';
import type { Lang } from '@/types/baseball';

const INTRO = {
  zh: {
    title: '球員名冊 · 球員卡',
    note: '⚠️ 示範資料：姓名／守位／教練職稱為真實名單，統計數字與棒次、輪值分工為示範用虛構值。',
  },
  en: {
    title: 'Rosters · Player Cards',
    note: '⚠️ Placeholder data: names/positions/coaching titles are the real rosters; stats, batting order and rotation roles are illustrative fictional values.',
  },
} as const;

export default async function RostersPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const intro = INTRO[lang];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-navy">{intro.title}</h1>
        <p className="mt-1 text-xs text-ink-muted">{intro.note}</p>
      </header>

      <RostersBrowser />
    </div>
  );
}
