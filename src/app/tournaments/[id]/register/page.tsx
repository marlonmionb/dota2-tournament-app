"use client";

import { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  fetchPlayerProfile,
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

export default function RegisterTeamPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState<PlayerState[]>(() =>
    Array.from({ length: 5 }, EMPTY_PLAYER)
  );

  const lookupTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array(5).fill(null)
  );

  if (status === "loading") {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p className="text-gray-600 mb-4">You must be signed in to register a team.</p>
        <Link
          href={`/auth/signin?callbackUrl=/tournaments/${id}/register`}
          className="rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  function patchPlayer(index: number, patch: Partial<PlayerState>) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function doLookup(index: number, input: string) {
    try {
      const accountId = parseSteamInput(input);
      const data = await fetchPlayerProfile(accountId);
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

    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      teamName: (form.elements.namedItem("teamName") as HTMLInputElement).value,
      captainName: players[0].nickname,
      players: players.map((p) => ({ nickname: p.nickname, steamId: p.steamId })),
    };

    try {
      const res = await fetch(`/api/tournaments/${id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "Something went wrong");
        return;
      }

      router.push(`/tournaments/${id}`);
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="mb-6">
        <Link href={`/tournaments/${id}`} className="text-sm text-red-500 hover:underline">
          ← Back to tournament
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Register Team</h1>

      {formError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
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
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Register Team"}
          </button>
          <Link
            href={`/tournaments/${id}`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
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
  onSteamInputChange: (index: number, value: string) => void;
  onNicknameChange: (value: string) => void;
};

function PlayerCard({ index, isCaptain, player, onSteamInputChange, onNicknameChange }: PlayerCardProps) {
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${isCaptain ? "border-amber-400 bg-amber-50/40" : ""}`}>
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
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
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
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 border px-3 py-2">
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
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      )}
    </div>
  );
}

