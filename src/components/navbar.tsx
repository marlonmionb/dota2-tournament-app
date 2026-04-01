"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sword } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <Sword className="w-5 h-5 text-red-500" />
        Dota 2 Tournaments
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/tournaments" className="text-gray-600 hover:text-gray-900 transition-colors">
          Tournaments
        </Link>

        {status === "loading" ? null : session ? (
          <>
            <span className="text-gray-600">{session.user?.name ?? session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg border border-amber-300 px-3 py-1.5 font-medium text-amber-800 hover:border-amber-400 hover:text-amber-900 hover:bg-amber-50 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
