import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { AddressesClient } from "./client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AddressesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return <AddressesClient addresses={addresses ?? []} />;
}
