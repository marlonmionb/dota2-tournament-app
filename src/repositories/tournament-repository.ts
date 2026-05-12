import { prisma } from "@/lib/prisma";
import { Prisma, TournamentStatus } from "@prisma/client";
import type { CreateTournamentInput, UpdateTournamentInput } from "@/lib/validations";

export interface TournamentFilters {
  status?: TournamentStatus;
  region?: string;
  entry?: "free" | "paid";
  maxRank?: number;
  search?: string;
  sort?: "startDate" | "registrationDeadline" | "createdAt";
}

export async function findAllTournaments() {
  return prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { id: true, name: true, image: true } },
      _count: { select: { teams: true } },
    },
  });
}

export async function findHomepageTournaments() {
  return Promise.all([
    prisma.tournament.findMany({
      where: { status: { in: [TournamentStatus.REGISTRATION_OPEN, TournamentStatus.IN_PROGRESS] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { teams: true } } },
    }),
    prisma.tournament.findMany({
      where: { status: TournamentStatus.COMPLETED },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { _count: { select: { teams: true } } },
    }),
  ]);
}

export async function findAllTournamentsPaginated(
  page: number,
  pageSize: number,
  filters: TournamentFilters = {}
) {
  const skip = (page - 1) * pageSize;

  const where: Prisma.TournamentWhereInput = {};
  if (filters.status) {
    where.status = filters.status;
  } else {
    where.status = { not: TournamentStatus.DRAFT };
  }
  if (filters.region) where.region = filters.region;
  if (filters.entry === "free") where.OR = [{ entryFee: null }, { entryFee: 0 }];
  if (filters.entry === "paid") where.entryFee = { gt: 0 };
  if (filters.maxRank != null) where.maxRankTier = filters.maxRank;
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };

  const orderBy: Prisma.TournamentOrderByWithRelationInput =
    filters.sort === "registrationDeadline"
      ? { registrationDeadline: "asc" }
      : filters.sort === "createdAt"
      ? { createdAt: "desc" }
      : { startDate: "asc" }; // default: soonest start

  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
      skip,
      take: pageSize,
      where,
      orderBy,
      include: {
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { teams: true } },
      },
    }),
    prisma.tournament.count({ where }),
  ]);
  return { tournaments, total };
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

export async function findTournamentByIdPublic(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true, image: true } },
      teams: {
        include: {
          players: { select: { id: true, nickname: true } },
        },
      },
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

export async function countTournamentsByOrganizer(organizerId: string) {
  return prisma.tournament.count({ where: { organizerId } });
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

export async function deleteTournamentById(id: string) {
  return prisma.tournament.delete({ where: { id } });
}
