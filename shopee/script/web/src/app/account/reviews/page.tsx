import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { ReviewsClient } from "./client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReviewsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
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

  return <ReviewsClient reviews={reviews ?? []} />;
}
