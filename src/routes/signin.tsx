import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — Sole Wala" },
      { name: "description", content: "Sign in to your Sole Wala account." },
      { property: "og:title", content: "Sign In — Sole Wala" },
      { property: "og:description", content: "Sign in to your Sole Wala account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder — will be wired to backend later.
    alert(`Signed in as ${email} (demo)`);
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden bg-black text-white md:flex md:flex-col md:justify-between md:p-12">
        <Link to="/" className="text-lg font-black uppercase tracking-tight">Sole Wala</Link>
        <div>
          <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tight">
            Welcome
            <br />
            back to
            <br />
            <span className="italic font-serif font-normal">the pavement.</span>
          </h1>
          <p className="mt-8 max-w-sm text-white/60">
            Sign in to see your orders, saved sizes, and early access to new drops.
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-white/40">© 2026 Sole Wala</p>
      </div>

      <div className="flex flex-col items-center justify-center bg-white px-8 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-12 block text-lg font-black uppercase tracking-tight md:hidden">
            Sole Wala
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">Account</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">Sign in</h2>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-black py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-sm text-black/60">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-black underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
