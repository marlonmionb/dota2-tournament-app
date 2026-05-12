"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TournamentStatus } from "@prisma/client";
import { DOTA2_REGIONS } from "@/lib/regions";
import { Search, X, ChevronDown } from "lucide-react";

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

const ENTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Any Entry" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

type DropdownOption = { value: string; label: string };

function PillSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
}) {
  const selected = options.find((o) => o.value === value) ?? options[0];
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-gray-800 text-gray-300 text-xs font-medium rounded-full pl-3 pr-7 py-1.5 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-gray-700 transition-colors"
        aria-label={selected.label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
    </div>
  );
}

const STATUS_OPTIONS: { value: TournamentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: TournamentStatus.REGISTRATION_OPEN, label: "Registration Open" },
  { value: TournamentStatus.IN_PROGRESS, label: "In Progress" },
  { value: TournamentStatus.COMPLETED, label: "Completed" },
];

export function TournamentFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentRegion = searchParams.get("region") ?? "";
  const currentEntry = searchParams.get("entry") ?? "";
  const currentMaxRank = searchParams.get("maxRank") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync local input if the URL search param changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Debounce: push search param 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/tournaments?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasFilters = !!(currentStatus || currentRegion || currentEntry || currentMaxRank || currentSearch);

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
      {/* Search by name */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tournaments…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg pl-9 pr-9 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

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

      {/* Row 2: Dropdowns styled as pills */}
      <div className="flex flex-wrap items-center gap-2">
        <PillSelect
          value={currentRegion}
          options={[
            { value: "", label: "All Regions" },
            ...DOTA2_REGIONS.map((r) => ({ value: r.code, label: r.label })),
          ]}
          onChange={(v) => updateParam("region", v)}
        />

        <PillSelect
          value={currentEntry}
          options={ENTRY_OPTIONS}
          onChange={(v) => updateParam("entry", v)}
        />

        <PillSelect
          value={currentMaxRank}
          options={[
            { value: "", label: "Any Rank Cap" },
            ...Object.entries(RANK_TIER_LABELS).map(([tier, label]) => ({ value: tier, label })),
          ]}
          onChange={(v) => updateParam("maxRank", v)}
        />

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
