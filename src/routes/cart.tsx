import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Sole Wala" },
      { name: "description", content: "Review the items in your cart and proceed to checkout." },
      { property: "og:title", content: "Your Cart — Sole Wala" },
      { property: "og:description", content: "Review your Sole Wala selection." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, getProductForItem, updateQuantity, removeItem, subtotal, clear, count } = useCart();
  const shipping = subtotal > 80 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav />

      <div className="mx-auto max-w-[1400px] px-8 py-16">
        <div className="mb-12 flex items-end justify-between">
          <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">Your Bag</h1>
          <p className="text-sm text-black/60">{count} {count === 1 ? "item" : "items"}</p>
        </div>

        {items.length === 0 ? (
          <div className="border-t border-black/10 py-24 text-center">
            <p className="text-lg text-black/60">Your bag is empty.</p>
            <Link to="/" className="mt-8 inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ul className="divide-y divide-black/10 border-y border-black/10">
                {items.map((item) => {
                  const product = getProductForItem(item);
                  if (!product) return null;
                  return (
                    <li key={item.key} className="flex gap-6 py-8">
                      <Link to="/product/$id" params={{ id: product.id }} className="block w-32 flex-shrink-0 bg-[#f3f2ef] md:w-40">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          width={400}
                          height={400}
                          className="aspect-square w-full object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link to="/product/$id" params={{ id: product.id }} className="text-lg font-semibold hover:underline">
                              {product.name}
                            </Link>
                            <p className="mt-1 text-xs uppercase tracking-widest text-black/50">
                              Size {item.size} · {item.color}
                            </p>
                          </div>
                          <p className="text-lg font-semibold">${product.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center border border-black/15">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="h-10 w-10 text-lg hover:bg-black hover:text-white"
                              aria-label="Decrease"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="h-10 w-10 text-lg hover:bg-black hover:text-white"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-xs font-medium uppercase tracking-widest text-black/60 underline underline-offset-4 hover:text-black"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 flex justify-between text-sm">
                <Link to="/" className="uppercase tracking-widest underline underline-offset-4">
                  ← Continue shopping
                </Link>
                <button onClick={clear} className="uppercase tracking-widest text-black/50 hover:text-black">
                  Clear bag
                </button>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-black p-8 text-white">
                <h2 className="text-2xl font-black uppercase tracking-tight">Order Summary</h2>
                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/60">Subtotal</dt>
                    <dd>${subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd>
                  </div>
                  <div className="flex justify-between border-t border-white/15 pt-3">
                    <dt>Total</dt>
                    <dd className="text-lg font-semibold">${total.toFixed(2)}</dd>
                  </div>
                </dl>
                <button
                  onClick={() => alert("Checkout will be wired up to a backend later.")}
                  className="mt-8 w-full rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-wider text-black hover:bg-white/90"
                >
                  Checkout
                </button>
                <p className="mt-4 text-xs text-white/50">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
