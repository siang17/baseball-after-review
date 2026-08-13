import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { StoreHydration } from '@/components/layout/StoreHydration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Baseball After Review (BAR) — 棒球復盤室',
  description:
    'Boarding for Game Analysis — 重新審視每一顆球的調度潛能。棒球賽事復盤與進階數據分析。',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <StoreHydration />
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-[11px] leading-relaxed text-ink-muted">
          BAR · Baseball After Review — Boarding for Game Analysis
          <br />
          目前資料庫載入的是示範資料 (placeholder)，數值未經查證；正式使用請替換為官方來源。
        </footer>
      </body>
    </html>
  );
}
