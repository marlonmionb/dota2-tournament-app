"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  parseSteamInput,
  rankTierColor,
  rankTierToLabel,
  type OpenDotaPlayer,
} from "@/lib/steam";

type PlayerState = {
  input: string;
  steamId: string;
  nickname: string;
  profile: OpenDotaPlayer | null;
  loading: boolean;
  error: string | null;
};

const EMPTY_PLAYER = (): PlayerState => ({
  input: "",
  steamId: "",
  nickname: "",
  profile: null,
  loading: false,
  error: null,
});

export default function RegisterTeamForm({ tournamentId, maxRankTier }: { tournamentId: string; maxRankTier: number | null }) {
  const router = useRouter();

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState<PlayerState[]>(() =>
    Array.from({ length: 5 }, EMPTY_PLAYER)
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const lookupTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array(5).fill(null)
  );

  function patchPlayer(index: number, patch: Partial<PlayerState>) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function doLookup(index: number, input: string) {
    try {
      const accountId = parseSteamInput(input);
      const res = await fetch(`/api/steam/${accountId}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Player not found");
      }
      const data: OpenDotaPlayer = await res.json();
      patchPlayer(index, {
        steamId: data.profile.steamid,
        nickname: data.profile.personaname,
        profile: data,
        loading: false,
        error: null,
      });
    } catch (err) {
      patchPlayer(index, {
        steamId: "",
        profile: null,
        loading: false,
        error: err instanceof Error ? err.message : "Player not found",
      });
    }
  }

  function handleSteamInputChange(index: number, value: string) {
    if (lookupTimers.current[index]) clearTimeout(lookupTimers.current[index]!);

    if (!value.trim()) {
      patchPlayer(index, { input: value, steamId: "", nickname: "", profile: null, loading: false, error: null });
      return;
    }

    patchPlayer(index, { input: value, loading: true, error: null, profile: null, steamId: "" });

    lookupTimers.current[index] = setTimeout(() => doLookup(index, value), 600);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const allResolved = players.every((p) => p.steamId && p.nickname);
    if (!allResolved) {
      setFormError("All 5 players must have a valid Steam profile loaded.");
      return;
    }

    if (maxRankTier != null) {
      const violatingPlayer = players.find((p) => {
        const tier = p.profile?.rank_tier;
        if (!tier) return false;
        return Math.floor(tier / 10) > maxRankTier;
      });
      if (violatingPlayer) {
        const playerIndex = players.indexOf(violatingPlayer) + 1;
        const maxLabel = rankTierToLabel(maxRankTier * 10);
        const playerRankLabel = rankTierToLabel(violatingPlayer.profile!.rank_tier);
        setFormError(
          `Player ${playerIndex} (${violatingPlayer.nickname}) is ranked ${playerRankLabel}, which exceeds the maximum allowed rank of ${maxLabel} for this tournament.`
        );
        return;
      }
    }

    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      teamName: (form.elements.namedItem("teamName") as HTMLInputElement).value,
      captainName: players[0].nickname,
      logoUrl: logoUrl ?? "",
      players: players.map((p) => ({ nickname: p.nickname, steamId: p.steamId })),
    };

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "Something went wrong");
        return;
      }

      router.push(`/tournaments/${tournamentId}`);
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="mb-6">
        <Link href={`/tournaments/${tournamentId}`} className="text-sm text-amber-500 hover:underline">
          ← Back to tournament
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Register Team</h1>

      {formError && (
        <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="teamName">
              Team Name *
            </label>
            <input
              id="teamName"
              name="teamName"
              type="text"
              required
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Team Logo */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="teamLogo">
              Team Logo <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900 shrink-0 flex items-center justify-center overflow-hidden text-gray-600 text-xs select-none">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Team logo preview" className="w-full h-full object-cover" />
                ) : (
                  "Logo"
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  id="teamLogo"
                  name="teamLogo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={logoUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoError(null);
                    setLogoPreview(URL.createObjectURL(file));
                    setLogoUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
                      const json = await res.json();
                      if (!res.ok) {
                        setLogoError(json.error ?? "Upload failed");
                        setLogoPreview(null);
                      } else {
                        setLogoUrl(json.url);
                      }
                    } catch {
                      setLogoError("Upload failed. Please try again.");
                      setLogoPreview(null);
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                  className="text-sm text-gray-400 file:mr-3 file:rounded-lg file:border file:border-gray-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">JPEG, PNG, WebP or GIF · max 2 MB</p>
                {logoUploading && <p className="text-xs text-amber-400">Uploading…</p>}
                {logoError && <p className="text-xs text-red-500">{logoError}</p>}
                {logoUrl && !logoUploading && <p className="text-xs text-green-500">Logo uploaded ✓</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Players */}
        <div>
          <h2 className="text-base font-semibold mb-3">Players (5 required)</h2>
          <p className="text-xs text-gray-500 mb-3">Player 1 will be set as the team captain.</p>
          <div className="space-y-3">
            {players.map((player, i) => (
              <PlayerCard
                key={i}
                index={i}
                isCaptain={i === 0}
                player={player}
                maxRankTier={maxRankTier}
                onSteamInputChange={handleSteamInputChange}
                onNicknameChange={(val) => patchPlayer(i, { nickname: val })}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Register Team"}
          </button>
          <Link
            href={`/tournaments/${tournamentId}`}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────

type PlayerCardProps = {
  index: number;
  isCaptain: boolean;
  player: PlayerState;
  maxRankTier: number | null;
  onSteamInputChange: (index: number, value: string) => void;
  onNicknameChange: (value: string) => void;
};

function PlayerCard({ index, isCaptain, player, maxRankTier, onSteamInputChange, onNicknameChange }: PlayerCardProps) {
  const rankExceeded =
    maxRankTier != null &&
    player.profile != null &&
    player.profile.rank_tier > 0 &&
    Math.floor(player.profile.rank_tier / 10) > maxRankTier;
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${isCaptain ? "border-amber-700 bg-amber-950/30" : "border-gray-700"}`}>
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Player {index + 1}
        </p>
        {isCaptain && (
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Captain</span>
        )}
      </div>

      {/* Steam ID / Account ID input */}
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor={`steam-${index}`}>
          Steam ID or Account ID *
        </label>
        <div className="relative">
          <input
            id={`steam-${index}`}
            type="text"
            value={player.input}
            onChange={(e) => onSteamInputChange(index, e.target.value)}
            placeholder="e.g. 76561198006409530 or 46143802"
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-8"
          />
          {player.loading && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </span>
          )}
        </div>
        {player.error && (
          <p className="mt-1 text-xs text-red-500">{player.error}</p>
        )}
      </div>

      {/* Profile preview */}
      {player.profile && (
        <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${rankExceeded ? "bg-red-950/40 border-red-700" : "bg-gray-800 border-gray-700"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player.profile.profile.avatarmedium}
            alt={player.profile.profile.personaname}
            className="w-10 h-10 rounded"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{player.profile.profile.personaname}</p>
            <p className={`text-xs font-medium ${rankTierColor(player.profile.rank_tier)}`}>
              {rankTierToLabel(player.profile.rank_tier)}
            </p>
            {rankExceeded && (
              <p className="text-xs text-red-400 font-medium mt-0.5">
                ⚠ Rank exceeds tournament maximum ({rankTierToLabel(maxRankTier! * 10)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Nickname — pre-filled but editable */}
      {player.profile && (
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor={`nickname-${index}`}>
            Nickname *
          </label>
          <input
            id={`nickname-${index}`}
            type="text"
            required
            value={player.nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}
    </div>
  );
}
