import type {
  Tournament,
  Team,
  Player,
  Match,
  User,
  TournamentStatus,
  TournamentFormat,
  MatchStatus,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type { Tournament, Team, Player, Match, User, TournamentStatus, TournamentFormat, MatchStatus };

// ─── Enriched types used across the app ──────────────────────────────────────

export type TeamWithPlayers = Team & {
  players: Player[];
};

export type MatchWithTeams = Match & {
  teamA: Team | null;
  teamB: Team | null;
  winner: Team | null;
};

export type TournamentWithTeams = Tournament & {
  teams: TeamWithPlayers[];
};

export type TournamentWithMatches = Tournament & {
  matches: MatchWithTeams[];
  teams: Team[];
};

export type BracketRound = {
  round: number;
  matches: MatchWithTeams[];
};
