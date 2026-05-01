import { TournamentStatus } from "@prisma/client";
import { findTournamentById, updateTournamentStatus } from "@/repositories/tournament-repository";
import {
  createTeam as dbCreate,
  findTeamsByTournament,
  findTeamsByTournamentPublic,
} from "@/repositories/team-repository";
import { registerTeamSchema, type RegisterTeamInput } from "@/lib/validations";
import { parseSteamInput, fetchPlayerProfile } from "@/lib/steam";

export async function getPublicTeams(tournamentId: string) {
  return findTeamsByTournamentPublic(tournamentId);
}

async function resolveNickname(steamId: string): Promise<string> {
  try {
    const accountId = parseSteamInput(steamId);
    const profile = await fetchPlayerProfile(accountId);
    return profile.profile.personaname;
  } catch {
    return steamId; // fallback if OpenDota is unavailable
  }
}

export async function registerTeam(
  tournamentId: string,
  input: RegisterTeamInput,
  registeredById: string | null = null
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
  const existingSteamIds = existingTeams.flatMap((t) => t.players.map((p) => p.steamId));
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

  // Resolve each player's canonical Steam persona name server-side
  const verifiedPlayers = await Promise.all(
    data.players.map(async (p) => ({
      steamId: p.steamId,
      nickname: await resolveNickname(p.steamId),
    }))
  );

  const team = await dbCreate(tournamentId, { ...data, players: verifiedPlayers }, registeredById);

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
