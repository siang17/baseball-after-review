import { barcodeBars, cn } from '@/lib/utils';

interface BarcodeProps {
  /** 決定性種子 —— 同一 seed 永遠產生同一組線條，避免 hydration 不一致。 */
  seed: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  bars?: number;
  showText?: boolean;
}

/**
 * 純 CSS 條碼。橫向時線條並排；縱向時整體旋轉 90°，
 * 用在登機證票根（stub）側邊。
 */
export function Barcode({
  seed,
  orientation = 'horizontal',
  className,
  bars = 44,
  showText = false,
}: BarcodeProps) {
  const widths = barcodeBars(seed, bars);

  return (
    <div
      className={cn(
        'flex items-stretch gap-[2px]',
        orientation === 'vertical' && 'rotate-180 [writing-mode:vertical-rl]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-full items-stretch gap-[2px]">
        {widths.map((w, i) => (
          <span
            key={i}
            className="block h-full bg-ink"
            style={{ width: `${w}px`, opacity: i % 7 === 0 ? 0.35 : 1 }}
          />
        ))}
      </div>
      {showText && (
        <span className="ml-2 font-[family-name:var(--font-mono-ticket)] text-[10px] tracking-[0.3em] text-ink-muted">
          {seed.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** QR 風格方塊（不是真 QR，僅視覺元素）。 */
export function QrGlyph({ seed, size = 56 }: { seed: string; size?: number }) {
  const cells = barcodeBars(seed, 49).map((v) => v % 2 === 0);
  return (
    <div
      className="grid grid-cols-7 gap-[2px] rounded-[3px] bg-paper-pure p-[3px] ring-1 ring-line"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? 'bg-ink' : 'bg-transparent'} />
      ))}
    </div>
  );
}
