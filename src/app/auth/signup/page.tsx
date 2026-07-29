'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const form = event.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create account");
            }

            router.push("/auth/signin");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create account");
            setLoading(false);
        }
    };
    
   return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full border border-gray-700 rounded-lg px-4 py-2 text-sm bg-gray-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full border border-gray-700 rounded-lg px-4 py-2 text-sm bg-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div>
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}