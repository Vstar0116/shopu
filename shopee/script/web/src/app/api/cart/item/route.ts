import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("cart_items").delete().eq("id", Number(id));

  if (error) {
    console.error("Error removing cart item", error);
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

