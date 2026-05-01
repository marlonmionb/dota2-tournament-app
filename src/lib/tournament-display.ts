import { TournamentStatus } from "@prisma/client";

export const statusLabels: Record<TournamentStatus, string> = {
  DRAFT: "Draft",
  REGISTRATION_OPEN: "Registration Open",
  REGISTRATION_CLOSED: "Registration Closed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const statusColors: Record<TournamentStatus, string> = {
  DRAFT: "bg-gray-800 text-gray-300",
  REGISTRATION_OPEN: "bg-green-950 text-green-400",
  REGISTRATION_CLOSED: "bg-amber-950 text-amber-400",
  IN_PROGRESS: "bg-blue-950 text-blue-400",
  COMPLETED: "bg-slate-800 text-slate-400",
};
