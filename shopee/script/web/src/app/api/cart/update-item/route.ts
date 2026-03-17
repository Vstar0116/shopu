import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export async function PATCH(request: Request) {
  const body = await request.json();
  const { cartItemId, quantity } = body as {
    cartItemId: number;
    quantity: number;
  };

  if (!cartItemId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error updating cart item", error);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }

  return NextResponse.json(data);
}

