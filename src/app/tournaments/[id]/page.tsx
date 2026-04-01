import { getTournamentById } from "@/services/tournament-service";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TournamentStatus } from "@prisma/client";
import Link from "next/link";
import { TournamentStatusAction } from "./_components/tournament-status-actions";
import { GenerateBracketAction } from "./_components/generate-bracket-action";
import { BracketTree } from "./_components/bracket-tree";
import type { MatchWithTeams, BracketRound } from "@/types";

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
        <h1 className="text-3xl font-bold">{tournament.name}</h1>
        {tournament.description && (
          <p className="text-gray-600 mt-2">{tournament.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Status: <span className="font-medium">{statusLabel(tournament.status)}</span> · Max teams: {tournament.maxTeams} · Format: Single Elimination
        </p>
        <div className="mt-4 flex flex-wrap gap-3 items-start">
          {tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <Link
              href={`/tournaments/${tournament.id}/register`}
              className={
                isOrganizer
                  ? "inline-block rounded-lg border border-amber-300 bg-white px-5 py-2 text-sm text-amber-800 font-semibold hover:border-amber-400 hover:bg-amber-50 transition-colors"
                  : "inline-block rounded-lg bg-red-600 px-5 py-2 text-sm text-white font-semibold hover:bg-red-700 transition-colors"
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
        <h2 className="text-xl font-semibold mb-4">
          Teams ({tournament.teams.length}/{tournament.maxTeams})
        </h2>
        {tournament.teams.length === 0 ? (
          <p className="text-gray-500 text-sm">No teams registered yet.</p>
        ) : (
          <ul className="space-y-2">
            {tournament.teams.map((team) => (
              <li key={team.id} className="border rounded-lg px-4 py-3">
                <p className="font-medium">{team.teamName}</p>
                  <p className="text-xs text-gray-500">
                  Captain: {team.captainName} ·{" "}
                  {team.players.map((p) => p.nickname).join(", ")}
                </p>
              </li>
            ))}
          </ul>
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
              <p className="mt-1 text-sm text-stone-500">
                {hasBracket
                  ? "Single-elimination tree with winners advancing automatically."
                  : "No bracket generated yet."}
              </p>
            </div>
          </div>

          {hasBracket ? (
            <BracketTree rounds={rounds} getRoundLabel={roundLabel} />
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-6 text-sm text-stone-600">
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
