import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — no Node.js-only imports (no Prisma adapter,
 * no OAuth providers with crypto). Used by middleware for JWT verification.
 * The full config (adapter + providers) lives in auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/auth/signin" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
