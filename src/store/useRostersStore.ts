'use client';

import { create } from 'zustand';
import type { Era, TeamCode } from '@/types/baseball';

/**
 * 名單頁的瀏覽位置（年代 → 隊伍）。
 *
 * 放在 store 而不是元件裡，是為了讓切換語言時不會被打回起點：
 * 語言是網址的一部分，`/zh/rosters` → `/en/rosters` 是一次真正的導覽，
 * 元件會重新掛載，但 zustand store 是 module singleton，能跨導覽存活。
 */
interface RostersState {
  era: Era | null;
  teamCode: TeamCode | null;

  selectEra: (era: Era) => void;
  selectTeam: (teamCode: TeamCode) => void;
  /** 回到隊伍選單。 */
  clearTeam: () => void;
  /** 回到年代選單。 */
  clearEra: () => void;
}

export const useRostersStore = create<RostersState>()((set) => ({
  era: null,
  teamCode: null,

  // 換年代時一併清掉隊伍，避免留下不屬於該年代的隊伍。
  selectEra: (era) => set({ era, teamCode: null }),
  selectTeam: (teamCode) => set({ teamCode }),
  clearTeam: () => set({ teamCode: null }),
  clearEra: () => set({ era: null, teamCode: null }),
}));
