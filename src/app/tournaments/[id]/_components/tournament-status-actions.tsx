"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  tournamentId: string;
  action: "open" | "close";
  label: string;
}

export function TournamentStatusAction({ tournamentId, action, label }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);

  const isCloseAction = action === "close";

  const buttonClass = isCloseAction
    ? "rounded-lg border border-red-800 bg-red-900 px-5 py-2 text-sm text-red-300 font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    : "rounded-lg bg-amber-500 px-5 py-2 text-sm text-gray-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const endpoint = action === "open" ? "open-registration" : "close-registration";
      const res = await fetch(`/api/tournaments/${tournamentId}/${endpoint}`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        if (json.error === "Registration deadline has already passed") {
          setDeadlineModalOpen(true);
        } else {
          setError(json.error ?? "Something went wrong");
        }
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

  function handleButtonClick() {
    if (isCloseAction) {
      setError(null);
      setOpen(true);
    } else {
      handleConfirm();
    }
  }

  return (
    <>
      <div className="inline-flex flex-col">
        <button
          onClick={handleButtonClick}
          disabled={loading}
          className={buttonClass}
        >
          {loading && !open ? "Updating..." : label}
        </button>
        {error && !open && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => { if (!loading) setOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-2">Close Registration</h2>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to close registration? After closing,{" "}
              <span className="text-red-400 font-semibold">no new teams can register</span>{" "}
              for this tournament.
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
                className="rounded-lg border border-red-800 bg-red-900 px-4 py-2 text-sm text-red-300 font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Closing..." : "Yes, Close Registration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deadlineModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setDeadlineModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 shadow-xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-amber-500" />
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-2">Registration Deadline Has Passed</h2>
              <p className="text-sm text-gray-400 mb-6">
                This tournament&apos;s registration deadline is in the past. Update the deadline before opening registration.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeadlineModalOpen(false)}
                  className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-300 font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <Link
                  href={`/tournaments/${tournamentId}/edit#registrationDeadline`}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Edit Tournament
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
