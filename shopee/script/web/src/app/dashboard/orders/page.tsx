import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import OrdersClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return <OrdersClient orders={orders || []} />;
}
