import { ROSTER_JPN_2024 } from './2024/jpn';
import { ROSTER_TPE_2024 } from './2024/tpe';
import { ROSTER_USA_2024 } from './2024/usa';
import { ROSTER_VEN_2024 } from './2024/ven';
import { ROSTER_CAN_2026 } from './2026/can';
import { ROSTER_DOM_2026 } from './2026/dom';
import { ROSTER_ITA_2026 } from './2026/ita';
import { ROSTER_JPN_2026 } from './2026/jpn';
import { ROSTER_KOR_2026 } from './2026/kor';
import { ROSTER_PUR_2026 } from './2026/pur';
import { ROSTER_USA_2026 } from './2026/usa';
import { ROSTER_VEN_2026 } from './2026/ven';
import type { Coach, Era, Player, Roster, TeamCode } from '@/types/baseball';

export const ALL_ROSTERS: Roster[] = [
  ROSTER_TPE_2024,
  ROSTER_JPN_2024,
  ROSTER_USA_2024,
  ROSTER_VEN_2024,
  ROSTER_JPN_2026,
  ROSTER_VEN_2026,
  ROSTER_USA_2026,
  ROSTER_CAN_2026,
  ROSTER_PUR_2026,
  ROSTER_ITA_2026,
  ROSTER_KOR_2026,
  ROSTER_DOM_2026,
];

export function rosterFor(era: Era, teamCode: TeamCode): Roster | null {
  return ALL_ROSTERS.find((r) => r.era === era && r.teamCode === teamCode) ?? null;
}

/** 每支球隊名單裡的所有球員（先發＋替補＋輪值＋牛棚＋終結者），不含遺珠。 */
function rosterPlayers(roster: Roster): Player[] {
  return [
    ...roster.lineup,
    ...roster.bench,
    ...roster.rotation,
    ...roster.bullpen,
    ...(roster.closer ? [roster.closer] : []),
  ];
}

export function allPlayers(): Player[] {
  return ALL_ROSTERS.flatMap(rosterPlayers);
}

/** 依 id 找球員；也會搜尋遺珠球員（未入選正式名單，但仍需可查到）。 */
export function playerById(id: string): Player | null {
  for (const roster of ALL_ROSTERS) {
    const found = rosterPlayers(roster).find((p) => p.id === id);
    if (found) return found;
    const snub = roster.snubs.find((s) => s.player.id === id);
    if (snub) return snub.player;
  }
  return null;
}

export function allCoaches(): Coach[] {
  return ALL_ROSTERS.flatMap((r) => r.coachingStaff);
}
