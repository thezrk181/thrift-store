import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { getProductImageUrl } from "./image-service";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: number[];
  colors: { name: string; hex: string }[];
  category: string;
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

  return {
    id: p.slug, // the old frontend expects the URL slug as the 'id' field
    name: p.name,
    price: Number(p.base_price),
    image: getProductImageUrl(primaryImage),
    sizes,
    colors: Array.from(colorsMap.values()),
    category: p.category,
    tags: p.tags || [],
    description: p.description || "",
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select(`
      *,
      product_images ( image_path, is_primary ),
      product_variants ( size, color_name, color_hex )
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
      product_variants ( size, color_name, color_hex )
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
        product_variants ( size, color_name, color_hex )
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
