"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  session: Session | null;
}

export function NavbarUserMenu({ session }: Props) {
  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-gray-950 font-medium hover:bg-amber-400 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <>
      <span className="text-gray-400">{session.user?.name ?? session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-amber-700 px-3 py-1.5 font-medium text-amber-400 hover:border-amber-500 hover:bg-amber-950/40 transition-colors"
      >
        Sign out
      </button>
    </>
  );
}
