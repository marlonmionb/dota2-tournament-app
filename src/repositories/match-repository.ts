import { prisma } from "@/lib/prisma";
import { MatchSlot, MatchStatus } from "@prisma/client";

export async function findMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: { teamA: true, teamB: true, winner: true, tournament: true },
  });
}

export async function createMatch(data: {
  tournamentId: string;
  round: number;
  teamAId?: string | null;
  teamBId?: string | null;
}) {
  return prisma.match.create({ data });
}

export async function linkMatchToNext(
  matchId: string,
  nextMatchId: string,
  nextMatchSlot: MatchSlot
) {
  return prisma.match.update({
    where: { id: matchId },
    data: { nextMatchId, nextMatchSlot },
  });
}

export async function updateMatchWinner(matchId: string, winnerId: string) {
  // Atomic conditional update: only writes if the match is not yet COMPLETED.
  // This prevents a TOCTOU race where two concurrent requests both pass the
  // pre-check and then overwrite each other's winner.
  const result = await prisma.match.updateMany({
    where: { id: matchId, status: { not: MatchStatus.COMPLETED } },
    data: { winnerId, status: MatchStatus.COMPLETED },
  });

  if (result.count === 0) return null; // already completed by a concurrent request

  return prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: true, teamB: true, winner: true },
  });
}

export async function assignTeamToMatchSlot(
  matchId: string,
  teamId: string,
  slot: MatchSlot
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Next match not found");

  if (slot === MatchSlot.TEAM_A) {
    if (match.teamAId && match.teamAId !== teamId) {
      throw new Error("Next match Team A slot is already occupied");
    }
    return prisma.match.update({
      where: { id: matchId },
      data: { teamAId: teamId },
      include: { teamA: true, teamB: true, winner: true },
    });
  }

  if (match.teamBId && match.teamBId !== teamId) {
    throw new Error("Next match Team B slot is already occupied");
  }
  return prisma.match.update({
    where: { id: matchId },
    data: { teamBId: teamId },
    include: { teamA: true, teamB: true, winner: true },
  });
}

export async function findMatchesByTournament(tournamentId: string) {
  return prisma.match.findMany({
    where: { tournamentId },
    include: { teamA: true, teamB: true, winner: true },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });
}
