'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages, PlaneTakeoff } from 'lucide-react';
import { UI } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const NAV = [
  { href: '/', label: UI.nav.home },
  { href: '/rosters', label: UI.nav.rosters },
  { href: '/matchup', label: UI.nav.matchup },
  { href: '/replay', label: UI.nav.replay },
  { href: '/case-study', label: UI.nav.caseStudy },
  { href: '/scatter', label: UI.nav.scatter },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const lang = useAppStore((s) => s.lang);
  const toggleLang = useAppStore((s) => s.toggleLang);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper-pure/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
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
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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

        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-navy hover:text-navy"
          aria-label="Toggle language"
        >
          <Languages size={13} />
          {lang === 'zh' ? 'EN' : '中'}
        </button>
      </div>
    </header>
  );
}
