import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user's addresses
export async function GET() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ addresses: addresses ?? [] });
}

// POST - Create new address
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    country,
    phone,
    is_default
  } = body;

  // If setting as default, unset other default addresses
  if (is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", user.id);
  }

  const { data: address, error } = await supabase
    .from("addresses")
    .insert({
      profile_id: user.id,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      country: country || "India",
      phone,
      is_default: is_default || false,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }

  return NextResponse.json({ address });
}
