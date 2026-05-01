"use client";

import Link from "next/link";

export default function TournamentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[40vh] text-center">
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        {error.message ?? "An unexpected error occurred while loading this tournament."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-amber-500 px-5 py-2 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/tournaments"
          className="rounded-lg border border-gray-700 px-5 py-2 font-semibold text-gray-300 hover:border-gray-500 transition-colors"
        >
          Back to tournaments
        </Link>
      </div>
    </div>
  );
}
