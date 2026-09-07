'use client';

import { create } from 'zustand';
import type {
  DecisionPoint,
  Era,
  Game,
  ManagerModeConfig,
  MatchState,
  OverweightBaggageAlert,
  PitchComConfig,
  PitchLimitConfig,
  PitchLimitPreset,
  PitchTimerConfig,
  Side,
  UserDecisionRecord,
} from '@/types/baseball';
import { createPitchLimitConfig, restDaysFor } from '@/lib/constants';
import { bi } from '@/lib/i18n';

const defaultManagerMode: ManagerModeConfig = {
  enabled: false,
  profileId: 'CUSTOM',
  side: 'HOME',
  triggers: {
    minLeverageIndex: 1.5,
    fromInning: 6,
    onPitchLimitThreshold: true,
    onTtopThreshold: true,
    onRunnersInScoringPosition: false,
  },
  hideHistoricalUntilAnswered: true,
  showOptimalCall: true,
};

const defaultTimer: PitchTimerConfig = {
  enabled: true,
  emptyBasesSec: 15,
  runnersOnSec: 20,
  batterReadySec: 8,
  soundEnabled: false,
};

const defaultPitchCom: PitchComConfig = {
  enabled: true,
  showTimeline: true,
  malfunctionRate: 0,
};

/** 復盤頁的四個步驟：選比賽 → 選打線模式 → 編打線 → 逐球復盤。 */
export type ReplayFlowStep = 'SELECT_GAME' | 'CHOOSE_MODE' | 'EDIT_LINEUP' | 'REVIEW';

export interface SelectGamePayload {
  era: Era;
  game: Game;
  homeLineup: string[];
  awayLineup: string[];
  homePitcher: string;
  awayPitcher: string;
  /** 由 ?game=... 深連結進來時直接跳到逐球復盤。 */
  skipToReview?: boolean;
}

interface ReplayState {
  /* ---------------------------------------------------------------- */
  /* 復盤流程                                                          */
  /*                                                                   */
  /* 這些原本是 ReplayPage 的 useState。語言是網址的一部分，            */
  /* `/zh/replay` → `/en/replay` 是一次真正的導覽，元件會重新掛載；     */
  /* 放進 store（module singleton）之後，切換語言不會把使用者          */
  /* 打回選比賽的畫面。                                                */
  /* ---------------------------------------------------------------- */
  flowStep: ReplayFlowStep;
  /** 選比賽畫面上正在看哪一屆賽程的分頁（跟 `era` 不同，`era` 是已選定比賽的年份）。 */
  scheduleEra: Era;
  era: Era;
  game: Game | null;
  homeLineup: string[];
  awayLineup: string[];
  homePitcher: string;
  awayPitcher: string;
  /** 每按一次「重新產生」就 +1，用來換掉模擬的亂數種子。 */
  seedNonce: number;

  setFlowStep: (step: ReplayFlowStep) => void;
  setScheduleEra: (era: Era) => void;
  /**
   * 選定一場比賽。打線／先發投手由呼叫端從名單算好再傳進來 —— store 刻意不 import
   * `@/data/rosters`，否則任何 import 這個 store 的 client island（例如專題頁的 CTA）
   * 都會把 12 隊名單整包拉進自己的 bundle。
   */
  selectGame: (payload: SelectGamePayload) => void;
  setHomeLineup: (ids: string[]) => void;
  setAwayLineup: (ids: string[]) => void;
  setHomePitcher: (id: string) => void;
  setAwayPitcher: (id: string) => void;
  /** 同一組設定換一組模擬結果。 */
  regenerate: () => void;

  /** 目前播放到第幾球（index of GameReview.pitches）。 */
  cursor: number;
  isPlaying: boolean;
  playbackSpeed: 0.5 | 1 | 2 | 4;

  managerMode: ManagerModeConfig;
  selectedLineup: string[];
  defenseAssignments: Record<string, import('@/types/baseball').Position>;
  selectionFilters: Array<'OFFENSE' | 'DEFENSE' | 'SPEED'>;
  pitchTimer: PitchTimerConfig;
  pitchCom: PitchComConfig;
  pitchLimit: PitchLimitConfig;

  /** 目前彈出的決策節點（null = 未暫停）。 */
  activeDecision: DecisionPoint | null;
  decisionLog: UserDecisionRecord[];
  /** 目前的超重行李警示。 */
  baggageAlert: OverweightBaggageAlert | null;

  setCursor: (i: number) => void;
  step: (delta: number) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (s: ReplayState['playbackSpeed']) => void;

  setManagerEnabled: (v: boolean) => void;
  setManagerSide: (side: Side) => void;
  setManagerProfile: (profileId: import('@/types/baseball').ManagerProfileId) => void;
  setSelectedLineup: (playerIds: string[]) => void;
  moveLineupPlayer: (playerId: string, direction: -1 | 1) => void;
  setDefenseAssignment: (playerId: string, position: import('@/types/baseball').Position) => void;
  toggleSelectionFilter: (filter: 'OFFENSE' | 'DEFENSE' | 'SPEED') => void;
  updateManagerTriggers: (patch: Partial<ManagerModeConfig['triggers']>) => void;

  setTimer: (patch: Partial<PitchTimerConfig>) => void;
  setPitchCom: (patch: Partial<PitchComConfig>) => void;
  setPitchLimitPreset: (preset: PitchLimitPreset) => void;
  setPitchLimitEnabled: (v: boolean) => void;

  openDecision: (dp: DecisionPoint) => void;
  resolveDecision: (record: UserDecisionRecord) => void;
  dismissDecision: () => void;

  /** 依用球數評估是否要跳出「行李超重」卡片。 */
  evaluatePitchCount: (pitcherId: string, pitchCount: number) => void;
  dismissBaggageAlert: () => void;

  /** 判斷目前狀態是否應暫停等待總教練決策。 */
  shouldPause: (state: MatchState) => boolean;
}

export const useReplayStore = create<ReplayState>()((set, get) => ({
  flowStep: 'SELECT_GAME',
  scheduleEra: 2026,
  era: 2026,
  game: null,
  homeLineup: [],
  awayLineup: [],
  homePitcher: '',
  awayPitcher: '',
  seedNonce: 0,

  setFlowStep: (flowStep) => set({ flowStep }),
  setScheduleEra: (scheduleEra) => set({ scheduleEra }),

  selectGame: ({ skipToReview, ...selection }) =>
    set({
      ...selection,
      flowStep: skipToReview ? 'REVIEW' : 'CHOOSE_MODE',
      cursor: 0,
    }),

  setHomeLineup: (homeLineup) => set({ homeLineup }),
  setAwayLineup: (awayLineup) => set({ awayLineup }),
  setHomePitcher: (homePitcher) => set({ homePitcher }),
  setAwayPitcher: (awayPitcher) => set({ awayPitcher }),
  regenerate: () => set({ seedNonce: get().seedNonce + 1, cursor: 0 }),

  cursor: 0,
  isPlaying: false,
  playbackSpeed: 1,

  managerMode: defaultManagerMode,
  selectedLineup: ['candidate-1', 'candidate-2', 'candidate-3', 'candidate-4', 'candidate-5', 'candidate-6', 'candidate-7', 'candidate-8', 'candidate-9'],
  defenseAssignments: { 'candidate-1': 'CF', 'candidate-2': 'SS', 'candidate-3': '3B', 'candidate-4': '1B', 'candidate-5': 'RF', 'candidate-6': 'LF', 'candidate-7': '2B', 'candidate-8': 'C', 'candidate-9': 'DH' },
  selectionFilters: ['DEFENSE'],
  pitchTimer: defaultTimer,
  pitchCom: defaultPitchCom,
  pitchLimit: createPitchLimitConfig(65, true),

  activeDecision: null,
  decisionLog: [],
  baggageAlert: null,

  setCursor: (cursor) => set({ cursor: Math.max(0, cursor) }),
  step: (delta) => set({ cursor: Math.max(0, get().cursor + delta) }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setManagerEnabled: (enabled) =>
    set({ managerMode: { ...get().managerMode, enabled } }),
  setManagerSide: (side) => set({ managerMode: { ...get().managerMode, side } }),
  setManagerProfile: (profileId) => set({ managerMode: { ...get().managerMode, profileId, enabled: true } }),
  setSelectedLineup: (selectedLineup) => set({ selectedLineup: selectedLineup.slice(0, 9) }),
  moveLineupPlayer: (playerId, direction) => set((state) => {
    const from = state.selectedLineup.indexOf(playerId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= state.selectedLineup.length) return state;
    const selectedLineup = [...state.selectedLineup];
    [selectedLineup[from], selectedLineup[to]] = [selectedLineup[to], selectedLineup[from]];
    return { selectedLineup };
  }),
  setDefenseAssignment: (playerId, position) => set({ defenseAssignments: { ...get().defenseAssignments, [playerId]: position } }),
  toggleSelectionFilter: (filter) => set((state) => ({ selectionFilters: state.selectionFilters.includes(filter) ? state.selectionFilters.filter((f) => f !== filter) : [...state.selectionFilters, filter] })),
  updateManagerTriggers: (patch) =>
    set({
      managerMode: {
        ...get().managerMode,
        triggers: { ...get().managerMode.triggers, ...patch },
      },
    }),

  setTimer: (patch) => set({ pitchTimer: { ...get().pitchTimer, ...patch } }),
  setPitchCom: (patch) => set({ pitchCom: { ...get().pitchCom, ...patch } }),

  setPitchLimitPreset: (preset) =>
    set({ pitchLimit: createPitchLimitConfig(preset, get().pitchLimit.enabled) }),
  setPitchLimitEnabled: (enabled) =>
    set({ pitchLimit: { ...get().pitchLimit, enabled } }),

  openDecision: (dp) => set({ activeDecision: dp, isPlaying: false }),
  resolveDecision: (record) =>
    set({
      activeDecision: null,
      decisionLog: [...get().decisionLog, record],
    }),
  dismissDecision: () => set({ activeDecision: null }),

  evaluatePitchCount: (pitcherId, pitchCount) => {
    const config = get().pitchLimit;
    if (!config.enabled || config.limit === null) {
      if (get().baggageAlert) set({ baggageAlert: null });
      return;
    }

    const restDays = restDaysFor(pitchCount, config);

    if (pitchCount >= config.limit) {
      set({
        isPlaying: false,
        baggageAlert: {
          pitcherId,
          pitchCount,
          limit: config.limit,
          mandatoryRestDays: restDays,
          nextAvailableDate: null,
          severity: 'MANDATORY_REMOVAL',
          message: bi(
            `已達 ${config.limit} 球上限，強制退場並休息 ${restDays} 天。`,
            `Reached the ${config.limit}-pitch limit — mandatory removal, ${restDays} days rest.`,
          ),
        },
      });
      return;
    }

    if (pitchCount >= config.warningThreshold) {
      set({
        baggageAlert: {
          pitcherId,
          pitchCount,
          limit: config.limit,
          mandatoryRestDays: restDays,
          nextAvailableDate: null,
          severity: 'WARNING',
          message: bi(
            `距離 ${config.limit} 球上限剩 ${config.limit - pitchCount} 球，牛棚請開始準備。`,
            `${config.limit - pitchCount} pitches from the ${config.limit} limit — start the bullpen.`,
          ),
        },
      });
      return;
    }

    if (get().baggageAlert) set({ baggageAlert: null });
  },

  dismissBaggageAlert: () => set({ baggageAlert: null }),

  shouldPause: (state) => {
    const { managerMode, pitchLimit } = get();
    if (!managerMode.enabled) return false;

    const { triggers } = managerMode;
    if (state.inning < triggers.fromInning) return false;

    if (state.leverageIndex >= triggers.minLeverageIndex) return true;

    if (
      triggers.onPitchLimitThreshold &&
      pitchLimit.enabled &&
      pitchLimit.limit !== null &&
      state.pitcherPitchCount >= pitchLimit.warningThreshold
    ) {
      return true;
    }

    if (
      triggers.onTtopThreshold &&
      pitchLimit.ttopWarningEnabled &&
      state.timesThroughOrder >= pitchLimit.ttopThreshold
    ) {
      return true;
    }

    if (triggers.onRunnersInScoringPosition && (state.bases[1] || state.bases[2])) {
      return true;
    }

    return false;
  },
}));
