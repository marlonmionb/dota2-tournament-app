import type { BracketRound, MatchWithTeams } from "@/types";

interface Props {
  rounds: BracketRound[];
  getRoundLabel: (round: number, totalRounds: number) => string;
}

function TeamSlot({
  name,
  isWinner,
}: {
  name: string;
  isWinner: boolean;
}) {
  return (
    <div
      className={
        isWinner
          ? "rounded-xl bg-red-950/50 px-4 py-3 font-semibold text-red-400"
          : "rounded-xl bg-gray-800 px-4 py-3 text-gray-300"
      }
    >
      {name}
    </div>
  );
}

function MatchCard({
  match,
  showConnector,
}: {
  match: MatchWithTeams;
  showConnector: boolean;
}) {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <div className="space-y-2">
          <TeamSlot
            name={match.teamA?.teamName ?? "TBD"}
            isWinner={match.winnerId === match.teamAId}
          />
          <TeamSlot
            name={match.teamB?.teamName ?? "TBD"}
            isWinner={match.winnerId === match.teamBId}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Match</span>
          <span>{match.winner ? `Winner: ${match.winner.teamName}` : "Pending"}</span>
        </div>
      </div>
      {showConnector && (
        <div className="pointer-events-none absolute right-[-24px] top-1/2 h-px w-6 -translate-y-1/2 bg-gray-600" />
      )}
    </div>
  );
}

export function BracketTree({ rounds, getRoundLabel }: Props) {
  const totalRounds = rounds.length;
  const treeHeight = Math.max(420, (rounds[0]?.matches.length ?? 1) * 140);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-8">
        {rounds.map(({ round, matches }, roundIndex) => (
          <section key={round} className="min-w-[260px]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {getRoundLabel(round, totalRounds)}
            </h3>
            <div
              className="flex flex-col justify-around gap-6"
              style={{ minHeight: `${treeHeight}px` }}
            >
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  showConnector={roundIndex < rounds.length - 1}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}