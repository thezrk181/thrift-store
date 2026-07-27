import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useProducts } from "@/lib/products";
import { Search, X, User, Heart, Shield } from "lucide-react";
import PillNav, { PillNavItem } from "./PillNav";

export function SiteNav({ theme = "light" }: { theme?: "light" | "dark" }) {
  const { count } = useCart();
  const { session, isAdmin } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults =
    searchQuery.trim() === ""
      ? []
      : products
          .filter((p) => {
            const q = searchQuery.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q))
            );
          })
          .slice(0, 4);

  const navItems: PillNavItem[] = [
    { label: "Home", href: "/", exact: true },
    { label: "Shop", href: "/shop", exact: true },
    { label: "New", href: "/category/new" },
    { label: "Sale", href: "/category/sale" },
  ];

  if (session) {
    if (isAdmin) navItems.push({ label: <Shield size={16} />, href: "/admin", ariaLabel: "Admin" });
    navItems.push({ label: <Heart size={16} />, href: "/wishlist", ariaLabel: "Wishlist" });
    navItems.push({ label: <User size={16} />, href: "/profile", ariaLabel: "Profile" });
  } else {
    navItems.push({ label: "Sign In", href: "/signin" });
  }
  
  navItems.push({
    label: (
      <div className="flex items-center gap-1.5">
        Cart
        <span
          className={`inline-flex items-center justify-center rounded-full px-1.5 h-5 min-w-[20px] text-[10px] font-bold ${
            isDark ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {count}
        </span>
      </div>
    ),
    href: "/cart",
  });

  const baseColor = isDark ? "#ffffff" : "#000000";
  const pillColor = isDark ? "#111111" : "#f4f4f5";
  const hoverColor = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 flex items-center justify-between pointer-events-none">
      
      {/* Search Bar Floating Container */}
      <div className="pointer-events-auto flex-1 flex justify-start relative" ref={searchRef}>
        <div className={`flex items-center bg-white/70 dark:bg-black/70 backdrop-blur-md rounded-full shadow-lg border border-black/10 dark:border-white/10 transition-all duration-300 overflow-hidden ${isSearchOpen ? 'w-64 px-4 py-2 opacity-100' : 'w-10 h-10 opacity-0 pointer-events-none -translate-x-4'}`}>
          <Search size={16} className={isDark ? 'text-white/50' : 'text-black/50'} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none ml-2 text-sm text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
          />
          <button onClick={() => setIsSearchOpen(false)} className="ml-2 hover:opacity-70">
            <X size={16} className={isDark ? 'text-white' : 'text-black'} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() !== "" && (
          <div
            className={`absolute top-full left-0 mt-4 w-72 rounded-2xl shadow-xl border overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-black/10"}`}
          >
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm opacity-60">No results found.</div>
            ) : (
              <div className="flex flex-col">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to="/product/$id"
                    params={{ id: product.id }}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-3 p-3 transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded bg-[#f3f2ef] object-cover mix-blend-multiply"
                    />
                    <div>
                      <div className="text-sm font-bold uppercase tracking-tight">
                        {product.name}
                      </div>
                      <div className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>
                        Rs {product.price.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate({ to: "/shop" });
                  }}
                  className={`p-3 text-xs font-semibold uppercase tracking-wider text-center border-t ${isDark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}
                >
                  See all products
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Pill Navigation */}
      <div className={`pointer-events-auto relative flex items-center justify-between gap-4 md:gap-8 bg-white/70 dark:bg-black/70 backdrop-blur-md px-2 py-2 rounded-[28px] border shadow-2xl transition-all ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <Link to="/" className="pl-4 font-black text-xl uppercase tracking-tighter">SOLE WALA</Link>
        <PillNav
          items={navItems}
          baseColor={baseColor}
          pillColor={pillColor}
          hoveredPillTextColor={hoverColor}
          pillTextColor={textColor}
        />
        <button
          onClick={() => {
            if (!isSearchOpen) {
              setIsSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            } else {
              setIsSearchOpen(false);
            }
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-full mr-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
        >
          <Search size={18} className={isDark ? 'text-white' : 'text-black'} />
        </button>
      </div>

      <div className="flex-1 hidden md:block"></div>
    </div>
  );
}
