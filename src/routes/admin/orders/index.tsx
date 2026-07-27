import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersList,
});

function AdminOrdersList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles ( first_name, last_name, phone ),
          order_items (
            quantity,
            price_at_time,
            product_variants (
              size,
              color_name,
              products ( name )
            )
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
      
    if (!error) {
      // Optimistically update cache
      queryClient.setQueryData(["admin-orders"], (old: any[]) => 
        old.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } else {
      alert("Error updating status: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight">Manage Orders</h1>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-900">
            <tr>
              <th className="px-6 py-4 font-bold">Order ID & Date</th>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Items</th>
              <th className="px-6 py-4 font-bold">Total</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-zinc-50 cursor-pointer group"
                  onClick={(e) => {
                    // Prevent navigation if clicking on select dropdown
                    if ((e.target as HTMLElement).tagName.toLowerCase() !== 'select') {
                      navigate({ to: `/admin/orders/${order.id}` });
                    }
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-bold text-zinc-900 group-hover:text-black transition-colors">
                      {order.id.split('-')[0]}...
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">
                      {order.profiles ? `${order.profiles.first_name} ${order.profiles.last_name}` : "Guest User"}
                    </div>
                    {order.profiles?.phone && (
                      <div className="text-xs">{order.profiles.phone}</div>
                    )}
                    <div className="mt-1 text-xs">{order.shipping_address?.city}, {order.shipping_address?.postal_code}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <ul className="list-disc pl-4">
                      {order.order_items?.map((item: any, i: number) => (
                        <li key={i}>
                          {item.quantity}x {item.product_variants?.products?.name} 
                          ({item.product_variants?.color_name}, Size {item.product_variants?.size})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    Rs {Number(order.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider outline-none ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "paid" ? "bg-blue-100 text-blue-800" :
                        order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/admin/orders/${order.id}`}
                      className="text-xs font-bold text-zinc-400 hover:text-black transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details &rarr;
                    </Link>
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
