import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Store,
  Ticket,
  ShoppingCart,
} from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/promos", label: "Promo Codes", icon: Ticket },
  { to: "/admin/abandoned-carts", label: "Carts", icon: ShoppingCart },
];

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();

  useEffect(() => {
    if (!isLoading && (!session || !isAdmin)) {
      navigate({ to: "/", replace: true });
    }
  }, [session, isAdmin, isLoading, navigate]);

  if (isLoading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        Loading Admin...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-zinc-200">
          <Link
            to="/"
            className="flex items-center gap-2 font-black uppercase tracking-tight hover:opacity-70"
          >
            <Store className="h-5 w-5" />
            <span>Sole Wala Admin</span>
          </Link>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.exact }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  activeProps={{
                    className: "bg-black text-white hover:bg-black hover:text-white",
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <Link
              to="/"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              <Store className="h-5 w-5" />
              Storefront
            </Link>
            <button
              onClick={() => signOut().then(() => navigate({ to: "/" }))}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
