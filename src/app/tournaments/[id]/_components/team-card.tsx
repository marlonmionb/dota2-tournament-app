import { unstable_cache } from "next/cache";
import {
  steamIdToAccountId,
  fetchPlayerProfile,
  rankTierToLabel,
  rankTierColor,
  type OpenDotaPlayer,
} from "@/lib/steam";
import type { TeamWithPlayers } from "@/types";

type Props = {
  team: TeamWithPlayers;
};

const getCachedPlayerProfile = unstable_cache(
  async (steamId: string): Promise<OpenDotaPlayer | null> => {
    try {
      const accountId = steamIdToAccountId(steamId);
      return await fetchPlayerProfile(accountId);
    } catch {
      return null;
    }
  },
  ["opendota-player"],
  { revalidate: 3600 }
);

export async function TeamCard({ team }: Props) {
  const profiles = await Promise.all(
    team.players.map((p) => getCachedPlayerProfile(p.steamId))
  );

  return (
    <div className="border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-lg bg-gray-900 shrink-0 flex items-center justify-center overflow-hidden text-gray-600 text-xs select-none">
          {team.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logoUrl} alt={`${team.teamName} logo`} className="w-full h-full object-cover" />
          ) : (
            "Logo"
          )}
        </div>
        <h3 className="font-semibold text-base">{team.teamName}</h3>
      </div>
      <ul className="space-y-3">
        {team.players.map((player, i) => {
          const profile = profiles[i];
          const isCaptain = i === 0;
          const rankLabel = profile ? rankTierToLabel(profile.rank_tier) : null;
          const color = profile ? rankTierColor(profile.rank_tier) : "text-gray-400";
          const avatar = profile?.profile.avatarmedium ?? null;

          return (
            <li key={player.id} className="flex items-center gap-3">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={player.nickname}
                  width={40}
                  height={40}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 shrink-0 flex items-center justify-center text-gray-500 text-xs select-none">
                  ?
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {isCaptain && (
                    <span className="text-amber-400 text-sm leading-none" title="Captain">★</span>
                  )}
                  <span className="text-sm font-medium truncate">{player.nickname}</span>
                </div>
                {rankLabel ? (
                  <p className={`text-xs mt-0.5 ${color}`}>{rankLabel}</p>
                ) : (
                  <p className="text-xs mt-0.5 text-gray-400">Rank unavailable</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
