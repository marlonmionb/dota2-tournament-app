const STEAM_ID_OFFSET = 76561197960265728n;

/**
 * Converts a 64-bit Steam ID to a 32-bit Dota 2 account ID.
 * Accepts a string or bigint to avoid JavaScript number precision loss.
 */
export function steamIdToAccountId(steamId: string | bigint): number {
  const id = typeof steamId === "bigint" ? steamId : BigInt(steamId);
  const accountId = id - STEAM_ID_OFFSET;
  if (accountId < 0n) {
    throw new RangeError(`Invalid Steam ID: ${steamId}`);
  }
  return Number(accountId);
}

/**
 * Parses either a 64-bit Steam ID or a 32-bit Dota 2 account ID string
 * and returns the account ID.
 */
export function parseSteamInput(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty input");
  let val: bigint;
  try {
    val = BigInt(trimmed);
  } catch {
    throw new Error("Invalid Steam ID or Account ID");
  }
  if (val <= 0n) throw new RangeError("Steam ID or Account ID must be positive");
  if (val >= STEAM_ID_OFFSET) {
    return Number(val - STEAM_ID_OFFSET);
  }
  return Number(val);
}

// ─── OpenDota API ─────────────────────────────────────────────────────────────

export type OpenDotaPlayer = {
  rank_tier: number;
  leaderboard_rank: number;
  profile: {
    account_id: number;
    personaname: string;
    name: string | null;
    steamid: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    profileurl: string;
    loccountrycode: string | null;
    is_contributor: boolean;
    is_subscriber: boolean;
  };
};

const MEDAL_NAMES = [
  "Unranked",
  "Herald",
  "Guardian",
  "Crusader",
  "Archon",
  "Legend",
  "Ancient",
  "Divine",
  "Immortal",
] as const;

/** Returns a human-readable rank label, e.g. "Legend [3]" or "Immortal". */
export function rankTierToLabel(rankTier: number): string {
  if (!rankTier) return "Unranked";
  const medal = Math.floor(rankTier / 10);
  const stars = rankTier % 10;
  const name = MEDAL_NAMES[medal] ?? "Unknown";
  if (medal === 8) return "Immortal";
  return stars > 0 ? `${name} [${stars}]` : name;
}

/** Returns a Tailwind text-color class for a rank tier. */
export function rankTierColor(rankTier: number): string {
  const medal = Math.floor(rankTier / 10);
  switch (medal) {
    case 1: return "text-gray-400";        // Herald
    case 2: return "text-green-400";       // Guardian
    case 3: return "text-lime-400";        // Crusader
    case 4: return "text-blue-400";        // Archon
    case 5: return "text-teal-400";        // Legend
    case 6: return "text-purple-400";      // Ancient
    case 7: return "text-yellow-400";      // Divine
    case 8: return "text-orange-400";      // Immortal
    default: return "text-gray-500";       // Unranked
  }
}

/** Fetches a player profile from the OpenDota public API. */
export async function fetchPlayerProfile(accountId: number): Promise<OpenDotaPlayer> {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}`);
  if (!res.ok) throw new Error(`OpenDota API returned ${res.status}`);
  const data: unknown = await res.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("profile" in data) ||
    !(data as Record<string, unknown>).profile
  ) {
    throw new Error("Player profile not found or account is private");
  }
  return data as OpenDotaPlayer;
}
