"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TournamentStatus } from "@prisma/client";
import { DOTA2_REGIONS } from "@/lib/regions";
import { X } from "lucide-react";

const RANK_TIER_LABELS: Record<number, string> = {
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal",
};

const STATUS_OPTIONS: { value: TournamentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: TournamentStatus.REGISTRATION_OPEN, label: "Registration Open" },
  { value: TournamentStatus.IN_PROGRESS, label: "In Progress" },
  { value: TournamentStatus.COMPLETED, label: "Completed" },
  { value: TournamentStatus.DRAFT, label: "Draft" },
];

export function TournamentFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentRegion = searchParams.get("region") ?? "";
  const currentEntry = searchParams.get("entry") ?? "";
  const currentMaxRank = searchParams.get("maxRank") ?? "";

  const hasFilters = !!(currentStatus || currentRegion || currentEntry || currentMaxRank);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/tournaments?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/tournaments");
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Row 1: Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam("status", value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentStatus === value
                ? "bg-amber-500 text-gray-950"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Row 2: Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={currentRegion}
          onChange={(e) => updateParam("region", e.target.value)}
          className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">All Regions</option>
          {DOTA2_REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={currentEntry}
          onChange={(e) => updateParam("entry", e.target.value)}
          className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">Any Entry</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={currentMaxRank}
          onChange={(e) => updateParam("maxRank", e.target.value)}
          className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="">Any Rank Cap</option>
          {Object.entries(RANK_TIER_LABELS).map(([tier, label]) => (
            <option key={tier} value={tier}>
              {label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
