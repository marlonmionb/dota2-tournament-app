import Link from "next/link";
import Image from "next/image";
import { Plus, Users, Swords, Trophy, ShieldAlert } from "lucide-react";
import { currencySymbol } from "@/lib/currencies";
import { getHomepageTournaments } from "@/services/tournament-service";
import { statusLabels, statusColors } from "@/lib/tournament-display";

export default async function Home() {
  const [featuredTournaments, recentlyCompleted] = await getHomepageTournaments();

  return (
    <>
    {/* Hero */}
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] bg-gray-950 p-8 text-center overflow-hidden">
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-gray-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.12)_0%,_transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(251,191,36,0.3) 0px, rgba(251,191,36,0.3) 1px, transparent 1px, transparent 14px)",
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-xs font-semibold tracking-widest text-amber-500 uppercase mb-3">Draft Arena</span>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          From Draft to Victory.
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-xl">
          The tournament hub built for the Dota 2 community. Organizers set up brackets in minutes.
          Teams register with their full roster. Everyone competes — and only one squad walks away.
        </p>
        <div className="flex gap-4">
          <Link
            href="/tournaments"
            className="rounded-lg bg-amber-500 px-6 py-3 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            Find a Tournament
          </Link>
          <Link
            href="/tournaments/new"
            className="rounded-lg border border-amber-700 px-6 py-3 font-semibold text-amber-400 hover:border-amber-500 hover:bg-amber-950/30 transition-colors"
          >
            Create Tournament
          </Link>
        </div>
      </div>
    </div>

    {/* How it works */}
    <section className="bg-gray-900 py-16 px-8 border-b border-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-950 flex items-center justify-center">
            <Plus className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-semibold text-lg">Create</h3>
          <p className="text-sm text-gray-400">Set up your tournament, define the format and registration deadline.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-950 flex items-center justify-center">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-semibold text-lg">Register</h3>
          <p className="text-sm text-gray-400">Teams sign up with their full roster of 5 players via Steam IDs.</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-950 flex items-center justify-center">
            <Swords className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="font-semibold text-lg">Play</h3>
          <p className="text-sm text-gray-400">Brackets are generated automatically. Report results and advance to glory.</p>
        </div>
      </div>
    </section>

    {/* Featured tournaments */}
    <section className="bg-gray-950 py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Live &amp; Upcoming</h2>
          <Link href="/tournaments" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
            View all →
          </Link>
        </div>
        {featuredTournaments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-amber-900/40 rounded-lg bg-amber-950/10">
            <p className="text-lg font-semibold text-gray-300 mb-2">The arena is quiet — for now.</p>
            <p className="text-sm text-gray-500 mb-6">Start the first tournament and put your name on the board.</p>
            <Link
              href="/tournaments/new"
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-gray-950 font-semibold hover:bg-amber-400 transition-colors text-sm"
            >
              Create the First Tournament
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {featuredTournaments.map((t) => {
              const teamCount = t._count.teams;
              const fillPct = Math.round((teamCount / t.maxTeams) * 100);
              return (
                <li key={t.id}>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="flex gap-4 border border-gray-800 rounded-lg overflow-hidden hover:border-amber-500 transition-all"
                  >
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
                    <div className="flex flex-col justify-between flex-1 py-4 pr-5 gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-xl font-semibold leading-tight">{t.name}</h3>
                          {t.description && (
                            <p className="text-gray-400 mt-1 text-sm line-clamp-2">{t.description}</p>
                          )}
                        </div>
                        <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${statusColors[t.status]}`}>
                          {statusLabels[t.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>Starts {new Date(t.startDate).toLocaleDateString()}</span>
                        {t.entryFee != null && t.entryFee > 0 && (
                          <span className="text-amber-400 font-medium">Entry: {currencySymbol(t.currency)}{t.entryFee.toFixed(2)} / team</span>
                        )}
                        {t.entryFee === 0 && (
                          <span className="text-green-400 font-medium">Free entry</span>
                        )}
                        {t.prizePool && (
                          <span className="flex items-center gap-1 text-yellow-400 font-medium">
                            <Trophy className="w-3.5 h-3.5" />
                            {t.prizePool}
                          </span>
                        )}
                        {t.maxRankTier != null && (
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Max: {t.maxRankTier}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Teams registered</span>
                          <span>{teamCount} / {t.maxTeams}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>

    {/* Recently Completed */}
    {recentlyCompleted.length > 0 && (
      <section className="bg-gray-900 py-16 px-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recently Completed</h2>
            <Link href="/tournaments?status=COMPLETED" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              View all →
            </Link>
          </div>
          <ul className="space-y-4">
            {recentlyCompleted.map((t) => {
              const teamCount = t._count.teams;
              return (
                <li key={t.id}>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="flex gap-4 border border-gray-800 rounded-lg overflow-hidden hover:border-amber-500 transition-all"
                  >
                    <div className="w-36 shrink-0 bg-gray-900 relative">
                      {t.imageUrl ? (
                        <Image
                          src={t.imageUrl}
                          alt={t.name}
                          fill
                          className="object-cover opacity-60"
                          sizes="144px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center min-h-[100px]">
                          <Trophy className="w-8 h-8 opacity-20 text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 py-4 pr-5 gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-lg font-semibold leading-tight">{t.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{teamCount} teams &middot; Ended {new Date(t.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                          Completed
                        </span>
                      </div>
                      {t.prizePool && (
                        <p className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                          <Trophy className="w-3.5 h-3.5" />
                          {t.prizePool}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    )}
    </>
  );
}

