/**
 * ⚠️ 示範資料 (PLACEHOLDER)
 *
 * 以下球員與數據為「介面示範用的虛構／未查證數值」，僅供版面與計算邏輯驗證。
 * 正式上線前請以官方來源（WBSC / WBC / NPB / MLB Statcast / FanGraphs）替換，
 * 並依 `LeagueAdjustment` 註明校正係數與出處。
 */

import { bi } from '@/lib/i18n';
import type { Player, TeamCode } from '@/types/baseball';

function pass(
  flightNo: string,
  gate: string,
  seat: string,
  seed: string,
): Player['boardingPass'] {
  return {
    gate,
    seat,
    cabin: bi('—', '—'),
    flightNo,
    barcodeSeed: seed,
  };
}

const FLIGHT_2026 = 'WBC 2026';

function batter(
  id: string,
  teamCode: TeamCode,
  zh: string,
  en: string,
  jersey: number,
  order: number,
  position: Player['positions'][number],
  stats: {
    avg: number;
    obp: number;
    slg: number;
    wrcPlus: number;
    war: number;
    uzr: number;
    uzr150: number;
    whiff: number;
    sprint: number;
    attendance: number;
  },
): Player {
  return {
    id,
    era: 2026,
    teamCode,
    name: bi(zh, en),
    jersey,
    positions: [position],
    pitcherRole: null,
    bats: 'R',
    throws: 'R',
    age: null,
    heightCm: null,
    weightKg: null,
    club: null,
    leagueOrigin: teamCode === 'JPN' ? 'NPB' : 'MLB',
    rosterClass: 'STARTER',
    battingOrder: order,
    batting: {
      g: 0, pa: 0, ab: 0, h: 0, hr: 0, rbi: 0, sb: 0, bb: 0, so: 0,
      avg: stats.avg,
      obp: stats.obp,
      slg: stats.slg,
      ops: Number((stats.obp + stats.slg).toFixed(3)),
      wrcPlus: stats.wrcPlus,
      opsPlus: stats.wrcPlus,
      war: stats.war,
      whiffPct: stats.whiff,
      exitVelocity: null,
      sprintSpeed: stats.sprint,
      vsLHP: null,
      vsRHP: null,
    },
    pitching: null,
    fielding: {
      primaryPosition: position,
      innings: 0,
      uzr: stats.uzr,
      uzr150: stats.uzr150,
      uzrComponents: { rngR: null, errR: null, armR: null, dpr: null },
      drs: null,
      oaa: null,
      fieldingPct: null,
      attendanceRate: stats.attendance,
    },
    adjustment:
      teamCode === 'JPN'
        ? {
            sourceLeague: 'NPB',
            offenseFactor: 0.9,
            pitchingFactor: 0.95,
            note: bi(
              'NPB → MLB 尺度校正（示範係數，需以實際轉換研究替換）。',
              'NPB → MLB scale adjustment (placeholder factors; replace with a real translation study).',
            ),
          }
        : null,
    boardingPass: pass(FLIGHT_2026, teamCode === 'JPN' ? 'C' : 'A', `${order}-${position}`, id),
    scoutingNote: null,
    photoUrl: null,
  };
}

function pitcher(
  id: string,
  teamCode: TeamCode,
  zh: string,
  en: string,
  jersey: number,
  role: 'SP' | 'RP' | 'CL',
  stats: { era: number; fip: number; whip: number; k9: number; bb9: number; velo: number; decline: number },
): Player {
  return {
    id,
    era: 2026,
    teamCode,
    name: bi(zh, en),
    jersey,
    positions: ['P'],
    pitcherRole: role,
    bats: 'R',
    throws: 'R',
    age: null,
    heightCm: null,
    weightKg: null,
    club: null,
    leagueOrigin: teamCode === 'JPN' ? 'NPB' : 'MLB',
    rosterClass: role === 'SP' ? 'ROTATION' : role === 'CL' ? 'CLOSER' : 'BULLPEN',
    battingOrder: null,
    batting: null,
    pitching: {
      g: 0, gs: 0, ip: 0, w: 0, l: 0, sv: 0, hld: 0, h: 0, er: 0, bb: 0, so: 0,
      era: stats.era,
      whip: stats.whip,
      eraPlus: null,
      fip: stats.fip,
      war: null,
      k9: stats.k9,
      bb9: stats.bb9,
      avgVelocity: stats.velo,
      velocityDeclinePer25: stats.decline,
      pitches: null,
      vsLHB: null,
      vsRHB: null,
    },
    fielding: null,
    adjustment: null,
    boardingPass: pass(FLIGHT_2026, teamCode === 'JPN' ? 'C' : 'A', role === 'SP' ? 'SP-01' : `BP-${jersey}`, id),
    scoutingNote: null,
    photoUrl: null,
  };
}

export const DEMO_PLAYERS: Player[] = [
  batter('jpn-cf', 'JPN', '示範 中堅手', 'Demo CF', 51, 1, 'CF', {
    avg: 0.312, obp: 0.401, slg: 0.548, wrcPlus: 158, war: 5.4,
    uzr: 8.6, uzr150: 11.2, whiff: 0.19, sprint: 28.9, attendance: 0.96,
  }),
  batter('jpn-ss', 'JPN', '示範 游擊手', 'Demo SS', 4, 2, 'SS', {
    avg: 0.288, obp: 0.352, slg: 0.44, wrcPlus: 124, war: 4.1,
    uzr: 12.4, uzr150: 15.8, whiff: 0.16, sprint: 28.1, attendance: 0.93,
  }),
  batter('ven-3b', 'VEN', '示範 三壘手', 'Demo 3B', 13, 3, '3B', {
    avg: 0.301, obp: 0.386, slg: 0.531, wrcPlus: 149, war: 5.9,
    uzr: -2.1, uzr150: -2.6, whiff: 0.21, sprint: 26.4, attendance: 0.98,
  }),
  batter('ven-c', 'VEN', '示範 捕手', 'Demo C', 24, 4, 'C', {
    avg: 0.264, obp: 0.341, slg: 0.472, wrcPlus: 118, war: 3.2,
    uzr: 4.4, uzr150: 6.1, whiff: 0.24, sprint: 25.1, attendance: 0.88,
  }),
  pitcher('jpn-sp', 'JPN', '示範 先發投手', 'Demo SP', 18, 'SP', {
    era: 1.86, fip: 2.14, whip: 0.87, k9: 11.4, bb9: 1.7, velo: 96.4, decline: 0.42,
  }),
  pitcher('jpn-cl', 'JPN', '示範 終結者', 'Demo CL', 22, 'CL', {
    era: 1.44, fip: 1.98, whip: 0.79, k9: 13.1, bb9: 2.4, velo: 98.1, decline: 0.55,
  }),
  pitcher('ven-sp', 'VEN', '示範 先發投手', 'Demo SP', 45, 'SP', {
    era: 2.61, fip: 2.88, whip: 1.02, k9: 9.8, bb9: 2.2, velo: 95.2, decline: 0.36,
  }),
];

export const playerById = (id: string): Player | null =>
  DEMO_PLAYERS.find((p) => p.id === id) ?? null;
