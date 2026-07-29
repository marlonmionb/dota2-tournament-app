import Image from "next/image";
import { Trophy } from "lucide-react";

interface Props {
  teamName: string;
  logoUrl?: string | null;
}

export function ChampionBanner({ teamName, logoUrl }: Props) {
  return (
    <div className="mb-8 flex items-center gap-5 rounded-2xl border border-amber-700/50 bg-gradient-to-r from-amber-950/40 via-gray-900 to-gray-900 p-6 shadow-lg shadow-amber-950/20">
      <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-gray-800 flex items-center justify-center text-gray-500 text-2xl font-semibold select-none ring-2 ring-amber-500/60">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${teamName} logo`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          teamName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-amber-400">
          <Trophy className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Tournament Champion</span>
        </div>
        <h2 className="mt-1 text-2xl font-bold text-white truncate">{teamName}</h2>
      </div>
    </div>
  );
}
