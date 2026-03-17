import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { ProfileClient } from "./client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <ProfileClient profile={profile} email={user.email ?? ""} />;
}
