import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { getProductImageUrl } from "./image-service";

export type Product = {
  id: string; // The slug (used for routing)
  db_id: string; // The actual UUID in the database
  name: string;
  price: number;
  image: string;
  sizes: number[];
  colors: { name: string; hex: string }[];
  variants: { id: string; size: number; color: string; stock_quantity: number }[];
  category: string;
  condition?: string;
  tags: string[];
  description: string;
};

// Internal helper to map database shape to our frontend Product shape
function transformProduct(p: any): Product {
  const primaryImage =
    p.product_images?.find((img: any) => img.is_primary)?.image_path ||
    p.product_images?.[0]?.image_path;

  // Deduplicate sizes and sort them
  const sizes = Array.from(
    new Set(p.product_variants?.map((v: any) => parseFloat(v.size)))
  ).sort((a: any, b: any) => a - b) as number[];

  // Deduplicate colors
  const colorsMap = new Map();
  p.product_variants?.forEach((v: any) => {
    if (!colorsMap.has(v.color_name)) {
      colorsMap.set(v.color_name, { name: v.color_name, hex: v.color_hex });
    }
  });

  // Expose the raw variants to match for cart ID
  const variants = p.product_variants?.map((v: any) => ({
    id: v.id,
    size: parseFloat(v.size),
    color: v.color_name,
    stock_quantity: v.stock_quantity || 0,
  })) || [];

  return {
    id: p.slug, // the old frontend expects the URL slug as the 'id' field
    db_id: p.id,
    name: p.name,
    price: Number(p.base_price),
    image: getProductImageUrl(primaryImage),
    sizes,
    colors: Array.from(colorsMap.values()),
    variants,
    category: p.category,
    condition: p.condition || "Good",
    tags: p.tags || [],
    description: p.description || "",
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select(`
      *,
      product_images ( image_path, is_primary ),
      product_variants ( id, size, color_name, color_hex, stock_quantity )
    `);

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return (data || []).map(transformProduct);
}

export async function fetchProductByIdOrSlug(
  idOrSlug: string
): Promise<Product | undefined> {
  let { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images ( image_path, is_primary ),
      product_variants ( id, size, color_name, color_hex, stock_quantity )
    `
    )
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (!data) {
    // Fallback just in case they pass the UUID
    const res = await supabase
      .from("products")
      .select(
        `
        *,
        product_images ( image_path, is_primary ),
        product_variants ( id, size, color_name, color_hex, stock_quantity )
      `
      )
      .eq("id", idOrSlug)
      .maybeSingle();
    data = res.data;
  }

  if (!data) return undefined;
  return transformProduct(data);
}

// React Query Hooks
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductByIdOrSlug(slug),
  });
}

// Order placement API call
export async function placeOrder(
  userId: string | null,
  shippingAddress: any,
  totalAmount: number,
  items: { variant_id: string; quantity: number; price_at_time: number }[]
) {
  const { data, error } = await supabase.rpc("place_order_with_inventory", {
    p_user_id: userId,
    p_shipping_address: shippingAddress,
    p_total_amount: totalAmount,
    p_items: items,
  });

  if (error) {
    console.error("Error placing order:", error);
    throw new Error(error.message);
  }

  return data;
}
