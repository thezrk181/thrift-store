import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products";
import heroImg from "@/assets/shoe-hero.jpg";
import vibeImg from "@/assets/vibe.jpg";
import LiquidEther from "@/components/LiquidEther";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sole Wala — Considered Footwear, Built to Move" },
      { name: "description", content: "Editorial-grade sneakers for daily runs, city miles, and everything in between. Limited runs, sold direct." },
      { property: "og:title", content: "Sole Wala — Considered Footwear" },
      { property: "og:description", content: "Editorial-grade sneakers for daily runs and city miles. Limited runs, sold direct." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: products = [], isLoading } = useProducts();

  return (
    <div className="min-h-screen bg-white text-black">
      <SiteNav theme="light" />

      {/* HERO */}
      <section id="hero-section" className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <LiquidEther
            resolution={0.25}
            iterationsViscous={16}
            iterationsPoisson={16}
            cursorSize={50}
          />
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-10 px-8 pt-16 pb-8 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-6">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
              SS26 · Collection 04
            </p>
            <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-[0.9] tracking-tight">
              Built
              <br />
              For The
              <br />
              <span className="italic font-serif font-normal">long haul.</span>
            </h1>
            <p className="mt-8 max-w-md text-base text-black/60">
              A footwear studio making considered runners in small batches.
              Materials that last, silhouettes that don't shout.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85"
              >
                Shop the drop
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">↗</span>
              </Link>
              <Link
                to="/product/$id"
                params={{ id: "phantom-black" }}
                className="text-sm font-medium uppercase tracking-wider underline underline-offset-4"
              >
                Featured
              </Link>
            </div>
          </div>
          <div className="relative md:col-span-6">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="select-none text-[clamp(6rem,16vw,16rem)] font-black uppercase tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(0,0,0,0.08)]">
                RUN
              </span>
            </div>
            <img
              src={heroImg}
              alt="Featured Phantom Black runner"
              width={1024}
              height={1024}
              className="relative z-10 w-full object-contain"
            />
          </div>
        </div>
        <div className="relative z-10 border-t border-black/10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-8 py-6 text-sm md:grid-cols-4">
            <div><span className="font-black text-lg">120+</span><p className="text-black/50">Happy customers</p></div>
            <div><span className="font-black text-lg">4.9/5</span><p className="text-black/50">Avg. rating</p></div>
            <div><span className="font-black text-lg">08</span><p className="text-black/50">Silhouettes</p></div>
            <div><span className="font-black text-lg">Free</span><p className="text-black/50">Shipping over Rs 22,400</p></div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="grid" className="bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-24">
          <div className="mb-14 flex items-end justify-between gap-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
                The Range
              </p>
              <h2 className="text-5xl font-black uppercase tracking-tight md:text-6xl">
                We are bold.
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm text-black/60 md:block">
              Bold design, pushing boundaries. Each pair combines innovation, comfort and
              craft — built to make a statement.
            </p>
          </div>
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <p className="py-24 text-center col-span-full">Loading products...</p>
            ) : (
              products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
          
          {!isLoading && products.length > 0 && (
            <div className="mt-16 text-center">
              <Link 
                to="/shop"
                className="inline-block rounded-full border border-black/10 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                Shop All Arrivals
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* VIBE SECTION - dark contrast */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-8 py-24 md:grid-cols-2 md:py-32">
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              The Brief
            </p>
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
              Not for the
              <br />
              <span className="italic font-serif font-normal">crowd.</span>
              <br />
              For the ones
              <br />
              who move.
            </h2>
            <p className="mt-8 max-w-md text-white/60">
              We make one thing. Really well. Every silhouette is prototyped in-house,
              tested on real feet, released in numbered batches. When they're gone, they're gone.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={vibeImg}
              alt="Streetwear editorial"
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
