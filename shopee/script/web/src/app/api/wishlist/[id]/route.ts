import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = {
  params: Promise<{ id: string }>;
};

// DELETE - Remove item from wishlist
export async function DELETE(request: Request, { params }: Params) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the wishlist item belongs to the user
  const { data: item } = await supabase
    .from("wishlist_items")
    .select(`
      id,
      wishlists:wishlist_id (
        profile_id
      )
    `)
    .eq("id", parseInt(id))
    .single();

  if (!item || (item.wishlists as any)?.profile_id !== user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }

  return NextResponse.json({ message: "Removed from wishlist" });
}
