"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function SignInPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDevLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    const result = await signIn("credentials", {
      email,
      name,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      const code = result.error;
      if (code.includes("database_unavailable")) {
        setError(
          "Cannot reach the database. Make sure Docker is running: docker compose up -d"
        );
      } else {
        setError(`Sign-in failed (${code}). Check the server logs for details.`);
      }
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    } else {
      // NextAuth v5 may not return a url — navigate to callbackUrl directly
      window.location.href = callbackUrl;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Sign in</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* OAuth providers */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn("discord", { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="#5865F2" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.993.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Continue with Discord
          </button>
        </div>

        {/* Dev-only credentials login */}
        {process.env.NODE_ENV !== "production" && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-500 bg-gray-950 px-2">
                dev login (local only)
              </div>
            </div>

            <form onSubmit={handleDevLogin} className="space-y-3">
              <input
                name="email"
                type="email"
                required
                placeholder="any@email.com"
                className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                name="name"
                type="text"
                placeholder="Your name (optional)"
                className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign in as dev user"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-sm text-gray-500">
          Loading sign-in...
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
