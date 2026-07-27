import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export function useWishlist(userId: string | undefined) {
  return useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data.map((w) => w.product_id);
    },
    enabled: !!userId,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId, isWishlisted }: { userId: string; productId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlists")
          .insert({ user_id: userId, product_id: productId });
        if (error) throw error;
      }
    },
    onMutate: async ({ userId, productId, isWishlisted }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist", userId] });
      const previousWishlist = queryClient.getQueryData<string[]>(["wishlist", userId]);
      
      queryClient.setQueryData<string[]>(["wishlist", userId], (old = []) => {
        if (isWishlisted) {
          return old.filter(id => id !== productId);
        } else {
          return [...old, productId];
        }
      });

      return { previousWishlist };
    },
    onError: (err, { userId }, context) => {
      console.error("Wishlist mutation error:", err);
      alert("Error updating wishlist: " + err.message);
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist", userId], context.previousWishlist);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    },
  });
}
