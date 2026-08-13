'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '@/types/baseball';

interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

/** 全站偏好設定（語言）。持久化到 localStorage。 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'zh',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'zh' ? 'en' : 'zh' }),
    }),
    {
      name: 'bar-app-prefs',
      /**
       * SSR 先以預設 'zh' 輸出；若這裡同步讀 localStorage，
       * 首次 client render 可能是 'en' 而與伺服器 HTML 不一致。
       * 因此改為掛載後再 rehydrate（見 StoreHydration）。
       */
      skipHydration: true,
    },
  ),
);

/** 讀語言的簡寫 hook。 */
export const useLang = (): Lang => useAppStore((s) => s.lang);
