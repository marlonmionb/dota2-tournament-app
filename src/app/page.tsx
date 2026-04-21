import Link from "next/link";
import { Trophy, Users, Swords } from "lucide-react";

export default function Home() {
  return (
    <>
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
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Dota 2 Tournament Platform
      </h1>
      <p className="text-lg text-gray-400 mb-8 max-w-xl">
        Organize and manage amateur Dota 2 tournaments. Create brackets, register
        teams, and track match results — all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/tournaments"
          className="rounded-lg bg-amber-500 px-6 py-3 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          Browse Tournaments
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

    <section className="bg-gray-900 py-16 px-8 border-t border-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-950 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
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
            <Swords className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-semibold text-lg">Play</h3>
          <p className="text-sm text-gray-400">Brackets are generated automatically. Report results and advance to glory.</p>
        </div>
      </div>
    </section>
    </>
  );
}

