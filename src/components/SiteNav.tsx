import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { SearchOverlay } from "@/components/SearchOverlay";

export function SiteNav({ theme = "light" }: { theme?: "light" | "dark" }) {
  const { count } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isDark = theme === "dark";
  const base = isDark ? "bg-black text-white border-white/10" : "bg-white text-black border-black/10";
  const linkCls = isDark
    ? "text-white/70 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <header className={`sticky top-0 z-50 border-b ${base}`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
        <Link to="/" className="text-lg font-black tracking-tight uppercase">
          Sole Wala
        </Link>
        <nav className="hidden gap-10 text-sm font-medium uppercase tracking-wider md:flex">
          <Link to="/shop" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: isDark ? "text-white" : "text-black" }}>
            Shop
          </Link>
          <Link to="/category/$categoryId" params={{ categoryId: "new" }} className={linkCls} activeProps={{ className: isDark ? "text-white" : "text-black" }}>New</Link>
          <Link to="/category/$categoryId" params={{ categoryId: "sale" }} className={linkCls} activeProps={{ className: isDark ? "text-white" : "text-black" }}>Sale</Link>
        </nav>
        <div className="flex items-center gap-6 text-sm">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`uppercase tracking-wider ${linkCls}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <Link to="/signin" className={`hidden uppercase tracking-wider md:inline ${linkCls}`}>
            Sign In
          </Link>
          <Link
            to="/cart"
            className={`inline-flex items-center gap-2 uppercase tracking-wider ${linkCls}`}
          >
            Cart
            <span
              className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {count}
            </span>
          </Link>
        </div>
      </div>
      
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
