'use client';

import { create } from 'zustand';
import type {
  Era,
  EraMode,
  MatchupModeConfig,
  MatchupSimulationResult,
  MatchupStep,
  PitchLimitPreset,
  TeamCode,
} from '@/types/baseball';

/** eraMode → [客隊年份, 主隊年份] */
export const ERA_MODE_YEARS: Record<EraMode, [Era, Era]> = {
  '2024vs2024': [2024, 2024],
  '2026vs2026': [2026, 2026],
  '2024vs2026': [2024, 2026],
};

const initialConfig: MatchupModeConfig = {
  eraMode: '2026vs2026',
  awayTeamYear: 2026,
  homeTeamYear: 2026,
  awayTeamCode: null,
  homeTeamCode: null,
  venue: 'NEUTRAL',
  applyEraAdjustment: true,
  pitchLimitPreset: 65,
  simulationRuns: 10000,
};

interface MatchupState {
  step: MatchupStep;
  config: MatchupModeConfig;
  result: MatchupSimulationResult | null;
  isSimulating: boolean;

  setStep: (step: MatchupStep) => void;
  /** 選年代模式時會清空已選隊伍，避免留下錯年份的球隊。 */
  setEraMode: (mode: EraMode) => void;
  setTeam: (side: 'home' | 'away', code: TeamCode | null) => void;
  swapSides: () => void;
  setVenue: (venue: MatchupModeConfig['venue']) => void;
  setEraAdjustment: (on: boolean) => void;
  setPitchLimitPreset: (preset: PitchLimitPreset) => void;
  setResult: (result: MatchupSimulationResult | null) => void;
  setSimulating: (v: boolean) => void;
  reset: () => void;
}

export const useMatchupStore = create<MatchupState>()((set, get) => ({
  step: 'SELECT_ERA',
  config: initialConfig,
  result: null,
  isSimulating: false,

  setStep: (step) => set({ step }),

  setEraMode: (mode) => {
    const [awayTeamYear, homeTeamYear] = ERA_MODE_YEARS[mode];
    set({
      config: {
        ...get().config,
        eraMode: mode,
        awayTeamYear,
        homeTeamYear,
        awayTeamCode: null,
        homeTeamCode: null,
        // 跨年代對決預設開啟校正。
        applyEraAdjustment: mode === '2024vs2026',
      },
      result: null,
    });
  },

  setTeam: (side, code) =>
    set({
      config: {
        ...get().config,
        [side === 'home' ? 'homeTeamCode' : 'awayTeamCode']: code,
      },
      result: null,
    }),

  swapSides: () => {
    const c = get().config;
    set({
      config: {
        ...c,
        homeTeamCode: c.awayTeamCode,
        awayTeamCode: c.homeTeamCode,
        homeTeamYear: c.awayTeamYear,
        awayTeamYear: c.homeTeamYear,
      },
      result: null,
    });
  },

  setVenue: (venue) => set({ config: { ...get().config, venue } }),
  setEraAdjustment: (applyEraAdjustment) =>
    set({ config: { ...get().config, applyEraAdjustment } }),
  setPitchLimitPreset: (pitchLimitPreset) =>
    set({ config: { ...get().config, pitchLimitPreset } }),
  setResult: (result) => set({ result }),
  setSimulating: (isSimulating) => set({ isSimulating }),
  reset: () => set({ step: 'SELECT_ERA', config: initialConfig, result: null }),
}));
