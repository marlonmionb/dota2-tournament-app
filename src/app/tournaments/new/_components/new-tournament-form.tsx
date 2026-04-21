"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTournamentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined,
      maxTeams: parseInt((form.elements.namedItem("maxTeams") as HTMLSelectElement).value, 10),
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement).value,
      registrationDeadline: (form.elements.namedItem("registrationDeadline") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }

      const tournament = await res.json();
      router.push(`/tournaments/${tournament.id}`);
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Create Tournament</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Tournament Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="maxTeams">
            Max Teams *
          </label>
          <select
            id="maxTeams"
            name="maxTeams"
            required
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {[2, 4, 8, 16].map((n) => (
              <option key={n} value={n}>
                {n} teams
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="registrationDeadline">
            Registration Deadline *
          </label>
          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            required
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">
            Start Date *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create Tournament"}
        </button>
      </form>
    </div>
  );
}
