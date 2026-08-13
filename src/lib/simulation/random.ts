/**
 * 決定性亂數 —— 模擬引擎刻意不使用 Math.random()。
 *
 * 理由：復盤工具的模擬結果必須可重現。同一組設定必須永遠得到同一個勝率，
 * 否則使用者無法比較「換了一個調度」與「只是重跑一次」的差別。
 */

/** mulberry32：快速、週期足夠、狀態只有 32 bits。 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 字串 → 32 bit 種子（FNV-1a）。 */
export function seedFrom(...parts: Array<string | number>): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 從機率權重陣列抽樣，回傳索引。
 * 權重總和必須為 1（呼叫端負責正規化）；浮點誤差時回傳最後一項。
 */
export function sampleIndex(weights: number[], rand: () => number): number {
  let r = rand();
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/** 常態亂數（Box–Muller），用於用球數等連續量的抖動。 */
export function gaussian(rand: () => number, mean: number, sd: number): number {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
