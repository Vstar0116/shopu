import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { WishlistClient } from "./client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WishlistPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  let items: any[] = [];
  if (wishlist) {
      const { data } = await supabase
      .from("wishlist_items")
      .select(`
        id,
        product_id,
        variant_id,
        created_at,
        products:product_id (
          id,
          name,
          slug,
          base_price,
          image_url
        ),
        product_variants:variant_id (
          id,
          title,
          price,
          stock_quantity
        )
      `)
      .eq("wishlist_id", wishlist.id)
      .order("created_at", { ascending: false });

    items = data ?? [];
  }

  return <WishlistClient items={items} />;
}
