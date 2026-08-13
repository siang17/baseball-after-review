'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * 在掛載後才還原持久化的偏好設定，避免 SSR / CSR 首次渲染不一致。
 */
export function StoreHydration() {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return null;
}
