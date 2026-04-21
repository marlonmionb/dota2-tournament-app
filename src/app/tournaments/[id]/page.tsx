import { getTournamentById } from "@/services/tournament-service";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TournamentStatus } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { TournamentStatusAction } from "./_components/tournament-status-actions";
import { GenerateBracketAction } from "./_components/generate-bracket-action";
import { BracketTree } from "./_components/bracket-tree";
import { TeamCard } from "./_components/team-card";
import type { MatchWithTeams, BracketRound, TeamWithPlayers } from "@/types";

function groupMatchesByRound(matches: MatchWithTeams[]): BracketRound[] {
  const map = new Map<number, MatchWithTeams[]>();
  for (const match of matches) {
    const arr = map.get(match.round) ?? [];
    arr.push(match);
    map.set(match.round, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, m]) => ({ round, matches: m }));
}

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Quarterfinal";
  return `Round ${round}`;
}

function statusBadgeClass(status: TournamentStatus): string {
  switch (status) {
    case TournamentStatus.REGISTRATION_OPEN:
      return "border-green-700 bg-green-950 text-green-400";
    case TournamentStatus.REGISTRATION_CLOSED:
      return "border-amber-700 bg-amber-950 text-amber-400";
    case TournamentStatus.IN_PROGRESS:
      return "border-blue-700 bg-blue-950 text-blue-400";
    case TournamentStatus.COMPLETED:
      return "border-slate-600 bg-slate-800 text-slate-400";
    default:
      return "border-gray-700 bg-gray-800 text-gray-300";
  }
}

function statusLabel(status: TournamentStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const tournament = await getTournamentById(id).catch(() => null);
  if (!tournament) notFound();

  const isOrganizer = session?.user?.id === tournament.organizerId;

  const rounds = groupMatchesByRound(tournament.matches as MatchWithTeams[]);
  const hasBracket = rounds.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold leading-tight break-words max-w-prose">{tournament.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(tournament.status)}`}>
            {statusLabel(tournament.status)}
          </span>
          <span className="text-xs text-gray-500">Max teams: {tournament.maxTeams} · Single Elimination</span>
        </div>
        {tournament.description && (
          <p className="text-gray-400 mt-2 text-sm">{tournament.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3 items-start">
          {tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <Link
              href={`/tournaments/${tournament.id}/register`}
              className={
                isOrganizer
                  ? "inline-block rounded-lg border border-amber-700 bg-gray-950 px-5 py-2 text-sm text-amber-400 font-semibold hover:border-amber-500 hover:bg-amber-950/30 transition-colors"
                  : "inline-block rounded-lg bg-amber-500 px-5 py-2 text-sm text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
              }
            >
              Register Team
            </Link>
          )}
          {isOrganizer && tournament.status === TournamentStatus.DRAFT && (
            <TournamentStatusAction
              tournamentId={tournament.id}
              action="open"
              label="Open Registration"
            />
          )}
          {isOrganizer && tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <TournamentStatusAction
              tournamentId={tournament.id}
              action="close"
              label="Close Registration"
            />
          )}
          {isOrganizer &&
            tournament.status === TournamentStatus.REGISTRATION_CLOSED &&
            !hasBracket &&
            tournament.teams.length >= 2 && (
              <GenerateBracketAction tournamentId={tournament.id} />
            )}
        </div>
      </div>

      {/* Teams */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xl font-semibold">
            Teams ({tournament.teams.length}/{tournament.maxTeams})
          </h2>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(tournament.teams.length / tournament.maxTeams) * 100}%` }}
          />
        </div>
        {tournament.teams.length === 0 ? (
          <p className="text-gray-500 text-sm">No teams registered yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(tournament.teams as TeamWithPlayers[]).map((team) => (
              <Suspense
                key={team.id}
                fallback={
                  <div className="border border-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-800 rounded w-2/3" />
                          <div className="h-2 bg-gray-800 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <TeamCard team={team} />
              </Suspense>
            ))}
          </div>
        )}
      </section>

      {/* Bracket */}
      {(tournament.status === TournamentStatus.REGISTRATION_CLOSED ||
        tournament.status === TournamentStatus.IN_PROGRESS ||
        tournament.status === TournamentStatus.COMPLETED) && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Bracket</h2>
              <p className="mt-1 text-sm text-gray-500">
                {hasBracket
                  ? "Single-elimination tree with winners advancing automatically."
                  : "No bracket generated yet."}
              </p>
            </div>
          </div>

          {hasBracket ? (
            <BracketTree rounds={rounds} getRoundLabel={roundLabel} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-5 py-6 text-sm text-gray-400">
              {isOrganizer
                ? "Registration is closed. Use Generate Bracket to create the tournament tree."
                : "The organizer has not generated the bracket yet."}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
