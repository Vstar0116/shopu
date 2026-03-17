import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

// Simple placeholder to verify auth wiring; will be extended later
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({ authenticated: !!user, user });
}

