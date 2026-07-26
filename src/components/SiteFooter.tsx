import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-[1400px] px-8 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="text-4xl font-black uppercase tracking-tight leading-none">
              Sole Wala
              <br />
              <span className="text-black/40">Est. 2024</span>
            </h3>
            <p className="mt-6 max-w-sm text-sm text-black/60">
              Considered footwear for people who move. Built in limited runs, sold direct.
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/40">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:underline">All</Link></li>
              <li><a href="#new" className="hover:underline">New Arrivals</a></li>
              <li><a href="#men" className="hover:underline">Men</a></li>
              <li><a href="#women" className="hover:underline">Women</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/40">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signin" className="hover:underline">Sign In</Link></li>
              <li><Link to="/signup" className="hover:underline">Create Account</Link></li>
              <li><Link to="/cart" className="hover:underline">Cart</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-black/10 pt-8 text-xs text-black/40 md:flex-row">
          <p>© 2026 Sole Wala. All rights reserved.</p>
          <p className="uppercase tracking-widest">Made for the pavement.</p>
        </div>
      </div>
    </footer>
  );
}
