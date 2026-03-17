import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = {
  params: Promise<{ id: string }>;
};

// PUT - Update address
export async function PUT(request: Request, { params }: Params) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  // Verify ownership
  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", parseInt(id))
    .eq("profile_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // If setting as default, unset other defaults
  if (is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", user.id)
      .neq("id", parseInt(id));
  }

  const { data: address, error } = await supabase
    .from("addresses")
    .update({
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      country,
      phone,
      is_default,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parseInt(id))
    .select("*")
    .single();

  if (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }

  return NextResponse.json({ address });
}

// DELETE - Delete address
export async function DELETE(request: Request, { params }: Params) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before deleting
  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", parseInt(id))
    .eq("profile_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }

  return NextResponse.json({ message: "Address deleted successfully" });
}
