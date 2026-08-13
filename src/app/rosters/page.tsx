'use client';

import { PlayerBoardingPass } from '@/components/boarding/BoardingPassCard';
import { BaggageTag } from '@/components/ui/BaggageTag';
import { DEMO_PLAYERS } from '@/data/rosters/demoPlayers';
import { bi } from '@/lib/i18n';
import { useAppStore } from '@/store/useAppStore';

export default function RostersPage() {
  const lang = useAppStore((s) => s.lang);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-black text-navy">
          {lang === 'zh' ? '旅客名單 · 球員登機證' : 'Rosters · Player Boarding Passes'}
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          {lang === 'zh'
            ? '示範資料。正式名單請由 src/data/rosters 匯入 2024 十二強與 2026 WBC 各隊陣容。'
            : 'Placeholder data. Load the real 2024 Premier12 and 2026 WBC rosters from src/data/rosters.'}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {DEMO_PLAYERS.map((player) => (
          <PlayerBoardingPass key={player.id} player={player} lang={lang}>
            <div className="flex flex-wrap gap-2">
              {player.fielding?.uzr150 != null && (
                <BaggageTag
                  lang={lang}
                  label={bi('UZR/150', 'UZR/150')}
                  value={player.fielding.uzr150.toFixed(1)}
                  tone={player.fielding.uzr150 >= 0 ? 'good' : 'danger'}
                />
              )}
              {player.batting?.wrcPlus != null && (
                <BaggageTag lang={lang} label={bi('wRC+', 'wRC+')} value={player.batting.wrcPlus} />
              )}
              {player.pitching?.era != null && (
                <BaggageTag lang={lang} label={bi('防禦率', 'ERA')} value={player.pitching.era.toFixed(2)} />
              )}
              {player.pitching?.velocityDeclinePer25 != null && (
                <BaggageTag
                  lang={lang}
                  label={bi('球速下滑 /25 球', 'Velo drop /25')}
                  value={player.pitching.velocityDeclinePer25.toFixed(2)}
                  unit="mph"
                  tone={player.pitching.velocityDeclinePer25 >= 0.5 ? 'warn' : 'neutral'}
                />
              )}
            </div>
          </PlayerBoardingPass>
        ))}
      </div>
    </div>
  );
}
