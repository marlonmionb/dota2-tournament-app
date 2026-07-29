"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

interface Props {
  matchId: string;
  teamId: string;
  teamName: string;
}

export function PickWinnerButton({ matchId, teamId, teamName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: teamId }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        title={`Set ${teamName} as winner`}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-600 bg-gray-800 px-2 py-1 text-[11px] font-semibold text-gray-300 transition-colors hover:border-amber-500 hover:text-amber-400"
      >
        <Trophy className="w-3 h-3" />
        Select
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            if (!loading) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-2">Confirm Match Result</h2>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure <span className="font-semibold text-white">{teamName}</span> won this match? The
              match will be marked complete and the winner will advance automatically.
            </p>
            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-300 font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-gray-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Confirm Winner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
