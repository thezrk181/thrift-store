import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/category/$categoryId")({
  head: ({ match }) => ({
    meta: [
      { title: `${match.params.categoryId.toUpperCase()} — Sole Wala` },
      { name: "description", content: `Shop our latest ${match.params.categoryId} sneakers.` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const { data: products = [], isLoading } = useProducts();
  
  // Filter products by the current category/tag
  const filteredProducts = products.filter(p => p.tags && p.tags.includes(categoryId.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav theme="light" />

      {/* CATEGORY HEADER */}
      <section className="bg-[#f3f2ef] pt-24 pb-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
            Category
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
            {categoryId}
          </h1>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="grid" className="bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-24">
          <div className="mb-14 flex items-end justify-between gap-8">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {filteredProducts.length} Results
            </h2>
          </div>
          
          {isLoading ? (
            <div className="py-24 text-center">
              <p className="text-lg text-black/60">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg text-black/60">No products found for this category.</p>
              <Link to="/" className="mt-8 inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white">
                Back to Shop
              </Link>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
