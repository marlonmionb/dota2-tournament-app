"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  tournamentId: string;
  action: "open" | "close";
  label: string;
}

export function TournamentStatusAction({ tournamentId, action, label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCloseAction = action === "close";

  const buttonClass = isCloseAction
    ? "rounded-lg border border-red-800 bg-red-900 px-5 py-2 text-sm text-red-300 font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    : "rounded-lg bg-amber-500 px-5 py-2 text-sm text-gray-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  async function handleClick() {
    if (isCloseAction) {
      const confirmed = window.confirm(
        "Close registration? After closing, no new teams can register."
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={handleClick}
        disabled={loading}
        className={buttonClass}
      >
        {loading ? "Updating..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
