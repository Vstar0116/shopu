import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import DiscountsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DiscountsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: discounts } = await supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false });

  return <DiscountsClient discounts={discounts || []} />;
}
