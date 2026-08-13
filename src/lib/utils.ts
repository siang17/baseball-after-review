import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 決定性的字串雜湊 —— 條碼、座位號等需要 SSR/CSR 一致的地方使用。 */
export function hashString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 由 seed 產生固定的條碼線寬序列（1–4 px 交錯）。 */
export function barcodeBars(seed: string, count = 44): number[] {
  let h = hashString(seed);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    bars.push(1 + (h % 4));
  }
  return bars;
}

export function formatSigned(value: number, digits = 1): string {
  const s = value.toFixed(digits);
  return value > 0 ? `+${s}` : s;
}

export function formatPct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
