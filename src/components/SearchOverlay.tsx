import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useProducts, type Product } from "@/lib/products";

export function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Filter products based on query
  const searchResults = query.trim() === "" 
    ? [] 
    : products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 5); // Limit to top 5 results for speed

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-md transition-all">
      {/* Search Header */}
      <div className="flex items-center border-b border-black/10 px-8 py-6">
        <Search size={24} className="text-black/40 mr-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for sneakers, brands, or styles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-2xl font-black uppercase tracking-tight text-black placeholder:text-black/20 focus:outline-none"
        />
        <button
          onClick={onClose}
          className="ml-4 rounded-full p-2 text-black/60 hover:bg-black/5 hover:text-black"
        >
          <X size={28} />
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-3xl">
          {query.trim() !== "" && (
            <div className="mb-6 text-xs font-semibold uppercase tracking-wider text-black/40">
              Results for "{query}"
            </div>
          )}

          {query.trim() !== "" && searchResults.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-medium text-black/40">No results found.</p>
              <button 
                onClick={() => {
                  onClose();
                  navigate({ to: "/shop" });
                }}
                className="mt-6 uppercase font-semibold text-sm underline underline-offset-4"
              >
                Browse all products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  to="/product/$id"
                  params={{ id: product.slug }}
                  onClick={onClose}
                  className="group flex items-center gap-6 rounded-xl border border-transparent p-4 hover:border-black/10 hover:bg-black/5 transition-all"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#f3f2ef]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover mix-blend-multiply transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">{product.name}</h3>
                    <p className="text-sm font-medium text-black/60 capitalize">{product.category}</p>
                  </div>
                  <div className="font-semibold tracking-wider">
                    Rs {product.price.toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <button 
              onClick={() => {
                onClose();
                navigate({ to: "/shop" });
              }}
              className="mt-8 text-sm font-bold uppercase tracking-wider text-black underline underline-offset-4"
            >
              See all {products.length} products
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
