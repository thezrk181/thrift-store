import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/admin/abandoned-carts/")({
  component: AdminAbandonedCarts,
});

function AdminAbandonedCarts() {
  const { data: carts = [], isLoading } = useQuery({
    queryKey: ["admin-abandoned-carts"],
    queryFn: async () => {
      // Fetch carts using the secure RPC function to get user emails
      const { data, error } = await supabase.rpc("get_admin_carts");

      if (error) throw error;

      // Filter out empty carts and format
      return (data || [])
        .filter((cart: any) => cart.items && Array.isArray(cart.items) && cart.items.length > 0)
        .map((cart: any) => ({
          ...cart,
          user_name: cart.first_name
            ? `${cart.first_name} ${cart.last_name || ""}`.trim()
            : "Unknown User",
          email: cart.email,
        }));
    },
  });

  if (isLoading) return <div>Loading abandoned carts...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight">Abandoned Carts</h1>
      </div>

      <div className="mb-8 rounded-xl bg-blue-50 p-6 border border-blue-100">
        <p className="text-sm text-blue-800">
          This page shows active shopping carts for logged-in users. Carts that haven't been checked
          out yet appear here. In the future, you can integrate automated emails to send these users
          a reminder or a discount code!
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-900 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Items in Cart</th>
              <th className="px-6 py-4 font-bold">Last Updated</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {carts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">
                  No abandoned carts found.
                </td>
              </tr>
            ) : (
              carts.map((cart: any) => {
                const isAbandoned =
                  new Date(cart.updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;

                return (
                  <tr key={cart.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{cart.user_name}</div>
                      <div className="text-xs text-zinc-500">{cart.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-zinc-400" />
                        <span className="font-bold text-zinc-900">{cart.items.length} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{new Date(cart.updated_at).toLocaleString()}</div>
                      {isAbandoned && (
                        <span className="inline-block mt-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-800">
                          Over 24h ago
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`mailto:${cart.email}`}
                        className="text-xs font-bold uppercase text-blue-600 hover:underline"
                      >
                        Email User
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
