/**
 * 逐球合成層 —— 在打席結果（`Outcome`）已經由 `ratings.ts` 的 `plateAppearanceProbs`
 * 決定之後，補上「這個結果是怎麼投出來的」的逐球細節（球種／球速／好壞球判決／落點／
 * 揮擊結果）。刻意設計成疊加在既有結果之上、不影響結果本身，這樣既有的勝率模型
 * 完全不用動，逐球內容永遠跟最終結果邏輯自洽（三振一定收在好球、保送一定收在壞球）。
 *
 * ⚠️ 這是「說得通的示意」而非 Statcast 等級的物理模擬——球種分佈、好壞球節奏都是
 * 合理但主觀設定的權重，用決定性亂數（同一場輸入永遠得到同一份逐球結果）。
 */

import { bi } from '@/lib/i18n';
import { velocityAfterPitches } from '@/lib/sabermetrics';
import type {
  BattedBallType,
  Bilingual,
  HalfInning,
  PitchData,
  PitchResult,
  PitchType,
} from '@/types/baseball';
import type { PlateAppearanceEvent } from './gameSim';
import type { PitcherProfile } from './ratings';

/* ------------------------------------------------------------------ */
/* 球種與落點                                                          */
/* ------------------------------------------------------------------ */

const PITCH_TYPE_WEIGHTS: Array<[PitchType, number]> = [
  ['FF', 0.32],
  ['SL', 0.18],
  ['CH', 0.12],
  ['CU', 0.1],
  ['SI', 0.1],
  ['FC', 0.09],
  ['FS', 0.06],
  ['ST', 0.03],
];

function pickPitchType(rand: () => number): PitchType {
  const total = PITCH_TYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [type, weight] of PITCH_TYPE_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return PITCH_TYPE_WEIGHTS[0][0];
}

/** 好球帶邊界（英尺）：x 為左右、z 為高度。 */
const ZONE = { xMin: -0.83, xMax: 0.83, zMin: 1.5, zMax: 3.5 };

function randomInZone(rand: () => number): { x: number; z: number } {
  return {
    x: ZONE.xMin + rand() * (ZONE.xMax - ZONE.xMin),
    z: ZONE.zMin + rand() * (ZONE.zMax - ZONE.zMin),
  };
}

function randomOutOfZone(rand: () => number): { x: number; z: number } {
  // 偏出好球帶一段距離，但不會離譜到像暴投。
  const margin = 0.3 + rand() * 1.1;
  const side = rand() < 0.5 ? -1 : 1;
  const horizontal = rand() < 0.6;
  return horizontal
    ? { x: side * (ZONE.xMax + margin), z: ZONE.zMin + rand() * (ZONE.zMax - ZONE.zMin) }
    : { x: ZONE.xMin + rand() * (ZONE.xMax - ZONE.xMin), z: side > 0 ? ZONE.zMax + margin : Math.max(0.5, ZONE.zMin - margin) };
}

/* ------------------------------------------------------------------ */
/* 打進場內的球                                                        */
/* ------------------------------------------------------------------ */

const BATTED_ZONE_LABELS = ['LF-LINE', 'LC-GAP', 'CF', 'RC-GAP', 'RF-LINE', 'INFIELD-L', 'INFIELD-M', 'INFIELD-R'];

function buildBattedBall(
  outcome: PlateAppearanceEvent['outcome'],
  rand: () => number,
): NonNullable<PitchData['battedBall']> {
  const isHr = outcome === 'HR';
  const isExtraBase = outcome === 'DOUBLE' || outcome === 'TRIPLE';

  let type: BattedBallType;
  let exitVelocity: number;
  let launchAngle: number;

  if (isHr) {
    type = rand() < 0.75 ? 'FB' : 'LD';
    exitVelocity = 95 + rand() * 14;
    launchAngle = 22 + rand() * 14;
  } else if (isExtraBase) {
    type = rand() < 0.6 ? 'LD' : 'FB';
    exitVelocity = 90 + rand() * 12;
    launchAngle = 12 + rand() * 16;
  } else if (outcome === 'SINGLE') {
    const roll = rand();
    type = roll < 0.45 ? 'GB' : roll < 0.8 ? 'LD' : 'FB';
    exitVelocity = 82 + rand() * 14;
    launchAngle = type === 'GB' ? rand() * 8 : 8 + rand() * 18;
  } else {
    // OUT：滾地/飛球/內野高飛都有可能。
    const roll = rand();
    type = roll < 0.45 ? 'GB' : roll < 0.85 ? 'FB' : 'PU';
    exitVelocity = 68 + rand() * 22;
    launchAngle = type === 'GB' ? -5 + rand() * 10 : type === 'PU' ? 55 + rand() * 25 : 25 + rand() * 30;
  }

  return {
    type,
    exitVelocity: Math.round(exitVelocity * 10) / 10,
    launchAngle: Math.round(launchAngle),
    zone: BATTED_ZONE_LABELS[Math.floor(rand() * BATTED_ZONE_LABELS.length)],
  };
}

/* ------------------------------------------------------------------ */
/* 播報文字                                                            */
/* ------------------------------------------------------------------ */

const RESULT_DESCRIPTION: Record<PitchResult, Bilingual> = {
  BALL: bi('壞球', 'Ball'),
  CALLED_STRIKE: bi('好球（未揮棒）', 'Called strike'),
  SWINGING_STRIKE: bi('揮空', 'Swinging strike'),
  FOUL: bi('界外球', 'Foul ball'),
  IN_PLAY_OUT: bi('打進場內，出局', 'Ball in play, out'),
  IN_PLAY_HIT: bi('打進場內，安打', 'Ball in play, hit'),
  HBP: bi('觸身球', 'Hit by pitch'),
  PITCH_CLOCK_VIOLATION: bi('投球計時違規', 'Pitch clock violation'),
};

/* ------------------------------------------------------------------ */
/* 主函式                                                              */
/* ------------------------------------------------------------------ */

export interface SynthesizePitchesParams {
  event: PlateAppearanceEvent;
  pitcher: PitcherProfile;
  /** 投手在這個打席「之前」已經投的本場球數（用於球速衰退）。 */
  cumulativePitchCountBefore: number;
  catcherId: string;
  gameId: string;
  atBatIndex: number;
  /** 全場逐球計數器起點，用來組出不重複的 pitch id。 */
  globalPitchIndexStart: number;
  /** 這個打席開始前的比賽狀態（inning/half/outs/bases/score，整個打席內不變）；balls/strikes 由本函式逐球算出。 */
  stateBefore: Omit<PitchData['stateBefore'], 'balls' | 'strikes'>;
  rand: () => number;
}

const PITCHER_BASE_VELOCITY: Record<PitcherProfile['role'], number> = {
  SP: 92.5,
  RP: 94.5,
  CL: 95.5,
};

export function synthesizePitches(params: SynthesizePitchesParams): PitchData[] {
  const { event, pitcher, cumulativePitchCountBefore, catcherId, gameId, atBatIndex, globalPitchIndexStart, stateBefore, rand } = params;
  const n = Math.max(1, event.pitchesThrown);
  const pitches: PitchData[] = [];

  let balls = 0;
  let strikes = 0;
  const baseVelocity = PITCHER_BASE_VELOCITY[pitcher.role];

  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    const cumulativePitchCount = cumulativePitchCountBefore + i + 1;
    const velocity = Math.round(
      (velocityAfterPitches(baseVelocity, cumulativePitchCount, pitcher.velocityDeclinePer25) +
        (rand() - 0.5) * 2.4) *
        10,
    ) / 10;

    let result: PitchResult;
    let location: { x: number; z: number };
    let battedBall: PitchData['battedBall'] = null;

    if (isLast) {
      switch (event.outcome) {
        case 'K':
          result = rand() < 0.55 ? 'SWINGING_STRIKE' : 'CALLED_STRIKE';
          location = result === 'CALLED_STRIKE' ? randomInZone(rand) : rand() < 0.7 ? randomInZone(rand) : randomOutOfZone(rand);
          strikes = 3;
          break;
        case 'BB':
          if (rand() < 0.06) {
            result = 'HBP';
            location = randomOutOfZone(rand);
          } else {
            result = 'BALL';
            location = randomOutOfZone(rand);
          }
          balls = 4;
          break;
        case 'OUT':
          result = 'IN_PLAY_OUT';
          location = randomInZone(rand);
          battedBall = buildBattedBall(event.outcome, rand);
          break;
        default:
          // HR / TRIPLE / DOUBLE / SINGLE
          result = 'IN_PLAY_HIT';
          location = randomInZone(rand);
          battedBall = buildBattedBall(event.outcome, rand);
          break;
      }
    } else {
      // 非決定性的一球：壞球／好球（未揮棒）／揮空／界外，不能提前把打席收掉。
      const canBall = balls < 3;
      const canCalledStrike = strikes < 2;
      const roll = rand();
      let choice: 'BALL' | 'CALLED_STRIKE' | 'SWINGING_STRIKE' | 'FOUL';
      if (roll < 0.4) choice = 'BALL';
      else if (roll < 0.55) choice = 'CALLED_STRIKE';
      else if (roll < 0.65) choice = 'SWINGING_STRIKE';
      else choice = 'FOUL';

      if (choice === 'BALL' && !canBall) choice = 'FOUL';
      if ((choice === 'CALLED_STRIKE' || choice === 'SWINGING_STRIKE') && !canCalledStrike) choice = 'FOUL';

      result = choice;
      if (choice === 'BALL') {
        balls += 1;
        location = randomOutOfZone(rand);
      } else if (choice === 'FOUL') {
        location = rand() < 0.6 ? randomInZone(rand) : randomOutOfZone(rand);
      } else {
        strikes += 1;
        location = choice === 'CALLED_STRIKE' ? randomInZone(rand) : rand() < 0.7 ? randomInZone(rand) : randomOutOfZone(rand);
      }
    }

    pitches.push({
      id: `${gameId}-pitch-${globalPitchIndexStart + i}`,
      gameId,
      atBatIndex,
      pitchNumber: i + 1,
      cumulativePitchCount,
      inning: event.inning,
      half: event.half as HalfInning,
      pitcherId: event.pitcherId,
      batterId: event.batterId,
      catcherId,
      pitchType: pickPitchType(rand),
      velocity,
      spinRate: null,
      location,
      result,
      battedBall,
      stateBefore: {
        ...stateBefore,
        balls: Math.min(3, balls) as 0 | 1 | 2 | 3,
        strikes: Math.min(2, strikes) as 0 | 1 | 2,
      },
      // 勝率/槓桿/RE24 由 gameReviewGenerator 依整場狀態回填；這裡先放中性值。
      deltaWinProbability: 0,
      leverageIndex: 0,
      re24: null,
      pitchClockRemainingSec: null,
      pitchClockViolation: false,
      pitchCom: null,
      description: RESULT_DESCRIPTION[result],
    });
  }

  return pitches;
}
