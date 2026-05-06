import { getTournamentById } from "@/services/tournament-service";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TournamentStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Trophy, DollarSign, Radio, ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import { currencySymbol } from "@/lib/currencies";
import { DOTA2_REGIONS } from "@/lib/regions";
import { TournamentStatusAction } from "./_components/tournament-status-actions";
import { GenerateBracketAction } from "./_components/generate-bracket-action";
import { DeleteTournamentAction } from "./_components/delete-tournament-action";
import { BracketTree } from "./_components/bracket-tree";
import { TeamCard } from "./_components/team-card";
import type { MatchWithTeams, BracketRound, TeamWithPlayers } from "@/types";
import { statusLabels } from "@/lib/tournament-display";
import { medalLabel } from "@/lib/steam";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id).catch(() => null);
  if (!tournament) return {};

  const title = `${tournament.name} — Draft Arena`;
  const description = tournament.description
    ?? `${statusLabels[tournament.status]} · Up to ${tournament.maxTeams} teams · Single Elimination`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(tournament.imageUrl && {
        images: [{ url: tournament.imageUrl, width: 1200, height: 630, alt: tournament.name }],
      }),
    },
    twitter: {
      card: tournament.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(tournament.imageUrl && { images: [tournament.imageUrl] }),
    },
  };
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
      <div className="mb-6">
        <Link href="/tournaments" className="text-sm text-amber-500 hover:underline">
          ← Back to tournaments
        </Link>
      </div>

      {/* Banner */}
      {tournament.imageUrl && (
        <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-8 bg-gray-900">
          <Image
            src={tournament.imageUrl}
            alt={tournament.name}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold leading-tight break-words max-w-prose">{tournament.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(tournament.status)}`}>
            {statusLabels[tournament.status]}
          </span>
          <span className="text-xs text-gray-500">
            Max teams: {tournament.maxTeams} · Single Elimination
            {tournament.region && (
              <> · {DOTA2_REGIONS.find((r) => r.code === tournament.region)?.label ?? tournament.region}</>
            )}
          </span>
          {tournament.maxRankTier != null && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-800 bg-rose-950 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
              <ShieldAlert className="w-3 h-3" />
              Max rank: {medalLabel(tournament.maxRankTier)}
            </span>
          )}
        </div>
        {tournament.description && (
          <p className="text-gray-400 mt-2 text-sm">{tournament.description}</p>
        )}
        {(tournament.prizePool != null || tournament.entryFee != null || tournament.discordUrl || tournament.streamUrl) && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            {tournament.prizePool != null && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Trophy className="w-4 h-4" />
                <span>{currencySymbol(tournament.currency)}{Number(tournament.prizePool).toFixed(2)}</span>
              </span>
            )}
            {tournament.entryFee != null && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <DollarSign className="w-4 h-4" />
                <span>Entry fee: {currencySymbol(tournament.currency)}{tournament.entryFee}</span>
              </span>
            )}
            {tournament.discordUrl && (
              <a
                href={tournament.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 13.93 13.93 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Discord</span>
              </a>
            )}
            {tournament.streamUrl && (
              <a
                href={tournament.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Radio className="w-4 h-4" />
                <span>Watch Stream</span>
              </a>
            )}
          </div>
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
            <Link
              href={`/tournaments/${tournament.id}/edit`}
              className="inline-block rounded-lg border border-gray-600 bg-gray-900 px-5 py-2 text-sm text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
            >
              Edit
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
          {isOrganizer && tournament.status !== TournamentStatus.COMPLETED && (
            <DeleteTournamentAction tournamentId={tournament.id} />
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
                <TeamCard
                  team={team}
                  editHref={
                    isOrganizer || session?.user?.id === team.registeredById
                      ? `/tournaments/${tournament.id}/teams/${team.id}/edit`
                      : undefined
                  }
                />
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
