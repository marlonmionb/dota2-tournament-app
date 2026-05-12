import { Suspense } from "react";
import { getTournamentsPaginated } from "@/services/tournament-service";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { TournamentStatus } from "@prisma/client";
import { Trophy, ShieldAlert, ChevronLeft, ChevronRight, CalendarX, MapPin } from "lucide-react";
import { currencySymbol } from "@/lib/currencies";
import { TournamentFilterBar } from "./_components/tournament-filter-bar";
import { statusLabels, statusColors } from "@/lib/tournament-display";
import { medalLabel } from "@/lib/steam";
import { DOTA2_REGIONS } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Tournaments — Draft Arena",
  description: "Browse and join amateur Dota 2 tournaments. Filter by status, region, rank, and entry fee.",
};

const PAGE_SIZE = 10;

const regionMap: Record<string, string> = Object.fromEntries(
  DOTA2_REGIONS.map((r) => [r.code, r.label])
);

function formatRelativeDate(date: Date): string {
  const diffDays = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (Math.abs(diffDays) > 14) return date.toLocaleDateString();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(diffDays, "day");
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam, status: statusParam, region: regionParam, entry: entryParam, maxRank: maxRankParam, search: searchParam } = await searchParams;

  const page = Math.max(1, parseInt((Array.isArray(pageParam) ? pageParam[0] : pageParam) ?? "1", 10) || 1);

  // Parse and validate filter params — DRAFT is excluded from the public list
  const PUBLIC_STATUSES = [
    TournamentStatus.REGISTRATION_OPEN,
    TournamentStatus.REGISTRATION_CLOSED,
    TournamentStatus.IN_PROGRESS,
    TournamentStatus.COMPLETED,
  ] as const;
  const rawStatus = Array.isArray(statusParam) ? statusParam[0] : statusParam;
  const status = rawStatus && (PUBLIC_STATUSES as readonly string[]).includes(rawStatus)
    ? rawStatus as TournamentStatus
    : undefined;

  const region = (Array.isArray(regionParam) ? regionParam[0] : regionParam) || undefined;

  const rawEntry = Array.isArray(entryParam) ? entryParam[0] : entryParam;
  const entry = rawEntry === "free" || rawEntry === "paid" ? rawEntry : undefined;

  const rawMaxRank = Array.isArray(maxRankParam) ? maxRankParam[0] : maxRankParam;
  const parsedMaxRank = rawMaxRank ? parseInt(rawMaxRank, 10) : NaN;
  const maxRank = !isNaN(parsedMaxRank) && parsedMaxRank >= 1 && parsedMaxRank <= 8 ? parsedMaxRank : undefined;

  const search = (Array.isArray(searchParam) ? searchParam[0] : searchParam) || undefined;

  const { tournaments, total } = await getTournamentsPaginated(page, PAGE_SIZE, { status, region, entry, maxRank, search });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Build paginated URLs that preserve the active filters
  const filterEntries: Record<string, string> = {};
  if (status) filterEntries.status = status;
  if (region) filterEntries.region = region;
  if (entry) filterEntries.entry = entry;
  if (maxRank != null) filterEntries.maxRank = String(maxRank);
  if (search) filterEntries.search = search;

  function pageUrl(p: number) {
    const params = new URLSearchParams(filterEntries);
    params.set("page", String(p));
    return `/tournaments?${params.toString()}`;
  }

  const hasFilters = !!(status || region || entry || maxRank || search);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          + Create Tournament
        </Link>
      </div>

      <Suspense fallback={null}>
        <TournamentFilterBar />
      </Suspense>

      {tournaments.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          {hasFilters ? "No tournaments match your filters." : "No tournaments yet. Be the first to create one!"}
        </p>
      ) : (
        <ul className="space-y-4">
          {tournaments.map((t) => {
            const teamCount = t._count.teams;
            const fillPct = Math.round((teamCount / t.maxTeams) * 100);

            return (
              <li key={t.id}>
                {(() => {
                  const effectiveStatus =
                    t.status === TournamentStatus.REGISTRATION_OPEN &&
                    new Date(t.registrationDeadline) < new Date()
                      ? TournamentStatus.REGISTRATION_CLOSED
                      : t.status;
                  return (
                <Link
                  href={`/tournaments/${t.id}`}
                  className="flex gap-4 border border-gray-800 rounded-lg overflow-hidden hover:border-amber-500 transition-all"
                >
                  {/* Banner */}
                  <div className="w-36 shrink-0 bg-gray-900 relative">
                    {t.imageUrl ? (
                      <Image
                        src={t.imageUrl}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[120px]">
                        <span className="text-3xl opacity-20">🏆</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between flex-1 py-4 pr-5 gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h2 className="text-xl font-semibold leading-tight">{t.name}</h2>
                        {t.description && (
                          <p className="text-gray-400 mt-1 text-sm line-clamp-2">{t.description}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${statusColors[effectiveStatus]}`}>
                        {statusLabels[effectiveStatus]}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {t.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {regionMap[t.region] ?? t.region}
                        </span>
                      )}
                      <span>{new Date(t.startDate) <= new Date() ? "Started" : "Starts"} {formatRelativeDate(new Date(t.startDate))}</span>
                      {(() => {
                        const deadline = new Date(t.registrationDeadline);
                        const isPast = deadline < new Date();
                        return (
                          <span className={`flex items-center gap-1 ${isPast ? "text-red-400" : ""}`}>
                            <CalendarX className="w-3.5 h-3.5" />
                            {isPast
                              ? `Reg. closed ${formatRelativeDate(deadline)}`
                              : `Reg. closes ${formatRelativeDate(deadline)}`}
                          </span>
                        );
                      })()}
                      {t.entryFee != null && Number(t.entryFee) > 0 && (
                        <span className="text-amber-400 font-medium">Entry: {currencySymbol(t.currency)}{Number(t.entryFee).toFixed(2)} / team</span>
                      )}
                      {t.entryFee != null && Number(t.entryFee) === 0 && (
                        <span className="text-green-400 font-medium">Free entry</span>
                      )}
                      {t.prizePool != null && (
                        <span className="flex items-center gap-1 text-yellow-400 font-medium">
                          <Trophy className="w-3.5 h-3.5" />
                          {currencySymbol(t.currency)}{Number(t.prizePool).toFixed(2)}
                        </span>
                      )}
                      {t.maxRankTier != null && (
                        <span className="flex items-center gap-1 text-rose-400 font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Max: {medalLabel(t.maxRankTier)}
                        </span>
                      )}
                    </div>

                    {/* Teams progress bar */}
                    <div>
                      {teamCount >= t.maxTeams ? (
                        <p className="text-xs font-medium text-red-400">Full — no spots remaining</p>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>
                              {fillPct >= 75
                                ? `${t.maxTeams - teamCount} spot${t.maxTeams - teamCount === 1 ? "" : "s"} left`
                                : "Teams registered"}
                            </span>
                            <span>{teamCount} / {t.maxTeams}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fillPct >= 90
                                  ? "bg-red-500"
                                  : fillPct >= 75
                                  ? "bg-orange-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
                  );
                })()}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Link
            href={pageUrl(page - 1)}
            aria-disabled={page <= 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page <= 1
                ? "pointer-events-none text-gray-600"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageUrl(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-amber-500 text-gray-950"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>

          <Link
            href={pageUrl(page + 1)}
            aria-disabled={page >= totalPages}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page >= totalPages
                ? "pointer-events-none text-gray-600"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
