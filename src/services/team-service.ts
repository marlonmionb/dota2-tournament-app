import { TournamentStatus } from "@prisma/client";
import { findTournamentById, updateTournamentStatus } from "@/repositories/tournament-repository";
import {
  createTeam as dbCreate,
  findTeamsByTournament,
  findSteamIdsInTournament,
} from "@/repositories/team-repository";
import { registerTeamSchema, type RegisterTeamInput } from "@/lib/validations";

export async function registerTeam(
  tournamentId: string,
  input: RegisterTeamInput
) {
  const data = registerTeamSchema.parse(input);

  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.status !== TournamentStatus.REGISTRATION_OPEN)
    throw new Error("Registration is not open for this tournament");

  // Check capacity
  const existingTeams = await findTeamsByTournament(tournamentId);
  if (existingTeams.length >= tournament.maxTeams)
    throw new Error("Tournament is full");

  // Enforce unique team name
  const duplicate = existingTeams.find(
    (t) => t.teamName.toLowerCase() === data.teamName.toLowerCase()
  );
  if (duplicate) throw new Error("A team with this name is already registered");

  // Enforce unique Steam IDs across the tournament
  const existingSteamIds = await findSteamIdsInTournament(tournamentId);
  const conflictingSteamId = data.players.find((p) =>
    existingSteamIds.includes(p.steamId)
  );
  if (conflictingSteamId)
    throw new Error(
      `Steam ID ${conflictingSteamId.steamId} is already registered in this tournament`
    );

  // Enforce unique Steam IDs within the submitted team
  const steamIds = data.players.map((p) => p.steamId);
  const uniqueSteamIds = new Set(steamIds);
  if (uniqueSteamIds.size !== steamIds.length)
    throw new Error("Duplicate Steam IDs within the team are not allowed");

  const team = await dbCreate(tournamentId, data);

  // Auto-close registration when max teams reached
  const newCount = existingTeams.length + 1;
  if (newCount >= tournament.maxTeams) {
    await updateTournamentStatus(tournamentId, TournamentStatus.REGISTRATION_CLOSED);
  }

  return team;
}

export async function getTeams(tournamentId: string) {
  return findTeamsByTournament(tournamentId);
}
