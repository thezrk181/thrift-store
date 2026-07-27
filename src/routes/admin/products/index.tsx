import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts, type Product } from "@/lib/products";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsList,
});

function AdminProductsList() {
  const { data: products = [], isLoading } = useProducts();
  const queryClient = useQueryClient();

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      // First delete associated images from storage
      const { data: images } = await supabase
        .from("product_images")
        .select("image_path")
        .eq("product_id", product.db_id);

      if (images && images.length > 0) {
        const paths = images.map((img) => img.image_path);
        await supabase.storage.from("product-images").remove(paths);
      }

      // Then delete the product (cascade will handle variants and image rows)
      const { error } = await supabase.from("products").delete().eq("id", product.db_id);

      if (error) {
        alert("Error deleting product: " + error.message);
      } else {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    }
  };

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-900">
              <tr>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Condition</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-zinc-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.db_id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover border border-zinc-200"
                      />
                      <div className="font-bold text-zinc-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase tracking-wider">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    Rs {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{product.condition}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/admin/products/$id"
                        params={{ id: product.db_id }}
                        className="rounded p-2 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="rounded p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
