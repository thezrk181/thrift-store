import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/promos/")({
  component: AdminPromos,
});

function AdminPromos() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        is_active: true
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
      setShowForm(false);
      setCode("");
      setDiscountValue("");
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !currentStatus }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
  };

  const deletePromo = async (id: string) => {
    if (window.confirm("Delete this promo code?")) {
      await supabase.from("promo_codes").delete().eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
    }
  };

  if (isLoading) return <div>Loading promo codes...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight">Promo Codes</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-black/80"
        >
          <Plus className="h-4 w-4" /> New Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Create Promo Code</h2>
          {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Code Name</label>
              <input type="text" required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. SUMMER20" className="w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-black uppercase" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Type</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-black">
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed_amount">Fixed Amount Off (Rs)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Value</label>
              <input type="number" required={discountType !== 'free_shipping'} disabled={discountType === 'free_shipping'} min="0" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="e.g. 20" className="w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-black disabled:opacity-50" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={loading} className="rounded-lg bg-black px-6 py-2 text-sm font-bold uppercase text-white hover:bg-black/90">
              {loading ? "Saving..." : "Save Code"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-900 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold">Code</th>
              <th className="px-6 py-4 font-bold">Discount</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {promos.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No promo codes found.</td></tr>
            ) : (
              promos.map((promo: any) => (
                <tr key={promo.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-zinc-400" />
                      {promo.code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {promo.discount_type === 'percentage' && `${promo.discount_value}% Off`}
                    {promo.discount_type === 'fixed_amount' && `Rs ${promo.discount_value} Off`}
                    {promo.discount_type === 'free_shipping' && `Free Shipping`}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(promo.id, promo.is_active)}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${promo.is_active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}
                    >
                      {promo.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deletePromo(promo.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
