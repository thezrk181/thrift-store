import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "@/lib/products";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { CreditCard, Truck, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Valid postal code required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const SHIPPING_COST = 250;

function CheckoutPage() {
  const { items, subtotal, getProductForItem, clear } = useCart();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{code: string, type: string, value: number} | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    if (session) {
      form.setValue("email", session.user.email || "");
      supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.first_name) form.setValue("firstName", data.first_name);
            if (data.last_name) form.setValue("lastName", data.last_name);
            if (data.phone) form.setValue("phone", data.phone);
            
            if (data.saved_address) {
              const sa = data.saved_address;
              if (sa.firstName) form.setValue("firstName", sa.firstName);
              if (sa.lastName) form.setValue("lastName", sa.lastName);
              if (sa.address) form.setValue("address", sa.address);
              if (sa.city) form.setValue("city", sa.city);
              if (sa.postalCode) form.setValue("postalCode", sa.postalCode);
              if (sa.phone) form.setValue("phone", sa.phone);
            }
          }
        });
    }
  }, [session, form]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    
    setValidatingPromo(true);
    setPromoError(null);
    
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoInput.trim().toUpperCase())
      .eq("is_active", true)
      .single();
      
    if (error || !data) {
      setPromoError("Invalid or expired promo code");
      setAppliedPromo(null);
    } else {
      setAppliedPromo({
        code: data.code,
        type: data.discount_type,
        value: Number(data.discount_value)
      });
      setPromoError(null);
      setPromoInput("");
    }
    setValidatingPromo(false);
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  let discount = 0;
  let finalShipping = SHIPPING_COST;
  
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = (subtotal * appliedPromo.value) / 100;
    } else if (appliedPromo.type === "fixed_amount") {
      discount = appliedPromo.value;
    } else if (appliedPromo.type === "free_shipping") {
      finalShipping = 0;
    }
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);
  
  const total = subtotal - discount + finalShipping;

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;
    
    setIsPlacingOrder(true);
    setError(null);

    try {
      const orderItems = items.map((item) => {
        const product = getProductForItem(item);
        return {
          variant_id: item.variantId,
          quantity: item.quantity,
          price_at_time: product?.price || 0,
        };
      });

      const result = await placeOrder(
        session?.user?.id || null, // pass user_id if logged in
        data,
        total,
        orderItems
      );

      if (result && result.success) {
        clear();
        // Use window.location for hard navigation or navigate for SPA
        navigate({
          to: "/order-success",
          search: { orderNumber: result.order_number },
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to place order. Items might be out of stock.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 md:px-8 bg-zinc-50 flex items-center justify-center">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-zinc-200 rounded-full mx-auto flex items-center justify-center">
            <Truck className="w-10 h-10 text-zinc-400" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Your cart is empty</h1>
          <p className="text-zinc-500">Add some pieces before checking out.</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white font-medium uppercase tracking-wider text-sm hover:bg-zinc-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 selection:bg-black selection:text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Checkout</h1>
          <p className="text-zinc-500 mt-2">Complete your order securely.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: FORMS */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            
            {/* CONTACT & SHIPPING */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs">1</span>
                Contact & Delivery
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    {...form.register("email")}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    placeholder="you@example.com"
                  />
                  {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">First Name</label>
                    <input
                      {...form.register("firstName")}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                    {form.formState.errors.firstName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      {...form.register("lastName")}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                    {form.formState.errors.lastName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    {...form.register("phone")}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    placeholder="+92 3XX XXXXXXX"
                  />
                  {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Address</label>
                  <input
                    {...form.register("address")}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    placeholder="Street address, apartment, suite, etc."
                  />
                  {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">City</label>
                    <input
                      {...form.register("city")}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                    {form.formState.errors.city && <p className="text-red-500 text-xs mt-1">{form.formState.errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Postal Code</label>
                    <input
                      {...form.register("postalCode")}
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                    {form.formState.errors.postalCode && <p className="text-red-500 text-xs mt-1">{form.formState.errors.postalCode.message}</p>}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PAYMENT METHOD */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs">2</span>
                Payment
              </h2>

              <div className="space-y-3">
                {/* Active: COD */}
                <label className="relative flex cursor-pointer rounded-2xl border-2 border-black bg-zinc-50 p-4 focus:outline-none">
                  <input type="radio" name="payment" value="cod" className="peer sr-only" defaultChecked />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">Cash on Delivery</p>
                        <p className="text-sm text-zinc-500">Pay when your order arrives</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  </div>
                </label>

                {/* Disabled: Card */}
                <label className="relative flex cursor-not-allowed opacity-50 rounded-2xl border border-zinc-200 p-4">
                  <input type="radio" name="payment" value="card" className="peer sr-only" disabled />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-700">Credit / Debit Card</p>
                        <p className="text-sm text-zinc-500">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </motion.section>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-5 lg:col-span-4"
          >
            <div className="sticky top-24 bg-black text-white p-6 md:p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                {items.map((item) => {
                  const product = getProductForItem(item);
                  if (!product) return null;
                  return (
                    <div key={item.key} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-white/50 mt-1">Size {item.size} • {item.color}</p>
                        <p className="text-xs text-white/50 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">Rs {product.price * item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                
                {/* Promo Code Input Form */}
                <form onSubmit={handleApplyPromo} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-sm uppercase"
                  />
                  <button
                    type="submit"
                    disabled={validatingPromo || !promoInput.trim()}
                    className="h-10 px-4 rounded-lg bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
                {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
                
                <div className="flex justify-between text-white/70 mt-4">
                  <span>Subtotal</span>
                  <span>Rs {subtotal}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center gap-2">
                      <span>Discount ({appliedPromo.code})</span>
                      <button type="button" onClick={removePromo} className="text-xs underline hover:text-green-300">Remove</button>
                    </div>
                    <span>- Rs {discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>{finalShipping === 0 ? "FREE" : `Rs ${finalShipping}`}</span>
                </div>
                <div className="flex justify-between items-center pt-4 text-xl font-black mt-2">
                  <span>Total</span>
                  <span>Rs {total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full mt-8 h-14 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>
              
              <p className="text-center text-xs text-white/40 mt-4 flex items-center justify-center gap-2">
                Secure checkout provided by Sole Wala
              </p>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
