import { Tournament, TournamentStatus } from "@prisma/client";

export function canRegister(tournament: Tournament): boolean {
  return (
    tournament.status === TournamentStatus.REGISTRATION_OPEN &&
    new Date() < tournament.registrationDeadline
  );
}

export function canGenerateBracket(
  tournament: Tournament,
  teamCount: number
): boolean {
  return (
    tournament.status === TournamentStatus.REGISTRATION_CLOSED && teamCount >= 2
  );
}

export function canRecordResult(tournament: Tournament): boolean {
  return tournament.status === TournamentStatus.IN_PROGRESS;
}
