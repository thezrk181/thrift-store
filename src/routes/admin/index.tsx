import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Package, Users, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Orders and Revenue
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total_amount");
      
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;

      // Users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalProducts: productsCount || 0,
        totalOrders,
        totalRevenue,
        totalUsers: usersCount || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `Rs ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Registered Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight">Overview</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
