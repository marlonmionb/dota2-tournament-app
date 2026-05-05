import { TournamentStatus } from "@prisma/client";
import { findTournamentById, updateTournamentStatus } from "@/repositories/tournament-repository";
import {
  createTeam as dbCreate,
  findTeamsByTournament,
  findTeamsByTournamentPublic,
  findTeamById,
  updateTeam as dbUpdate,
} from "@/repositories/team-repository";
import { registerTeamSchema, type RegisterTeamInput } from "@/lib/validations";
import { parseSteamInput, fetchPlayerProfile } from "@/lib/steam";
import { canRegister } from "@/lib/tournament-rules";

export async function getPublicTeams(tournamentId: string) {
  return findTeamsByTournamentPublic(tournamentId);
}

async function resolveNickname(steamId: string): Promise<string> {
  // Let format errors throw — the schema already validates before we get here.
  // Only swallow network/API failures from OpenDota.
  const accountId = parseSteamInput(steamId);
  try {
    const profile = await fetchPlayerProfile(accountId);
    return profile.profile.personaname;
  } catch {
    return steamId; // fallback if OpenDota is unavailable
  }
}

async function resolvePlayerWithRank(
  steamId: string
): Promise<{ steamId: string; nickname: string; rankTier: number | null }> {
  const accountId = parseSteamInput(steamId);
  try {
    const profile = await fetchPlayerProfile(accountId);
    return {
      steamId,
      nickname: profile.profile.personaname,
      rankTier: profile.rank_tier ?? null,
    };
  } catch {
    return { steamId, nickname: steamId, rankTier: null };
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
  if (!canRegister(tournament))
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

  // One team per user per tournament
  if (registeredById && existingTeams.some((t) => t.registeredById === registeredById))
    throw new Error("You have already registered a team for this tournament");

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

export async function getTeamById(teamId: string) {
  return findTeamById(teamId);
}

export async function editTeam(
  tournamentId: string,
  teamId: string,
  requestingUserId: string,
  input: unknown
) {
  const team = await findTeamById(teamId);
  if (!team || team.tournamentId !== tournamentId) throw new Error("Team not found");

  const tournament = await findTournamentById(team.tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const isOrganizer = tournament.organizerId === requestingUserId;
  const isRegistrant = team.registeredById === requestingUserId;
  if (!isOrganizer && !isRegistrant) throw new Error("Forbidden");

  // Registrants can only edit while registration is open
  if (isRegistrant && !isOrganizer && tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
    throw new Error("Registration is not open for this tournament");
  }
  // Organizers can only edit before the bracket is generated
  if (
    isOrganizer &&
    tournament.status !== TournamentStatus.REGISTRATION_OPEN &&
    tournament.status !== TournamentStatus.REGISTRATION_CLOSED
  ) {
    throw new Error("Teams can only be edited before the tournament is in progress");
  }

  const data = registerTeamSchema.parse(input);

  // Enforce unique team name (excluding this team)
  const existingTeams = await findTeamsByTournament(team.tournamentId);
  const duplicate = existingTeams.find(
    (t) => t.id !== teamId && t.teamName.toLowerCase() === data.teamName.toLowerCase()
  );
  if (duplicate) throw new Error("A team with this name is already registered");

  // Enforce unique Steam IDs across tournament (excluding players from this team)
  const otherTeamsSteamIds = existingTeams
    .filter((t) => t.id !== teamId)
    .flatMap((t) => t.players.map((p) => p.steamId));
  const conflicting = data.players.find((p) => otherTeamsSteamIds.includes(p.steamId));
  if (conflicting)
    throw new Error("One or more Steam IDs are already registered in this tournament");

  // Enforce unique Steam IDs within the submitted team
  const steamIds = data.players.map((p) => p.steamId);
  if (new Set(steamIds).size !== steamIds.length)
    throw new Error("Duplicate Steam IDs within the team are not allowed");

  // Resolve canonical Steam persona names and rank tiers server-side
  const verifiedPlayers = await Promise.all(data.players.map((p) => resolvePlayerWithRank(p.steamId)));

  // Enforce max rank tier server-side (client check is advisory only)
  if (tournament.maxRankTier != null) {
    const offender = verifiedPlayers.find(
      (p) => p.rankTier != null && p.rankTier > 0 && Math.floor(p.rankTier / 10) > tournament.maxRankTier!
    );
    if (offender)
      throw new Error(`Player ${offender.nickname} exceeds the maximum rank tier for this tournament`);
  }

  return dbUpdate(teamId, {
    ...data,
    captainName: verifiedPlayers[0].nickname, // always use server-verified name
    players: verifiedPlayers.map(({ steamId, nickname }) => ({ steamId, nickname })),
  });
}
