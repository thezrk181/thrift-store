import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/products/$id")({
  component: AdminEditProduct,
});

function AdminEditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [condition, setCondition] = useState("Good");
  const [tags, setTags] = useState("");

  // Existing variants state
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_variants (*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description || "");
        setPrice(data.base_price.toString());
        setCategory(data.category);
        setCondition(data.condition || "Good");
        setTags((data.tags || []).join(", "));
        
        if (data.product_variants) {
          setVariants(
            data.product_variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              colorName: v.color_name,
              colorHex: v.color_hex,
              stock: v.stock_quantity,
            }))
          );
        }
      }
      setInitialLoading(false);
    }
    loadProduct();
  }, [id]);

  const addVariant = () => {
    setVariants([...variants, { size: "", colorName: "", colorHex: "#000000", stock: 1 }]);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];
    if (variant.id) {
      if (window.confirm("Delete this variant from the database?")) {
        await supabase.from("product_variants").delete().eq("id", variant.id);
        setVariants(variants.filter((_, i) => i !== index));
      }
    } else {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Update Product
      const { error: productError } = await supabase
        .from("products")
        .update({
          name,
          slug,
          description,
          base_price: parseFloat(price),
          category,
          condition,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        })
        .eq("id", id);

      if (productError) throw productError;

      // 2. Upsert Variants
      for (const v of variants) {
        if (v.id) {
          // Update existing
          const { error: variantError } = await supabase
            .from("product_variants")
            .update({
              size: v.size,
              color_name: v.colorName,
              color_hex: v.colorHex,
              stock_quantity: v.stock,
            })
            .eq("id", v.id);
          if (variantError) throw variantError;
        } else {
          // Insert new
          const { error: variantError } = await supabase
            .from("product_variants")
            .insert({
              product_id: id,
              size: v.size,
              color_name: v.colorName,
              color_hex: v.colorHex,
              stock_quantity: v.stock,
            });
          if (variantError) throw variantError;
        }
      }

      // Invalidate and redirect
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
      navigate({ to: "/admin/products" });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while updating the product.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/admin/products" className="rounded-full p-2 hover:bg-zinc-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basic Details */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold">Basic Details</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Slug (URL friendly)</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Base Price (Rs)</label>
              <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black">
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. vintage, sneakers, rare" className="w-full rounded-lg border border-zinc-200 p-3 outline-none focus:border-black" />
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">Variants (Sizes, Colors, Inventory)</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800">
              <Plus className="h-4 w-4" /> Add Variant
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-start gap-4 rounded-lg border border-zinc-100 bg-zinc-50 p-4 relative">
                <button type="button" onClick={() => removeVariant(index)} className="absolute right-2 top-2 text-zinc-400 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
                
                <div className="grid w-full grid-cols-4 gap-4 pr-6">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-500">Size</label>
                    <input type="text" required value={variant.size} onChange={e => updateVariant(index, "size", e.target.value)} className="w-full rounded border border-zinc-200 p-2 text-sm outline-none" placeholder="e.g. 42" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-500">Color Name</label>
                    <input type="text" required value={variant.colorName} onChange={e => updateVariant(index, "colorName", e.target.value)} className="w-full rounded border border-zinc-200 p-2 text-sm outline-none" placeholder="e.g. Red" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-500">Color Hex</label>
                    <input type="color" required value={variant.colorHex} onChange={e => updateVariant(index, "colorHex", e.target.value)} className="h-9 w-full rounded border border-zinc-200 outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-500">Stock</label>
                    <input type="number" min="0" required value={variant.stock} onChange={e => updateVariant(index, "stock", parseInt(e.target.value))} className="w-full rounded border border-zinc-200 p-2 text-sm outline-none" />
                  </div>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-sm text-zinc-500">No variants added. You must add at least one variant to have stock.</p>
            )}
          </div>
        </section>

        <button
          type="submit"
          disabled={loading || variants.length === 0}
          className="w-full rounded-lg bg-black px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/90 disabled:opacity-50"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
