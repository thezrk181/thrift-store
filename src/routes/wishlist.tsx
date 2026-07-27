import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist";
import { useProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlist — Sole Wala" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: allProducts = [] } = useProducts();
  const { data: wishlistIds = [], isLoading: loadingWishlist } = useWishlist(session?.user?.id);

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate({ to: "/signin", replace: true });
    }
  }, [session, navigate]);

  if (!session || loadingWishlist) {
    return <div className="min-h-screen bg-white" />;
  }

  // Filter products that are in the user's wishlist
  const wishlistedProducts = allProducts.filter((product: Product) =>
    wishlistIds.includes(product.db_id),
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <SiteNav theme="light" />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-8 pt-32 pb-16">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight">My Wishlist</h1>
          <p className="mt-2 text-sm text-black/60">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"} saved.
          </p>
        </header>

        {wishlistedProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="mb-4 text-2xl font-black uppercase tracking-tight text-black/40">
              Your wishlist is empty
            </h2>
            <p className="mb-8 text-black/60">Start exploring and save your favorite finds.</p>
            <Link
              to="/shop"
              className="inline-block rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/85"
            >
              Discover Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
