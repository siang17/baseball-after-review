'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages, PlaneTakeoff } from 'lucide-react';
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

/**
 * 導覽列。語言由 layout 以 prop 傳入（來源是網址的 `[lang]` 區段），
 * 切換語言就是導到同一條路徑的另一種語言版本。
 * 仍是 Client Component，因為要用 `usePathname()` 判斷目前所在頁。
 */
export function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const home = localePath(lang, '/');
  const otherLang: Lang = lang === 'zh' ? 'en' : 'zh';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper-pure/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={home} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-white">
            <PlaneTakeoff size={16} />
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

        <Link
          href={swapLangInPath(pathname, otherLang)}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-navy hover:text-navy"
          aria-label="Toggle language"
          hrefLang={otherLang}
        >
          <Languages size={13} />
          {lang === 'zh' ? 'EN' : '中'}
        </Link>
      </div>
    </header>
  );
}
