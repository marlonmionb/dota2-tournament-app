import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * Dev-only credentials provider — lets you log in with any email locally
 * without setting up OAuth. Never enabled in production.
 */
const devCredentialsProvider =
  process.env.NODE_ENV === "development"
    ? Credentials({
        name: "Dev Login",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "you@example.com" },
          name: { label: "Display name", type: "text", placeholder: "Your name" },
        },
        async authorize(credentials) {
          if (!credentials?.email || typeof credentials.email !== "string") return null;
          try {
            // Find or create user so the ID is stable across logins
            const user = await prisma.user.upsert({
              where: { email: credentials.email },
              update: {},
              create: {
                email: credentials.email,
                name:
                  typeof credentials.name === "string" && credentials.name.trim()
                    ? credentials.name.trim()
                    : "Dev User",
              },
            });
            return { id: user.id, email: user.email, name: user.name };
          } catch (err) {
            console.error("[Dev Auth] Database error during authorize:", err);
            // Surface a recognizable code so the UI can show a helpful message
            throw new Error("database_unavailable");
          }
        },
      })
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT strategy is required when using the Credentials provider
  session: { strategy: "jwt" },
  providers: [
    ...(devCredentialsProvider ? [devCredentialsProvider] : []),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
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
  pages: {
    signIn: "/auth/signin",
  },
});

