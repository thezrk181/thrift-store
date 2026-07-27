import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Sole Wala" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { session, profile: authProfile, isAdmin, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"orders" | "address">("orders");
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Address form state
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/signin", replace: true });
      return;
    }

    async function loadData() {
      // Load Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        if (profileData.saved_address) {
          setAddress(profileData.saved_address);
        }
      }

      // Load Orders
      const { data: orderData } = await supabase
        .from("orders")
        .select(`*, order_items(*, product_variants(*))`)
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (orderData) {
        setOrders(orderData);
      }
      setLoading(false);
    }
    loadData();
  }, [session, navigate]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ saved_address: address })
      .eq("id", session.user.id);

    if (error) {
      setMessage("Failed to save address.");
    } else {
      setMessage("Address saved successfully!");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  if (!session || loading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f2ef] text-black">
      <SiteNav theme="light" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16 border-b border-black/10 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              My Account
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Welcome back, {profile?.first_name || "User"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full bg-black px-6 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/80"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs font-bold uppercase tracking-wider underline hover:text-black/70"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid gap-16 md:grid-cols-4">
          <aside className="md:col-span-1">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => setActiveTab("orders")}
                className={`text-left text-sm font-bold uppercase tracking-wider ${activeTab === "orders" ? "text-black" : "text-black/50 hover:text-black"}`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`text-left text-sm font-bold uppercase tracking-wider ${activeTab === "address" ? "text-black" : "text-black/50 hover:text-black"}`}
              >
                Address Book
              </button>
            </nav>
          </aside>

          <div className="md:col-span-3">
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-8 text-2xl font-black uppercase tracking-tight">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-black/60">You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-black/50">Order Date</p>
                            <p className="text-sm font-medium mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-widest text-black/50">Status</p>
                            <p className="text-sm font-bold uppercase tracking-wider mt-1">
                              {order.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-widest text-black/50">Total</p>
                            <p className="text-sm font-medium mt-1">Rs {order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-black/80">
                                {item.quantity}x Variant ID: {item.product_variant_id}
                              </span>
                              <span className="font-semibold">Rs {item.price_at_time.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div>
                <h2 className="mb-8 text-2xl font-black uppercase tracking-tight">Address Book</h2>
                <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
                  <form onSubmit={handleSaveAddress} className="space-y-6">
                    {message && (
                      <div className={`rounded p-4 text-sm font-bold ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">First Name</label>
                        <input
                          type="text"
                          required
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">Last Name</label>
                        <input
                          type="text"
                          required
                          value={address.lastName}
                          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                          className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">Street Address</label>
                      <input
                        type="text"
                        required
                        value={address.address}
                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                        className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">City</label>
                        <input
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/60">Phone</label>
                      <input
                        type="tel"
                        required
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="w-full rounded border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded bg-black py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-black/85 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
