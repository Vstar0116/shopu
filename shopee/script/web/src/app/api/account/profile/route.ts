import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user profile
export async function GET() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile, email: user.email });
}

// PUT - Update user profile
export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, phone, avatar_url } = body as {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
