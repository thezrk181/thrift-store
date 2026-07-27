import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [{ title: "Sign In — Sole Wala" }],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (session) {
    navigate({ to: "/profile", replace: true });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate({ to: "/profile" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <SiteNav theme="light" />

      <main className="flex flex-1 items-center justify-center px-8 py-20">
        <div className="w-full max-w-md">
          <h1 className="mb-8 text-center text-4xl font-black uppercase tracking-tight">Sign In</h1>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="rounded border border-red-500/20 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-black py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/85 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-black/60">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-black hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
