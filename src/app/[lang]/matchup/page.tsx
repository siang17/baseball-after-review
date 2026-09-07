'use client';

import { MatchupSelector } from '@/components/matchup/MatchupSelector';
import { SimulationResult } from '@/components/matchup/SimulationResult';
import { useLang } from '@/components/layout/LangProvider';
import { useMatchupStore } from '@/store/useMatchupStore';
import type { MatchupModeConfig } from '@/types/baseball';

export default function MatchupPage() {
  const lang = useLang();
  const setSimulating = useMatchupStore((s) => s.setSimulating);
  const result = useMatchupStore((s) => s.result);
  const setResult = useMatchupStore((s) => s.setResult);
  const reset = useMatchupStore((s) => s.reset);

  // TODO: 接上 /api/simulate（AI 戰術推演報告 + 蒙地卡羅勝率）。
  const handleConfirm = async (config: MatchupModeConfig) => {
    setSimulating(true);
    try {
      const response = await fetch('/api/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(typeof payload === 'object' && payload && 'error' in payload ? String(payload.error) : 'Simulation failed.');
      setResult(payload as import('@/types/baseball').MatchupSimulationResult);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  return <div className="py-2"><MatchupSelector lang={lang} onConfirm={handleConfirm} />{result && <SimulationResult result={result} lang={lang} onReset={reset} />}</div>;
}
