import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartItem = {
  key: string; // productId + size + color
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
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const getProductForItem = (item: CartItem) =>
      products.find((p) => p.id === item.productId);

    const addItem = (productId: string, size: number, color: string, quantity = 1) => {
      const key = `${productId}__${size}__${color}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { key, productId, size, color, quantity }];
      });
    };

    const removeItem = (key: string) =>
      setItems((prev) => prev.filter((i) => i.key !== key));

    const updateQuantity = (key: string, quantity: number) =>
      setItems((prev) =>
        prev
          .map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i))
          .filter((i) => i.quantity > 0),
      );

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
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
