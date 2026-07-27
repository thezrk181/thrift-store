import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products";
import { Search, X } from "lucide-react";

export function SiteNav({ theme = "light" }: { theme?: "light" | "dark" }) {
  const { count } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";
  const base = isDark ? "bg-black text-white border-white/10" : "bg-white text-black border-black/10";
  const linkCls = isDark
    ? "text-white/70 hover:text-white"
    : "text-black/60 hover:text-black";

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

  // Filter products for quick results
  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 4);

  return (
    <header className={`sticky top-0 z-50 border-b ${base}`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
        <Link to="/" className="text-lg font-black tracking-tight uppercase">
          Sole Wala
        </Link>
        <nav className="hidden gap-10 text-sm font-medium uppercase tracking-wider md:flex">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: isDark ? "text-white" : "text-black" }}>
            Home
          </Link>
          <Link to="/shop" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: isDark ? "text-white" : "text-black" }}>
            Shop
          </Link>
          <Link to="/category/$categoryId" params={{ categoryId: "new" }} className={linkCls} activeProps={{ className: isDark ? "text-white" : "text-black" }}>New</Link>
          <Link to="/category/$categoryId" params={{ categoryId: "sale" }} className={linkCls} activeProps={{ className: isDark ? "text-white" : "text-black" }}>Sale</Link>
        </nav>
        <div className="flex items-center gap-6 text-sm relative" ref={searchRef}>
          {/* SEARCH TRIGGER / INPUT */}
          <div className="flex items-center">
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchOpen ? "w-48 opacity-100 mr-2" : "w-0 opacity-0"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border-b outline-none pb-1 text-sm ${
                  isDark ? "border-white/20 text-white placeholder:text-white/40 focus:border-white" : "border-black/20 text-black placeholder:text-black/40 focus:border-black"
                }`}
              />
            </div>
            <button 
              onClick={() => {
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                } else {
                  setIsSearchOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }
              }}
              className={`uppercase tracking-wider ${linkCls}`}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            
            {/* INLINE SEARCH DROPDOWN */}
            {isSearchOpen && searchQuery.trim() !== "" && (
              <div className={`absolute top-full right-0 mt-4 w-72 rounded-lg shadow-xl border overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-black/10"}`}>
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
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded bg-[#f3f2ef] object-cover mix-blend-multiply" />
                        <div>
                          <div className="text-sm font-bold uppercase tracking-tight">{product.name}</div>
                          <div className={`text-xs ${isDark ? "text-white/60" : "text-black/60"}`}>Rs {product.price.toLocaleString()}</div>
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
    </header>
  );
}
