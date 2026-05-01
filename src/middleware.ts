import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  /^\/tournaments\/new(\/|$)/,
  /^\/tournaments\/[^/]+\/edit(\/|$)/,
  /^\/tournaments\/[^/]+\/register(\/|$)/,
];

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Auth guard — redirect unauthenticated users before RSC runs
  if (PROTECTED_ROUTES.some((r) => r.test(pathname))) {
    if (!req.auth?.user) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/auth/signin";
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    // Prefer x-real-ip (set by Vercel's edge; clients cannot spoof it).
    // Fall back to the leftmost entry in X-Forwarded-For (originating client).
    // Never use the full header string as a key — it's comma-separated and client-controllable.
    const realIp = req.headers.get("x-real-ip");
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = realIp ?? (forwarded ? forwarded.split(",")[0].trim() : "unknown");
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/:path*", "/tournaments/new", "/tournaments/:id/edit", "/tournaments/:id/register"],
};
