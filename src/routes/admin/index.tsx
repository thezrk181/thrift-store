import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Package, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Orders and Revenue
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          id, 
          total_amount, 
          status, 
          created_at,
          profiles ( first_name, last_name )
        `)
        .order("created_at", { ascending: false });
      
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;
      const recentOrders = ordersData?.slice(0, 5) || [];

      // Generate dummy chart data for the last 7 days since we don't have enough real historical data yet
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Look for orders on this day
        const dayRevenue = (ordersData || []).filter(o => new Date(o.created_at).toDateString() === d.toDateString())
          .reduce((acc, order) => acc + Number(order.total_amount), 0);
        
        chartData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayRevenue
        });
      }

      // Users count & recent
      const { data: usersData, count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5);

      // Low stock variants
      const { data: lowStockVariants } = await supabase
        .from("product_variants")
        .select(`
          id,
          size,
          color_name,
          stock_quantity,
          products ( name )
        `)
        .lt("stock_quantity", 5)
        .order("stock_quantity", { ascending: true })
        .limit(5);

      return {
        totalProducts: productsCount || 0,
        totalOrders,
        totalRevenue,
        totalUsers: usersCount || 0,
        recentOrders,
        recentUsers: usersData || [],
        lowStock: lowStockVariants || [],
        chartData
      };
    }
  });

  if (isLoading || !data) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `Rs ${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      icon: Package,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Products",
      value: data.totalProducts.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Registered Users",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight">Overview</h1>
      
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-500">{stat.title}</p>
                  <p className="mt-1 text-2xl font-black">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area: Chart & Orders */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-bold mb-4">Revenue (Last 7 Days)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `Rs ${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
                    formatter={(value: number) => [`Rs ${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 p-6 flex justify-between items-center">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
            </div>
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {data.recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center">No orders yet.</td></tr>
              ) : (
                data.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3 font-mono text-xs">{order.id.split('-')[0]}</td>
                    <td className="px-6 py-3 font-medium text-zinc-900">{order.profiles?.first_name} {order.profiles?.last_name}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "paid" ? "bg-blue-100 text-blue-800" :
                        order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-zinc-900">Rs {Number(order.total_amount).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          
          {/* Low Stock Alert */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-red-100 bg-red-50 p-4 flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="font-bold">Low Stock Warning</h2>
            </div>
            <div className="p-4">
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-zinc-500">All products are adequately stocked.</p>
              ) : (
                <ul className="space-y-3">
                  {data.lowStock.map((variant: any) => (
                    <li key={variant.id} className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-zinc-900">{variant.products?.name}</p>
                        <p className="text-xs text-zinc-500">{variant.color_name} - Size {variant.size}</p>
                      </div>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{variant.stock_quantity} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 p-4 flex justify-between items-center">
              <h2 className="font-bold">Recent Users</h2>
              <Link to="/admin/users" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {data.recentUsers.map(user => (
                  <li key={user.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                      {user.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-zinc-500">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
