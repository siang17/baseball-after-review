import { NextResponse } from 'next/server';
import { runMatchupSimulation } from '@/lib/simulation/matchupSimulator';
import type { MatchupModeConfig, PitchLimitPreset } from '@/types/baseball';

export const runtime = 'nodejs';

function isValidConfig(value: unknown): value is MatchupModeConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Partial<MatchupModeConfig>;
  return Boolean(
    config.homeTeamCode &&
      config.awayTeamCode &&
      typeof config.homeTeamYear === 'number' &&
      typeof config.awayTeamYear === 'number' &&
      ['2024vs2024', '2026vs2026', '2024vs2026'].includes(config.eraMode ?? '') &&
      ['NEUTRAL', 'HOME_ADVANTAGE'].includes(config.venue ?? '') &&
      [30, 50, 65, 'UNLIMITED'].includes(config.pitchLimitPreset as PitchLimitPreset),
  );
}

export async function POST(request: Request) {
  try {
    const config: unknown = await request.json();
    if (!isValidConfig(config)) {
      return NextResponse.json({ error: 'Invalid matchup configuration.' }, { status: 400 });
    }
    return NextResponse.json(runMatchupSimulation(config));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Simulation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
