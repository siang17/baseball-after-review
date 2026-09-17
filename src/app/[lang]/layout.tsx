import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LangProvider } from '@/components/layout/LangProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { HTML_LANG, LANGS, isLang } from '@/lib/i18n';
import type { Lang } from '@/types/baseball';
import '../globals.css';

/** zh / en 兩種語言都在 build 時靜態預先產生。 */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const META: Record<Lang, Metadata> = {
  zh: {
    title: 'Baseball After Review (BAR) — 棒球復盤室',
    description: '重新審視每一顆球的調度潛能。棒球賽事復盤與進階數據分析。',
  },
  en: {
    title: 'Baseball After Review (BAR)',
    description:
      'Reopening every pitch for what it could have been. Baseball game review and advanced analytics.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return META[isLang(lang) ? lang : 'zh'];
}

const FOOTER_NOTE = {
  zh: '目前資料庫載入的是示範資料 (placeholder)，數值未經查證；正式使用請替換為官方來源。',
  en: 'The data currently loaded is placeholder demo data with unverified values; replace it with official sources before real use.',
} as const;

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={HTML_LANG[lang]}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <LangProvider lang={lang}>
          <SiteHeader lang={lang} />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-[11px] leading-relaxed text-ink-muted">
            BAR · Baseball After Review
            <br />
            {FOOTER_NOTE[lang]}
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
