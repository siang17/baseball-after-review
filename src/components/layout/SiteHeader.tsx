'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Activity, Languages } from 'lucide-react';
import { UI, localePath, swapLangInPath } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Lang } from '@/types/baseball';

const NAV = [
  { href: '/', label: UI.nav.home },
  { href: '/rosters', label: UI.nav.rosters },
  { href: '/matchup', label: UI.nav.matchup },
  { href: '/replay', label: UI.nav.replay },
  { href: '/case-study', label: UI.nav.caseStudy },
  { href: '/scatter', label: UI.nav.scatter },
] as const;

function LangToggleIcon() {
  return <Languages size={13} />;
}

const toggleClassName =
  'flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-navy hover:text-navy';

/**
 * 語言切換連結本體。獨立成子元件是因為 `useSearchParams()` 需要包在 Suspense
 * 裡才不會讓整個（靜態預先產生的）layout 被迫改成動態渲染 —— 只有這一小塊
 * 選擇跟著 query string 動態渲染，例如 `/replay?game=...` 深連結帶著參數
 * 切換語言時，`?game=...` 不會被丟掉。
 */
function LangToggleLink({ pathname, lang }: { pathname: string; lang: Lang }) {
  const searchParams = useSearchParams();
  const otherLang: Lang = lang === 'zh' ? 'en' : 'zh';
  const query = searchParams.toString();
  const href = swapLangInPath(pathname, otherLang) + (query ? `?${query}` : '');

  return (
    <Link href={href} className={toggleClassName} aria-label="Toggle language" hrefLang={otherLang}>
      <LangToggleIcon />
      {lang === 'zh' ? 'EN' : '中'}
    </Link>
  );
}

/** 沒有 query string 時的靜態版本，當 Suspense fallback，避免多一次版面跳動。 */
function LangToggleFallback({ pathname, lang }: { pathname: string; lang: Lang }) {
  const otherLang: Lang = lang === 'zh' ? 'en' : 'zh';
  return (
    <Link
      href={swapLangInPath(pathname, otherLang)}
      className={toggleClassName}
      aria-label="Toggle language"
      hrefLang={otherLang}
    >
      <LangToggleIcon />
      {lang === 'zh' ? 'EN' : '中'}
    </Link>
  );
}

/**
 * 導覽列。語言由 layout 以 prop 傳入（來源是網址的 `[lang]` 區段），
 * 切換語言就是導到同一條路徑的另一種語言版本。
 * 仍是 Client Component，因為要用 `usePathname()` 判斷目前所在頁。
 */
export function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const home = localePath(lang, '/');

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper-pure/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={home} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-white">
            <Activity size={16} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-tight text-navy">BAR</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {UI.brand[lang]}
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {NAV.map((item) => {
            const href = localePath(lang, item.href);
            const active = item.href === '/' ? pathname === home : pathname.startsWith(href);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active ? 'bg-navy text-white' : 'text-ink-muted hover:bg-paper hover:text-ink',
                )}
              >
                {item.label[lang]}
              </Link>
            );
          })}
        </nav>

        <React.Suspense fallback={<LangToggleFallback pathname={pathname} lang={lang} />}>
          <LangToggleLink pathname={pathname} lang={lang} />
        </React.Suspense>
      </div>
    </header>
  );
}
