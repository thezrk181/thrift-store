import { supabase } from "./supabase";

/**
 * Gets the public URL for a product image.
 *
 * Future Migration:
 * When swapping from Supabase Storage to Cloudinary, simply replace
 * the logic inside this function to return the Cloudinary URL.
 * The rest of the app won't need to change.
 */
export function getProductImageUrl(imagePath: string, width: number = 800): string {
  if (!imagePath) return "";

  // For absolute URLs (like the unsplash ones we might still have as fallbacks)
  if (imagePath.startsWith("http")) return imagePath;

  const { data } = supabase.storage.from("product-images").getPublicUrl(imagePath, {
    transform: {
      width,
      quality: 80,
    }
  });

  return data.publicUrl;
}
