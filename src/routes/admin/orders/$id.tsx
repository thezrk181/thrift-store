import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProductImageUrl } from "@/lib/image-service";
import { ArrowLeft, MapPin, Package, User, Clock, CreditCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles ( first_name, last_name, phone ),
          order_items (
            id,
            quantity,
            price_at_time,
            product_variants (
              size,
              color_name,
              products ( 
                name,
                product_images ( image_path, is_primary )
              )
            )
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } else {
      alert("Error updating status: " + error.message);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link 
          to="/admin/orders" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tight">Order #{order.id.split('-')[0]}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[order.status] || "bg-zinc-100 text-zinc-800 border-zinc-200"}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4" /> 
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4 font-bold text-zinc-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-zinc-400" />
              Order Items ({order.order_items?.length || 0})
            </div>
            <div className="divide-y divide-zinc-100">
              {order.order_items?.map((item: any) => {
                const variant = item.product_variants;
                const product = variant?.products;
                const images = product?.product_images || [];
                const primaryImage = images.find((img: any) => img.is_primary)?.image_path || images[0]?.image_path;

                return (
                  <div key={item.id} className="flex p-4 gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                      {primaryImage ? (
                        <img 
                          src={getProductImageUrl(primaryImage)} 
                          alt={product?.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-900">{product?.name || "Unknown Product"}</h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {variant?.color_name} • Size {variant?.size}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-zinc-500">Qty: {item.quantity}</span>
                        <span className="font-bold text-zinc-900">Rs {Number(item.price_at_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-zinc-200 bg-zinc-50 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-zinc-500">Total Amount</span>
                <span className="text-xl font-black text-zinc-900">Rs {Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Actions */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden p-5">
            <h3 className="font-bold text-zinc-900 mb-4">Update Status</h3>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isUpdating}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4 font-bold text-zinc-900 flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" />
              Customer Details
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <p className="font-medium text-zinc-500 text-xs uppercase tracking-wider mb-1">Name</p>
                <p className="font-bold text-zinc-900">
                  {order.profiles ? `${order.profiles.first_name} ${order.profiles.last_name}` : "Guest User"}
                </p>
              </div>
              {order.profiles?.phone && (
                <div>
                  <p className="font-medium text-zinc-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-zinc-900">{order.profiles.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4 font-bold text-zinc-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-zinc-400" />
              Shipping Address
            </div>
            <div className="p-4 text-sm">
              <p className="font-bold text-zinc-900 mb-1">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
              <p className="text-zinc-600 mb-1">{order.shipping_address?.street}</p>
              <p className="text-zinc-600">
                {order.shipping_address?.city}, {order.shipping_address?.postalCode}
              </p>
              <p className="text-zinc-600 mt-2 flex items-center gap-1">
                <span className="font-medium text-zinc-500 text-xs uppercase tracking-wider">Contact:</span> {order.shipping_address?.phone}
              </p>
            </div>
          </div>
          
          {/* Payment Card */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-50 p-4 font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              Payment Details
            </div>
            <div className="p-4 text-sm">
              <p className="text-zinc-600 mb-1">Method: <span className="font-medium text-zinc-900">Cash on Delivery</span></p>
              <p className="text-zinc-600">Total: <span className="font-bold text-zinc-900">Rs {Number(order.total_amount).toLocaleString()}</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
