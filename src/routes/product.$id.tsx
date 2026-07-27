import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductByIdOrSlug, useProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { Heart, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useWishlist, useToggleWishlist } from "@/lib/wishlist";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/product/$id")({
  head: ({ loaderData }: any) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Sole Wala` : "Product — Sole Wala";
    const desc = p?.description ?? "Considered footwear from Sole Wala.";
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
  loader: async ({ params }) => {
    const product = await fetchProductByIdOrSlug(params.id);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-8 pt-40 pb-32 text-center">
        <h1 className="text-4xl font-black uppercase">Not found</h1>
        <p className="mt-4 text-black/60">That style has walked off. Back to the shop.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase text-white"
        >
          Shop
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData() as any;
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();

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

  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product.db_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(
          `
          id, rating, review_text, created_at, user_id,
          profiles:user_id ( first_name, last_name )
        `,
        )
        .eq("product_id", product.db_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const averageRating =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSubmittingReview(true);

    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.db_id,
      user_id: session.user.id,
      rating: reviewRating,
      review_text: reviewText,
    });

    setSubmittingReview(false);

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        alert("You have already reviewed this product.");
      } else {
        alert("Error submitting review: " + error.message);
      }
    } else {
      setReviewText("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", product.db_id] });
    }
  };

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

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-32 pb-8 md:pb-12">
        <nav className="mb-8 text-xs uppercase tracking-widest text-black/50">
          <Link to="/" className="hover:text-black">
            Shop
          </Link>
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
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
                  {product.category}
                </p>
                <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
                  {product.name}
                </h1>

                {reviews.length > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex text-black">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= Math.round(averageRating) ? "fill-current" : "opacity-20"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-black/60">
                      {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleWishlist}
                className="rounded-full bg-[#f3f2ef] p-4 text-black transition-transform hover:scale-110"
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
            <p className="mt-6 text-2xl font-semibold">Rs {product.price.toLocaleString()}</p>

            <p className="mt-8 max-w-md text-black/60">{product.description}</p>

            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest">Color</p>
                <p className="text-xs text-black/60">{color}</p>
              </div>
              <div className="flex gap-3">
                {product.colors.map((c: { name: string; hex: string }) => {
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
                {product.sizes.map((s: number) => {
                  const active = s === size;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setFeedback(null);
                      }}
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
                Add to cart · Rs {product.price.toLocaleString()}
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded-full border border-black py-5 text-sm font-semibold uppercase tracking-wider hover:bg-black hover:text-white"
              >
                Buy it now
              </button>
              {feedback && <p className="text-sm text-black/70">{feedback}</p>}
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-black/10 pt-8 text-xs uppercase tracking-widest text-black/50">
              <div>Free shipping</div>
              <div>30-day returns</div>
              <div>Numbered batch</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 md:mt-32 border-t border-black/10 pt-16">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Reviews</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Review List */}
            <div className="space-y-8">
              {reviews.length === 0 ? (
                <p className="text-black/60 uppercase tracking-wider text-sm font-semibold">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-black/5 pb-8 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center font-bold text-xs uppercase">
                          {(review.profiles as any)?.first_name?.[0] || review.user_id[0]}
                        </div>
                        <span className="font-bold uppercase tracking-wider text-sm">
                          {(review.profiles as any)?.first_name || "Guest User"}
                        </span>
                      </div>
                      <div className="text-xs text-black/40 uppercase tracking-widest font-semibold">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex text-black mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= review.rating ? "fill-current" : "opacity-20"}
                        />
                      ))}
                    </div>
                    <p className="text-black/80">{review.review_text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review */}
            <div>
              {session ? (
                <div className="bg-[#f3f2ef] p-8 rounded-xl">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-6">
                    Write a Review
                  </h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              className={
                                star <= reviewRating ? "fill-black text-black" : "text-black/20"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest mb-2">
                        Your Review
                      </label>
                      <textarea
                        required
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-lg p-3 outline-none focus:border-black min-h-[120px]"
                        placeholder="What did you think about this product?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full rounded-full bg-black py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85 disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-[#f3f2ef] p-8 rounded-xl text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">
                    Write a Review
                  </h3>
                  <p className="text-black/60 mb-6">You must be signed in to leave a review.</p>
                  <Link
                    to="/signin"
                    className="inline-block rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black/85"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="mt-16 md:mt-32">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              You might also like
            </h2>
            <Link
              to="/"
              className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
            >
              Shop all
            </Link>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {allProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
