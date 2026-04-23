import { TournamentStatus } from "@prisma/client";
import {
  createTournament as dbCreate,
  findAllTournaments,
  findTournamentById,
  findTournamentByIdPublic,
  updateTournamentStatus,
  updateTournament as dbUpdate,
  deleteTournamentById,
} from "@/repositories/tournament-repository";
import { findTeamsByTournament } from "@/repositories/team-repository";
import { createTournamentSchema, updateTournamentSchema, type CreateTournamentInput } from "@/lib/validations";

export async function getTournaments() {
  return findAllTournaments();
}

export async function getTournamentById(id: string) {
  const tournament = await findTournamentById(id);
  if (!tournament) throw new Error("Tournament not found");
  return tournament;
}

export async function getTournamentByIdPublic(id: string) {
  const tournament = await findTournamentByIdPublic(id);
  if (!tournament) throw new Error("Tournament not found");
  return tournament;
}

export async function createTournament(
  organizerId: string,
  input: CreateTournamentInput
) {
  const data = createTournamentSchema.parse(input);
  return dbCreate(organizerId, data);
}

export async function editTournament(
  tournamentId: string,
  organizerId: string,
  input: unknown
) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (tournament.status !== TournamentStatus.DRAFT)
    throw new Error("Only draft tournaments can be edited");
  const data = updateTournamentSchema.parse(input);
  return dbUpdate(tournamentId, data);
}

export async function openRegistration(tournamentId: string, organizerId: string) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (tournament.status !== TournamentStatus.DRAFT)
    throw new Error("Tournament is not in draft state");
  return updateTournamentStatus(tournamentId, TournamentStatus.REGISTRATION_OPEN);
}

export async function closeRegistration(tournamentId: string, organizerId: string) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (tournament.status !== TournamentStatus.REGISTRATION_OPEN)
    throw new Error("Registration is not open");
  return updateTournamentStatus(tournamentId, TournamentStatus.REGISTRATION_CLOSED);
}

export async function completeTournament(tournamentId: string, organizerId: string) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  const pendingMatches = tournament.matches.filter(
    (m) => m.status !== "COMPLETED"
  );
  if (pendingMatches.length > 0)
    throw new Error("All matches must be completed before closing the tournament");
  return updateTournamentStatus(tournamentId, TournamentStatus.COMPLETED);
}

export async function deleteTournament(tournamentId: string, organizerId: string) {
  const tournament = await findTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.organizerId !== organizerId) throw new Error("Forbidden");
  if (tournament.status === TournamentStatus.COMPLETED)
    throw new Error("Completed tournaments cannot be deleted");
  return deleteTournamentById(tournamentId);
}
