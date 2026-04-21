import { prisma } from "@/lib/prisma";
import type { RegisterTeamInput } from "@/lib/validations";

export async function findTeamsByTournament(tournamentId: string) {
  return prisma.team.findMany({
    where: { tournamentId },
    include: { players: true },
  });
}

export async function findTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: { players: true },
  });
}

export async function createTeam(
  tournamentId: string,
  data: RegisterTeamInput
) {
  return prisma.team.create({
    data: {
      teamName: data.teamName,
      captainName: data.captainName,
      logoUrl: data.logoUrl || null,
      tournamentId,
      players: { create: data.players },
    },
    include: { players: true },
  });
}

/**
 * Returns all steam IDs already registered in a tournament.
 * Used to enforce the unique-steam-ID-per-tournament rule.
 */
export async function findSteamIdsInTournament(
  tournamentId: string
): Promise<string[]> {
  const players = await prisma.player.findMany({
    where: { team: { tournamentId } },
    select: { steamId: true },
  });
  return players.map((p) => p.steamId);
}
