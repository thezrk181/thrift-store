import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { type Product, useProducts } from "./products";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import { useEffect } from "react";

export type CartItem = {
  key: string; // fallback string key
  variantId: string; // The database variant ID
  productId: string;
  size: number;
  color: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string, size: number, color: string, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  getProductForItem: (item: CartItem) => Product | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: products = [] } = useProducts();
  const { session } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Sync to database if logged in
  useEffect(() => {
    if (!session?.user?.id) return;

    // Using a simple debounce/timeout to avoid spamming the DB on every single click
    const timer = setTimeout(async () => {
      await supabase.from("carts").upsert(
        {
          user_id: session.user.id,
          items: items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [items, session]);

  const value = useMemo<CartContextValue>(() => {
    const getProductForItem = (item: CartItem) => products.find((p) => p.id === item.productId);

    const addItem = (productId: string, size: number, color: string, quantity = 1) => {
      const p = products.find((p) => p.id === productId);
      const variant = p?.variants?.find((v) => v.size === size && v.color === color);
      const variantId = variant?.id || "";

      const key = `${productId}__${size}__${color}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          const newQty = existing.quantity + quantity;
          const maxStock = variant?.stock_quantity ?? Infinity;
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(newQty, maxStock) } : i,
          );
        }
        return [...prev, { key, variantId, productId, size, color, quantity }];
      });
    };

    const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));

    const updateQuantity = (key: string, quantity: number) =>
      setItems((prev) => {
        return prev
          .map((i) => {
            if (i.key === key) {
              const p = products.find((prod) => prod.id === i.productId);
              const variant = p?.variants?.find((v) => v.size === i.size && v.color === i.color);
              const maxStock = variant?.stock_quantity ?? Infinity;
              return { ...i, quantity: Math.min(Math.max(1, quantity), maxStock) };
            }
            return i;
          })
          .filter((i) => i.quantity > 0);
      });

    const clear = () => setItems([]);

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => {
      const p = getProductForItem(i);
      return sum + (p?.price ?? 0) * i.quantity;
    }, 0);

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      count,
      subtotal,
      getProductForItem,
    };
  }, [items, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
