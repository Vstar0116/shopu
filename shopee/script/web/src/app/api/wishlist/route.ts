import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user's wishlist
export async function GET() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create wishlist for user
  let { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    const { data: newWishlist } = await supabase
      .from("wishlists")
      .insert({ profile_id: user.id })
      .select("id")
      .single();
    
    wishlist = newWishlist;
  }

  if (!wishlist) {
    return NextResponse.json({ items: [] });
  }

  // Fetch wishlist items
  const { data: items } = await supabase
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
        price
      )
    `)
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ items: items ?? [] });
}

// POST - Add item to wishlist
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId, variantId } = body as {
    productId: number;
    variantId?: number;
  };

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  // Get or create wishlist
  let { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    const { data: newWishlist, error: createError } = await supabase
      .from("wishlists")
      .insert({ profile_id: user.id })
      .select("id")
      .single();
    
    if (createError || !newWishlist) {
      return NextResponse.json({ error: "Failed to create wishlist" }, { status: 500 });
    }
    
    wishlist = newWishlist;
  }

  // Check if item already exists
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlist.id)
    .eq("product_id", productId)
    .eq("variant_id", variantId ?? null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "Item already in wishlist", id: existing.id });
  }

  // Add to wishlist
  const { data: item, error } = await supabase
    .from("wishlist_items")
    .insert({
      wishlist_id: wishlist.id,
      product_id: productId,
      variant_id: variantId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }

  return NextResponse.json({ message: "Added to wishlist", id: item.id });
}
