import type { BracketRound, MatchWithTeams } from "@/types";
import { PickWinnerButton } from "./pick-winner-button";

// Must match Tailwind gap-8 (32px) used between columns
const COL_GAP = 32;
// Vertical space allocated per match in round 1; doubles each round for proper alignment
const SLOT_BASE = 200;

interface Props {
  rounds: BracketRound[];
  getRoundLabel: (round: number, totalRounds: number) => string;
  canRecordResults?: boolean;
}

function TeamSlot({
  name,
  logoUrl,
  isWinner,
  isLoser,
  pickWinner,
}: {
  name: string;
  logoUrl?: string | null;
  isWinner: boolean;
  isLoser: boolean;
  pickWinner?: { matchId: string; teamId: string };
}) {
  return (
    <div
      className={
        isWinner
          ? "flex items-center gap-2 rounded-xl bg-amber-950/50 px-3 py-3 font-semibold text-amber-400"
          : isLoser
          ? "flex items-center gap-2 rounded-xl bg-red-950/50 px-3 py-3 text-red-400/70"
          : "flex items-center gap-2 rounded-xl bg-gray-800 px-3 py-3 text-gray-300"
      }
    >
      <div className="w-7 h-7 rounded shrink-0 overflow-hidden bg-gray-700 flex items-center justify-center text-gray-500 text-[10px] select-none">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <span className="truncate flex-1">{name}</span>
      {pickWinner && (
        <PickWinnerButton matchId={pickWinner.matchId} teamId={pickWinner.teamId} teamName={name} />
      )}
    </div>
  );
}

function MatchCard({
  match,
  matchIndex,
  slotSize,
  showConnector,
  canRecordResults,
}: {
  match: MatchWithTeams;
  matchIndex: number;
  slotSize: number;
  showConnector: boolean;
  canRecordResults: boolean;
}) {
  const isTopOfPair = matchIndex % 2 === 0;
  const canPickWinner =
    canRecordResults && match.status !== "COMPLETED" && !!match.teamAId && !!match.teamBId;

  return (
    // Each match occupies a fixed slot; card is vertically centered within it
    <div className="relative flex items-center" style={{ height: `${slotSize}px` }}>
      <div className="relative w-full rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <div className="space-y-2">
          <TeamSlot
            name={match.teamA?.teamName ?? "TBD"}
            logoUrl={match.teamA?.logoUrl}
            isWinner={match.winnerId === match.teamAId}
            isLoser={!!match.winnerId && !!match.teamAId && match.winnerId !== match.teamAId}
            pickWinner={
              canPickWinner && match.teamAId ? { matchId: match.id, teamId: match.teamAId } : undefined
            }
          />
          <TeamSlot
            name={match.teamB?.teamName ?? "TBD"}
            logoUrl={match.teamB?.logoUrl}
            isWinner={match.winnerId === match.teamBId}
            isLoser={!!match.winnerId && !!match.teamBId && match.winnerId !== match.teamBId}
            pickWinner={
              canPickWinner && match.teamBId ? { matchId: match.id, teamId: match.teamBId } : undefined
            }
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Match</span>
          <span>{match.winner ? `Winner: ${match.winner.teamName}` : "Pending"}</span>
        </div>
      </div>

      {showConnector && (
        <>
          {/* Horizontal stub: card right edge → middle of the gap */}
          <div
            className="absolute bg-gray-600 pointer-events-none"
            style={{ top: "50%", left: "100%", width: `${COL_GAP / 2}px`, height: "1px", transform: "translateY(-0.5px)" }}
          />

          {isTopOfPair ? (
            <>
              {/* Vertical bar: top card center → pair midpoint (= bottom of this slot) */}
              <div
                className="absolute bg-gray-600 pointer-events-none"
                style={{ top: "50%", left: `calc(100% + ${COL_GAP / 2}px)`, width: "1px", height: `${slotSize / 2}px` }}
              />
              {/* Horizontal: pair midpoint → next card left edge */}
              <div
                className="absolute bg-gray-600 pointer-events-none"
                style={{ top: `${slotSize}px`, left: `calc(100% + ${COL_GAP / 2}px)`, width: `${COL_GAP / 2}px`, height: "1px", transform: "translateY(-0.5px)" }}
              />
            </>
          ) : (
            /* Vertical bar: pair midpoint (= top of this slot) → bottom card center */
            <div
              className="absolute bg-gray-600 pointer-events-none"
              style={{ top: "0", left: `calc(100% + ${COL_GAP / 2}px)`, width: "1px", height: `${slotSize / 2}px` }}
            />
          )}
        </>
      )}
    </div>
  );
}

export function BracketTree({ rounds, getRoundLabel, canRecordResults = false }: Props) {
  const totalRounds = rounds.length;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-8">
        {rounds.map(({ round, matches }, roundIndex) => {
          const isLastRound = roundIndex === rounds.length - 1;
          // Slot doubles each round so matches stay aligned across columns
          const slotSize = Math.pow(2, roundIndex) * SLOT_BASE;

          return (
            <section key={round} className="min-w-[260px]">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                {getRoundLabel(round, totalRounds)}
              </h3>
              <div>
                {matches.map((match, matchIndex) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    matchIndex={matchIndex}
                    slotSize={slotSize}
                    showConnector={!isLastRound}
                    canRecordResults={canRecordResults}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}