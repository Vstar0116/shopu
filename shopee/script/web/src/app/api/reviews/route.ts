import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Submit a review
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { product_id, order_id, rating, title, body: reviewBody } = body as {
    product_id: number;
    order_id?: number;
    rating: number;
    title?: string;
    body?: string;
  };

  if (!product_id || !rating) {
    return NextResponse.json({ error: "product_id and rating are required" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", product_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
  }

  const { data: review, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id,
      order_id: order_id || null,
      profile_id: user.id,
      rating,
      title: title || null,
      body: reviewBody || null,
      is_published: false, // Requires admin approval
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }

  return NextResponse.json({ 
    review,
    message: "Review submitted successfully. It will be published after admin approval."
  });
}
