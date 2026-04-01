"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const EMPTY_PLAYER = { nickname: "", steamId: "" };

export default function RegisterTeamPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState(Array.from({ length: 5 }, () => ({ ...EMPTY_PLAYER })));

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

  function updatePlayer(index: number, field: "nickname" | "steamId", value: string) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      teamName: (form.elements.namedItem("teamName") as HTMLInputElement).value,
      captainName: (form.elements.namedItem("captainName") as HTMLInputElement).value,
      players,
    };

    try {
      const res = await fetch(`/api/tournaments/${id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }

      router.push(`/tournaments/${id}`);
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
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

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="captainName">
              Captain Name *
            </label>
            <input
              id="captainName"
              name="captainName"
              type="text"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Players */}
        <div>
          <h2 className="text-base font-semibold mb-3">Players (5 required)</h2>
          <div className="space-y-3">
            {players.map((player, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Player {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" htmlFor={`nickname-${i}`}>
                      Nickname *
                    </label>
                    <input
                      id={`nickname-${i}`}
                      type="text"
                      required
                      value={player.nickname}
                      onChange={(e) => updatePlayer(i, "nickname", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" htmlFor={`steamId-${i}`}>
                      Steam ID *
                    </label>
                    <input
                      id={`steamId-${i}`}
                      type="text"
                      required
                      value={player.steamId}
                      onChange={(e) => updatePlayer(i, "steamId", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register Team"}
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
