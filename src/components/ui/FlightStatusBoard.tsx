import { cn } from '@/lib/utils';
import type { Bilingual, Lang } from '@/types/baseball';

export interface BoardRow {
  id: string;
  /** 航班／賽事編號。 */
  flight: string;
  /** 出發（客隊）→ 抵達（主隊）。 */
  from: string;
  to: string;
  gate: string;
  time: string;
  status: Bilingual;
  tone: 'ontime' | 'boarding' | 'delayed' | 'arrived';
}

const TONE_CLASS: Record<BoardRow['tone'], string> = {
  ontime: 'text-board-text',
  boarding: 'text-board-green',
  delayed: 'text-alert led-blink',
  arrived: 'text-board-amber',
};

/**
 * 航班動態看板 (Flight Status Board) —— 機場翻牌式 / LED 樣式的賽程表。
 */
export function FlightStatusBoard({
  rows,
  lang,
  title,
  className,
}: {
  rows: BoardRow[];
  lang: Lang;
  title?: Bilingual;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--radius-pass)] bg-board font-[family-name:var(--font-mono-ticket)] text-board-text',
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <h3 className="text-xs font-bold uppercase tracking-[0.28em] text-board-amber">
            {title[lang]}
          </h3>
          <span className="h-2 w-2 rounded-full bg-board-green led-blink" />
        </header>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-[9px] uppercase tracking-[0.2em] text-board-text/50">
              <th className="px-4 py-2 font-semibold">Flight</th>
              <th className="px-2 py-2 font-semibold">From</th>
              <th className="px-2 py-2 font-semibold">To</th>
              <th className="px-2 py-2 font-semibold">Gate</th>
              <th className="px-2 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="border-t border-white/[0.07] tabular-nums transition hover:bg-white/[0.04]"
              >
                <td className="px-4 py-2.5 font-bold text-board-amber">
                  <span className="flap" style={{ animationDelay: `${i * 60}ms` }}>
                    {row.flight}
                  </span>
                </td>
                <td className="px-2 py-2.5 font-bold">{row.from}</td>
                <td className="px-2 py-2.5 font-bold">{row.to}</td>
                <td className="px-2 py-2.5">{row.gate}</td>
                <td className="px-2 py-2.5">{row.time}</td>
                <td className={cn('px-4 py-2.5 text-right font-bold', TONE_CLASS[row.tone])}>
                  <span className="flap" style={{ animationDelay: `${i * 60 + 120}ms` }}>
                    {row.status[lang]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
