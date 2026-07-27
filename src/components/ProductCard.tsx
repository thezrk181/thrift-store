import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useWishlist, useToggleWishlist } from "@/lib/wishlist";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { session } = useAuth();
  const { data: wishlist = [] } = useWishlist(session?.user?.id);
  const toggleWishlist = useToggleWishlist();

  const isWishlisted = wishlist.includes(product.db_id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      alert("Please sign in to save items to your wishlist.");
      return;
    }
    toggleWishlist.mutate({
      userId: session.user.id,
      productId: product.db_id,
      isWishlisted,
    });
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f3f2ef]">
        <span className="absolute left-4 top-4 z-10 rotate-[-90deg] origin-top-left translate-y-[52px] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
          New
        </span>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover"
        />
        <button
          onClick={handleWishlist}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-black backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-black/60">Rs {product.price.toLocaleString()}</p>
        </div>
        <div className="flex gap-1.5 pt-1">
          {product.colors.slice(0, 3).map((c) => (
            <span
              key={c.name}
              className="h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
