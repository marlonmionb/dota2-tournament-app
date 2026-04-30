import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // React requires eval() in dev for stack-trace reconstruction; never in prod
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://stayqprxuhqimxtrgaoh.supabase.co https://steamcdn-a.akamaihd.net https://avatars.steamstatic.com https://avatars.akamai.steamstatic.com",
      "connect-src 'self' https://api.opendota.com https://api.axiom.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stayqprxuhqimxtrgaoh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withAxiom(nextConfig);
