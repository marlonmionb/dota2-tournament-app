import { getTournaments } from "@/services/tournament-service";
import Link from "next/link";
import { TournamentStatus } from "@prisma/client";

const statusLabels: Record<TournamentStatus, string> = {
  DRAFT: "Draft",
  REGISTRATION_OPEN: "Registration Open",
  REGISTRATION_CLOSED: "Registration Closed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const statusColors: Record<TournamentStatus, string> = {
  DRAFT: "bg-gray-800 text-gray-300",
  REGISTRATION_OPEN: "bg-green-950 text-green-400",
  REGISTRATION_CLOSED: "bg-amber-950 text-amber-400",
  IN_PROGRESS: "bg-red-950 text-red-400",
  COMPLETED: "bg-slate-800 text-slate-400",
};

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          + Create Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          No tournaments yet. Be the first to create one!
        </p>
      ) : (
        <ul className="space-y-4">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tournaments/${t.id}`}
                className="block border border-gray-800 rounded-lg p-6 hover:border-amber-500 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{t.name}</h2>
                    {t.description && (
                      <p className="text-gray-400 mt-1 text-sm">{t.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      Max teams: {t.maxTeams} · Starts{" "}
                      {new Date(t.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[t.status]}`}
                  >
                    {statusLabels[t.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
