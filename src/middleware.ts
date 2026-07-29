import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const AUTHENTICATED_ROUTES = [
  /^\/tournaments\/new(\/|$)/,
  /^\/tournaments\/[^/]+\/edit(\/|$)/,
  /^\/tournaments\/[^/]+\/teams\/[^/]+\/edit(\/|$)/,
];

const ADMIN_ROUTES = [
  /^\/admin(\/|$)/,
];

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (AUTHENTICATED_ROUTES.some((r) => r.test(pathname))) {
    if (!req.auth?.user) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/auth/signin";
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (ADMIN_ROUTES.some((r) => r.test(pathname))) {
    const role = req.auth?.user?.role;

    if (!req.auth?.user) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/auth/signin";
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/:path*",
    "/tournaments/new",
    "/tournaments/:id/edit",
    "/tournaments/:id/teams/:teamId/edit",
    "/admin/:path*",
  ],
};
