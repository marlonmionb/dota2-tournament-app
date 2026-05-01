import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED_ROUTES = [
  /^\/tournaments\/new(\/|$)/,
  /^\/tournaments\/[^/]+\/edit(\/|$)/,
  /^\/tournaments\/[^/]+\/register(\/|$)/,
];

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth guard — redirect unauthenticated users before RSC runs
  if (PROTECTED_ROUTES.some((r) => r.test(pathname))) {
    const session = await auth();
    if (!session?.user) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = "/auth/signin";
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/tournaments/new", "/tournaments/:id/edit", "/tournaments/:id/register"],
};
