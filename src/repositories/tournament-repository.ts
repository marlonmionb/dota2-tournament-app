import { prisma } from "@/lib/prisma";
import { TournamentStatus } from "@prisma/client";
import type { CreateTournamentInput, UpdateTournamentInput } from "@/lib/validations";

export async function findAllTournaments() {
  return prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { id: true, name: true, image: true } },
      _count: { select: { teams: true } },
    },
  });
}

export async function findTournamentById(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, image: true } },
      teams: { include: { players: true } },
      matches: {
        include: { teamA: true, teamB: true, winner: true },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function createTournament(
  organizerId: string,
  data: CreateTournamentInput
) {
  return prisma.tournament.create({
    data: { ...data, organizerId },
  });
}

export async function updateTournamentStatus(
  id: string,
  status: TournamentStatus
) {
  return prisma.tournament.update({ where: { id }, data: { status } });
}

export async function updateTournament(
  id: string,
  data: UpdateTournamentInput
) {
  return prisma.tournament.update({ where: { id }, data });
}
