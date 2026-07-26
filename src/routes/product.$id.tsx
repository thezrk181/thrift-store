import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const p = getProduct(params.id);
    const title = p ? `${p.name} — Stride/Form` : "Product — Stride/Form";
    const desc = p?.description ?? "Considered footwear from Stride/Form.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-8 py-32 text-center">
        <h1 className="text-4xl font-black uppercase">Not found</h1>
        <p className="mt-4 text-black/60">That style has walked off. Back to the shop.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase text-white">Shop</Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [feedback, setFeedback] = useState<string | null>(null);

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    if (!size) {
      setFeedback("Please select a size.");
      return;
    }
    addItem(product.id, size, color, 1);
    setFeedback("Added to cart.");
  };

  const handleBuyNow = () => {
    if (!size) {
      setFeedback("Please select a size.");
      return;
    }
    addItem(product.id, size, color, 1);
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav />

      <div className="mx-auto max-w-[1400px] px-8 py-12">
        <nav className="mb-8 text-xs uppercase tracking-widest text-black/50">
          <Link to="/" className="hover:text-black">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid gap-16 md:grid-cols-2">
          <div className="relative aspect-square bg-[#f3f2ef]">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
              {product.category}
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-2xl font-semibold">${product.price}</p>

            <p className="mt-8 max-w-md text-black/60">{product.description}</p>

            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest">Color</p>
                <p className="text-xs text-black/60">{color}</p>
              </div>
              <div className="flex gap-3">
                {product.colors.map((c) => {
                  const active = c.name === color;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      className={`h-10 w-10 rounded-full border-2 transition ${
                        active ? "border-black" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.name}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest">Size (US)</p>
                <button className="text-xs text-black/60 underline">Size guide</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const active = s === size;
                  return (
                    <button
                      key={s}
                      onClick={() => { setSize(s); setFeedback(null); }}
                      className={`border py-3 text-sm font-medium transition ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-black/15 hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={handleAdd}
                className="rounded-full bg-black py-5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85"
              >
                Add to cart · ${product.price}
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded-full border border-black py-5 text-sm font-semibold uppercase tracking-wider hover:bg-black hover:text-white"
              >
                Buy it now
              </button>
              {feedback && (
                <p className="text-sm text-black/70">{feedback}</p>
              )}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-black/10 pt-8 text-xs uppercase tracking-widest text-black/50">
              <div>Free shipping</div>
              <div>30-day returns</div>
              <div>Numbered batch</div>
            </div>
          </div>
        </div>

        {/* Related */}
        <section className="mt-32">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">You might also like</h2>
            <Link to="/" className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4">
              Shop all
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
