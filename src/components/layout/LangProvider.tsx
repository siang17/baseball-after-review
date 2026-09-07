'use client';

import * as React from 'react';
import type { Lang } from '@/types/baseball';

/**
 * 語言的真正來源是網址的 `[lang]` 區段，由 layout 這個 Server Component 讀出後
 * 往下傳。這個 context 只是為了讓深處的 Client Component（例如逐球復盤那棵樹）
 * 不必一路 prop-drilling —— 它不持有狀態，也不寫 localStorage，
 * 切換語言一律走網址。
 */
const LangContext = React.createContext<Lang | null>(null);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Client Component 讀語言用；Server Component 請直接用 `params.lang`。 */
export function useLang(): Lang {
  const lang = React.useContext(LangContext);
  if (lang === null) {
    throw new Error('useLang() 必須在 <LangProvider> 之內使用。');
  }
  return lang;
}
