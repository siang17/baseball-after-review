import { ROSTER_JPN_2024 } from './2024/jpn';
import { ROSTER_VEN_2024 } from './2024/ven';
import { ROSTER_JPN_2026 } from './2026/jpn';
import { ROSTER_VEN_2026 } from './2026/ven';
import type { Coach, Era, Player, Roster, TeamCode } from '@/types/baseball';

/** 範圍縮減為 4 隊（2024／2026 各自的日本、委內瑞拉），其餘隊伍名單已移除。 */
export const ALL_ROSTERS: Roster[] = [
  ROSTER_JPN_2024,
  ROSTER_VEN_2024,
  ROSTER_JPN_2026,
  ROSTER_VEN_2026,
];

/* ------------------------------------------------------------------ */
/* 索引                                                                */
/*                                                                     */
/* 名單資料在模組載入後就不會再變動，但 `rosterFor()` / `playerById()`   */
/* 會在逐球復盤的 render 迴圈裡被反覆呼叫（每顆球至少查兩位球員，壘上   */
/* 跑者再各查一次）。原本的線性掃描要走過 12 隊 × 全員，因此改成第一次   */
/* 呼叫時才建立 Map，之後都是 O(1)。                                    */
/* ------------------------------------------------------------------ */

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

function rosterKey(era: Era, teamCode: TeamCode): string {
  return `${era}:${teamCode}`;
}

let rosterIndex: Map<string, Roster> | null = null;
let playerIndex: Map<string, Player> | null = null;
let playerList: Player[] | null = null;
let coachList: Coach[] | null = null;

function getRosterIndex(): Map<string, Roster> {
  if (!rosterIndex) {
    rosterIndex = new Map(ALL_ROSTERS.map((r) => [rosterKey(r.era, r.teamCode), r]));
  }
  return rosterIndex;
}

function getPlayerIndex(): Map<string, Player> {
  if (!playerIndex) {
    const index = new Map<string, Player>();
    // 保留原本線性搜尋的優先序：逐隊走過，同一隊先正式名單再遇遺珠，
    // 且只取第一個匹配（若 id 重複不覆蓋）。
    const put = (player: Player) => {
      if (!index.has(player.id)) index.set(player.id, player);
    };
    for (const roster of ALL_ROSTERS) {
      for (const player of rosterPlayers(roster)) put(player);
      // 遺珠未入選正式名單，但仍需可查到。
      for (const snub of roster.snubs) put(snub.player);
    }
    playerIndex = index;
  }
  return playerIndex;
}

export function rosterFor(era: Era, teamCode: TeamCode): Roster | null {
  return getRosterIndex().get(rosterKey(era, teamCode)) ?? null;
}

export function allPlayers(): Player[] {
  if (!playerList) playerList = ALL_ROSTERS.flatMap(rosterPlayers);
  return playerList;
}

/** 依 id 找球員；也會搜尋遺珠球員（未入選正式名單，但仍需可查到）。 */
export function playerById(id: string): Player | null {
  return getPlayerIndex().get(id) ?? null;
}

export function allCoaches(): Coach[] {
  if (!coachList) coachList = ALL_ROSTERS.flatMap((r) => r.coachingStaff);
  return coachList;
}
