import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Sole Wala" },
      { name: "description", content: "Create your Sole Wala account for early access and order history." },
      { property: "og:title", content: "Create Account — Sole Wala" },
      { property: "og:description", content: "Create your Sole Wala account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(`Account created for ${form.email} (demo)`);
    navigate({ to: "/" });
  };

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-white px-8 py-16 md:order-1">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-12 block text-lg font-black uppercase tracking-tight md:hidden">
            Sole Wala
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">Account</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">Create Account</h2>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={upd("name")}
                className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none focus:border-black"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={upd("email")}
                className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={upd("password")}
                className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none focus:border-black"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-black py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85"
            >
              Create account
            </button>
          </form>

          <p className="mt-8 text-sm text-black/60">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-black underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-black text-white md:flex md:flex-col md:justify-between md:p-12">
        <Link to="/" className="text-lg font-black uppercase tracking-tight">Sole Wala</Link>
        <div>
          <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tight">
            Join the
            <br />
            <span className="italic font-serif font-normal">rotation.</span>
          </h1>
          <p className="mt-8 max-w-sm text-white/60">
            Members get first look at every drop, saved sizes across devices, and free returns.
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-white/40">© 2026 Sole Wala</p>
      </div>
    </div>
  );
}
