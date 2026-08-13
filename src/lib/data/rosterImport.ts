import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const providerSchema = z.enum(['WBSC', 'MLB_STATS_API', 'BASEBALL_SAVANT', 'FANGRAPHS', 'NPB_OFFICIAL', 'MANUAL_REVIEW']);

export const rosterImportSchema = z.object({
  source: z.object({ provider: providerSchema, name: z.string().min(2), url: z.string().url(), licenseNote: z.string().max(500).optional() }),
  tournament: z.object({ code: z.string().min(3).max(64), year: z.number().int().min(1900).max(2100), nameZh: z.string().min(2), nameEn: z.string().min(2), organiser: z.string().min(2), rules: z.record(z.string(), z.unknown()).default({}) }),
  team: z.object({ code: z.string().regex(/^[A-Z]{3}$/), nameZh: z.string().min(2), nameEn: z.string().min(2), federation: z.string().optional(), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), groupCode: z.string().max(4).optional() }),
  announcedOn: z.string().datetime().optional(),
  verifiedAt: z.string().datetime().optional(),
  players: z.array(z.object({
    externalId: z.string().min(1).max(100), canonicalName: z.string().min(2), nameZh: z.string().optional(), nameEn: z.string().optional(), birthDate: z.string().date().optional(), bats: z.enum(['L', 'R', 'S']).optional(), throws: z.enum(['L', 'R']).optional(), heightCm: z.number().int().min(120).max(250).optional(), weightKg: z.number().int().min(35).max(200).optional(), jerseyNumber: z.number().int().min(0).max(99).optional(), rosterStatus: z.enum(['STARTER', 'BENCH', 'ROTATION', 'BULLPEN', 'CLOSER', 'MANAGER']).default('BENCH'), primaryPosition: z.string().max(8).optional(), pitcherRole: z.enum(['SP', 'RP', 'CL']).optional(), battingOrder: z.number().int().min(1).max(9).optional(),
  })).min(1).max(60),
});

export type RosterImportPayload = z.infer<typeof rosterImportSchema>;

export async function importRoster(payload: RosterImportPayload) {
  const sourceUrl = payload.source.url;
  const origin = new URL(sourceUrl).origin;
  const checksum = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const source = await prisma.dataSource.upsert({
    where: { provider_baseUrl: { provider: payload.source.provider, baseUrl: origin } },
    update: { name: payload.source.name, licenseNote: payload.source.licenseNote },
    create: { provider: payload.source.provider, name: payload.source.name, baseUrl: origin, licenseNote: payload.source.licenseNote },
  });
  const run = await prisma.importRun.create({ data: { sourceId: source.id, status: 'RUNNING', entityType: 'ROSTER', sourceUrl, checksum, recordsRead: payload.players.length, metadata: { tournamentCode: payload.tournament.code, teamCode: payload.team.code } } });
  try {
    const recordsSaved = await prisma.$transaction(async (tx) => {
      // Zod 產出的 Record<string, unknown> 不等同 Prisma 的 InputJsonValue，
      // 這裡明確轉型（rules 已由 schema 保證是純 JSON 物件）。
      const rules = payload.tournament.rules as Prisma.InputJsonObject;
      const tournament = await tx.tournament.upsert({ where: { code: payload.tournament.code }, update: { nameZh: payload.tournament.nameZh, nameEn: payload.tournament.nameEn, year: payload.tournament.year, organiser: payload.tournament.organiser, rules }, create: { ...payload.tournament, rules } });
      const team = await tx.team.upsert({ where: { code: payload.team.code }, update: { nameZh: payload.team.nameZh, nameEn: payload.team.nameEn, federation: payload.team.federation, color: payload.team.color }, create: { code: payload.team.code, nameZh: payload.team.nameZh, nameEn: payload.team.nameEn, federation: payload.team.federation, color: payload.team.color } });
      await tx.tournamentTeam.upsert({ where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id } }, update: { groupCode: payload.team.groupCode }, create: { tournamentId: tournament.id, teamId: team.id, groupCode: payload.team.groupCode } });
      const roster = await tx.roster.upsert({ where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id } }, update: { sourceUrl, announcedOn: payload.announcedOn ? new Date(payload.announcedOn) : null, verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null }, create: { tournamentId: tournament.id, teamId: team.id, sourceUrl, announcedOn: payload.announcedOn ? new Date(payload.announcedOn) : null, verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null } });
      await tx.rosterMember.updateMany({ where: { rosterId: roster.id }, data: { isActive: false } });
      for (const member of payload.players) {
        const existing = await tx.playerIdentity.findUnique({ where: { provider_externalId: { provider: payload.source.provider, externalId: member.externalId } } });
        const playerData = { canonicalName: member.canonicalName, nameZh: member.nameZh, nameEn: member.nameEn, birthDate: member.birthDate ? new Date(member.birthDate) : null, bats: member.bats, throws: member.throws, heightCm: member.heightCm, weightKg: member.weightKg };
        const player = existing ? await tx.player.update({ where: { id: existing.playerId }, data: playerData }) : await tx.player.create({ data: { ...playerData, identities: { create: { provider: payload.source.provider, externalId: member.externalId, sourceUrl, verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null } } } });
        await tx.rosterMember.upsert({ where: { rosterId_playerId: { rosterId: roster.id, playerId: player.id } }, update: { jerseyNumber: member.jerseyNumber, rosterStatus: member.rosterStatus, primaryPosition: member.primaryPosition, pitcherRole: member.pitcherRole, battingOrder: member.battingOrder, isActive: true }, create: { rosterId: roster.id, playerId: player.id, jerseyNumber: member.jerseyNumber, rosterStatus: member.rosterStatus, primaryPosition: member.primaryPosition, pitcherRole: member.pitcherRole, battingOrder: member.battingOrder, isActive: true } });
      }
      await tx.rawRecord.createMany({ data: payload.players.map((player) => ({ importRunId: run.id, entityType: 'ROSTER_MEMBER', externalId: player.externalId, payload: player })) });
      return payload.players.length;
    });
    await prisma.importRun.update({ where: { id: run.id }, data: { status: 'COMPLETED', completedAt: new Date(), recordsSaved } });
    return { importRunId: run.id, recordsSaved };
  } catch (error) {
    await prisma.importRun.update({ where: { id: run.id }, data: { status: 'FAILED', completedAt: new Date(), errorMessage: error instanceof Error ? error.message : 'Unknown import error' } });
    throw error;
  }
}
