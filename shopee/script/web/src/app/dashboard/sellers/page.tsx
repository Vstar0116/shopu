import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import SellersClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SellersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: sellers } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false });

  return <SellersClient sellers={sellers || []} />;
}
