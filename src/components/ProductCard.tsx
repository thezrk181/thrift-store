import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
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
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-black/60">${product.price}</p>
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
