import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import ProductsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      ),
      sellers (
        business_name
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  return <ProductsClient products={products || []} categories={categories || []} />;
}
