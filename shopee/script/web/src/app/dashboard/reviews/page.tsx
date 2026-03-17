import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import ReviewsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReviewsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      *,
      products (
        name,
        slug
      ),
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return <ReviewsClient reviews={reviews || []} />;
}
