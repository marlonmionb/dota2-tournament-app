import { MatchSlot, TournamentStatus } from "@prisma/client";
import { findTournamentById } from "@/repositories/tournament-repository";
import { findTeamsByTournament } from "@/repositories/team-repository";
import {
  assignTeamToMatchSlot,
  findMatchById,
  findMatchesByTournament,
  updateMatchWinner,
} from "@/repositories/match-repository";
import { matchResultSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { canGenerateBracket, canRecordResult } from "@/lib/tournament-rules";

/**
 * Generates a single-elimination bracket by randomly seeding registered teams.
 * Matches are created for the first round; subsequent rounds are auto-created
 * as empty "TBD" slots so the bracket structure is pre-known.
 */
export async function generateBracket(tournamentId: string, organizerId: string) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (tournament.matches.length > 0)
    throw new Error("Bracket has already been generated for this tournament");

  const teams = await findTeamsByTournament(tournamentId);
  if (!canGenerateBracket(tournament, teams.length))
    throw new Error("Registration must be closed and at least 2 teams must be registered");
  if ((teams.length & (teams.length - 1)) !== 0)
    throw new Error("Team count must be a power of 2 to generate this bracket");

  // Randomly shuffle teams
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const rounds = Math.ceil(Math.log2(shuffled.length));

  await prisma.$transaction(async (tx) => {
    const matchesByRound: string[][] = [];

    // Round 1: seeded team pairs from the shuffle.
    const firstRoundIds: string[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const match = await tx.match.create({
        data: {
          tournamentId,
          round: 1,
          teamAId: shuffled[i].id,
          teamBId: shuffled[i + 1].id,
        },
      });
      firstRoundIds.push(match.id);
    }
    matchesByRound.push(firstRoundIds);

    // Later rounds start as TBD slots and get filled as winners advance.
    for (let round = 2; round <= rounds; round += 1) {
      const previousRoundMatchCount = matchesByRound[round - 2].length;
      const thisRoundMatchCount = Math.floor(previousRoundMatchCount / 2);
      const thisRoundIds: string[] = [];

      for (let i = 0; i < thisRoundMatchCount; i += 1) {
        const match = await tx.match.create({
          data: { tournamentId, round, teamAId: null, teamBId: null },
        });
        thisRoundIds.push(match.id);
      }

      matchesByRound.push(thisRoundIds);
    }

    // Connect every match to its next match and winner slot, forming a full tree.
    for (let roundIndex = 0; roundIndex < matchesByRound.length - 1; roundIndex += 1) {
      const currentRound = matchesByRound[roundIndex];
      const nextRound = matchesByRound[roundIndex + 1];

      for (let i = 0; i < currentRound.length; i += 1) {
        const nextIndex = Math.floor(i / 2);
        const nextMatchId = nextRound[nextIndex];
        const slot = i % 2 === 0 ? MatchSlot.TEAM_A : MatchSlot.TEAM_B;
        await tx.match.update({
          where: { id: currentRound[i] },
          data: { nextMatchId, nextMatchSlot: slot },
        });
      }
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.IN_PROGRESS },
    });
  });

  return findMatchesByTournament(tournamentId);
}

/**
 * Records the winner of a match and automatically advances them to the
 * next match if one is linked (nextMatchId).
 */
export async function recordMatchResult(
  matchId: string,
  organizerId: string,
  body: unknown
) {
  const { winnerId } = matchResultSchema.parse(body);

  const match = await findMatchById(matchId);
  if (!match) throw new Error("Match not found");
  if (match.tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (!canRecordResult(match.tournament))
    throw new Error("Tournament is not in progress");
  if (match.status === "COMPLETED") throw new Error("Match already completed");
  if (!match.teamAId || !match.teamBId)
    throw new Error("Match is not ready. Both teams must be assigned first");
  if (match.teamAId !== winnerId && match.teamBId !== winnerId)
    throw new Error("Winner must be one of the two competing teams");

  const updated = await updateMatchWinner(matchId, winnerId);

  // Advance winner to the linked next match slot, if this is not the final.
  if (match.nextMatchId) {
    if (!match.nextMatchSlot) {
      throw new Error("Match advancement slot is missing");
    }
    await assignTeamToMatchSlot(match.nextMatchId, winnerId, match.nextMatchSlot);
  } else {
    // No next match means this was the final.
    await updateTournamentStatus(match.tournamentId, TournamentStatus.COMPLETED);
  }

  return updated;
}
