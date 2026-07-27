import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, type Product } from "@/lib/products";
import { Filter, X } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Sole Wala" },
      { name: "description", content: "Shop our entire collection of considered footwear." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data: products = [], isLoading } = useProducts();

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Derived filter options from actual products
  const availableSizes = useMemo(() => {
    const sizes = new Set<number>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort((a, b) => a - b);
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Map<string, string>(); // name -> hex
    products.forEach((p) => p.colors.forEach((c) => colors.set(c.name, c.hex)));
    return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const availableConditions = ["New", "Like New", "Good", "Fair"];
  const availableCategories = ["Men", "Women", "Unisex"];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category Match
      if (selectedCategories.length > 0) {
        const matchesCat = selectedCategories.some(
          (c) => p.category.toLowerCase() === c.toLowerCase() || p.tags.includes(c.toLowerCase())
        );
        if (!matchesCat) return false;
      }

      // Size Match
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => p.sizes.includes(s));
        if (!hasSize) return false;
      }

      // Color Match
      if (selectedColors.length > 0) {
        const hasColor = selectedColors.some((c) => p.colors.some((pc) => pc.name === c));
        if (!hasColor) return false;
      }

      // Condition Match
      if (selectedConditions.length > 0) {
        if (!p.condition || !selectedConditions.includes(p.condition)) return false;
      }

      // Price Match
      if (p.price > maxPrice) return false;

      return true;
    });
  }, [products, selectedCategories, selectedSizes, selectedColors, selectedConditions, maxPrice]);

  const toggleFilter = (setState: React.Dispatch<React.SetStateAction<any[]>>, value: any) => {
    setState((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedConditions([]);
    setMaxPrice(30000);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav theme="light" />

      {/* HEADER */}
      <section className="bg-[#f3f2ef] pt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
            Shop All
          </h1>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <section className="mx-auto max-w-[1400px] px-8 py-12">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {filteredProducts.length} Results
          </h2>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider"
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex gap-12">
          {/* DESKTOP SIDEBAR / MOBILE DRAWER */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs transform overflow-y-auto bg-white p-8 transition-transform duration-300 md:static md:block md:w-64 md:max-w-none md:translate-x-0 md:overflow-visible md:p-0 ${
              isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-8 flex items-center justify-between md:hidden">
              <span className="text-lg font-black uppercase tracking-tight">Filters</span>
              <button onClick={() => setIsMobileFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10">
              {/* Category */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Category</h3>
                <div className="space-y-2">
                  {availableCategories.map((cat) => (
                    <label key={cat} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleFilter(setSelectedCategories, cat)}
                        className="h-4 w-4 rounded-sm border-black/20 text-black focus:ring-black"
                      />
                      <span className="text-sm text-black/70">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Size (US)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleFilter(setSelectedSizes, size)}
                        className={`rounded border py-2 text-sm transition-colors ${
                          selectedSizes.includes(size)
                            ? "border-black bg-black text-white"
                            : "border-black/10 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => toggleFilter(setSelectedColors, color.name)}
                        className={`group relative h-8 w-8 rounded-full border-2 transition-all ${
                          selectedColors.includes(color.name)
                            ? "border-black scale-110"
                            : "border-transparent hover:scale-110"
                        }`}
                        title={color.name}
                      >
                        <span
                          className="absolute inset-0.5 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
                  Max Price: Rs {maxPrice.toLocaleString()}
                </h3>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black"
                />
              </div>

              {/* Condition */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Condition</h3>
                <div className="space-y-2">
                  {availableConditions.map((cond) => (
                    <label key={cond} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(cond)}
                        onChange={() => toggleFilter(setSelectedConditions, cond)}
                        className="h-4 w-4 rounded-sm border-black/20 text-black focus:ring-black"
                      />
                      <span className="text-sm text-black/70">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategories.length > 0 ||
                selectedSizes.length > 0 ||
                selectedColors.length > 0 ||
                selectedConditions.length > 0 ||
                maxPrice < 30000) && (
                <button
                  onClick={clearFilters}
                  className="w-full rounded border border-black/20 py-3 text-sm font-semibold uppercase tracking-wider text-black/60 transition-colors hover:border-black hover:text-black"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* MOBILE OVERLAY BACKGROUND */}
          {isMobileFiltersOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}

          {/* RIGHT PRODUCT GRID */}
          <div className="flex-1">
            <div className="mb-8 hidden items-center justify-between md:flex">
              <h2 className="text-3xl font-black uppercase tracking-tight">
                {filteredProducts.length} Results
              </h2>
            </div>

            {isLoading ? (
              <div className="py-24 text-center text-black/50">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg text-black/60">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 font-semibold uppercase tracking-wider underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
