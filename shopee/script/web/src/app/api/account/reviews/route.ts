import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user's reviews
export async function GET() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: reviews } = await supabase
    .from("product_reviews")
    .select(`
      id,
      product_id,
      rating,
      title,
      body,
      is_published,
      created_at,
      products:product_id (
        id,
        name,
        slug
      )
    `)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ reviews: reviews ?? [] });
}
