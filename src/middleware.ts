import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Logger } from "next-axiom";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: "middleware" });
  logger.middleware(req);

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    logger.warn("Rate limit exceeded", { ip });
    event.waitUntil(logger.flush());
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  event.waitUntil(logger.flush());
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
