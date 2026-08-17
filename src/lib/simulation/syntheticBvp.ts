/**
 * ⚠️ 示範用對戰投手數據 (PLACEHOLDER)
 *
 * 400 位球員都是示範資料，沒有真實歷史對戰紀錄可查。這裡用 `(batterId, pitcherId)`
 * 決定性生成一組小樣本示範數據——同一組對戰組合永遠得到同一份數據，但數字本身
 * 不代表任何真實比賽紀錄。
 */

import { hashString } from '@/lib/utils';

export interface SyntheticBvp {
  pa: number;
  ab: number;
  h: number;
  hr: number;
  bb: number;
  so: number;
  avg: number | null;
}

function seeded(batterId: string, pitcherId: string, field: string): number {
  return hashString(`bvp:${batterId}:${pitcherId}:${field}`) / 0xffffffff;
}

/** 依 id 組合決定性生成一組小樣本（3–14 打席）示範對戰數據。 */
export function syntheticBvp(batterId: string, pitcherId: string): SyntheticBvp {
  const pa = 3 + Math.floor(seeded(batterId, pitcherId, 'pa') * 12);
  // 保送與三振先從打席扣掉，剩下才是打數。
  const bb = Math.round(seeded(batterId, pitcherId, 'bb') * Math.min(2, pa - 1));
  const remaining = pa - bb;
  const so = Math.round(seeded(batterId, pitcherId, 'so') * Math.min(remaining, Math.ceil(remaining * 0.4)));
  const ab = Math.max(0, remaining);
  const hitPool = Math.max(0, ab - so);
  const h = Math.round(seeded(batterId, pitcherId, 'h') * Math.min(hitPool, Math.ceil(ab * 0.5)));
  const hr = h > 0 ? Math.round(seeded(batterId, pitcherId, 'hr') * Math.min(h, 2)) : 0;

  return {
    pa,
    ab,
    h,
    hr,
    bb,
    so,
    avg: ab > 0 ? Number((h / ab).toFixed(3)) : null,
  };
}
