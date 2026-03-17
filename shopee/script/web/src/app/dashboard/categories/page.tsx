import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import CategoriesClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return <CategoriesClient categories={categories || []} />;
}
