import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import OrderDetailClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch order with items
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name,
        phone
      ),
      order_items (
        *,
        products (
          name,
          slug
        ),
        product_variants (
          title
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!order) {
    redirect('/dashboard/orders');
  }

  // Fetch order status history
  const { data: statusHistory } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true });

  return <OrderDetailClient order={order} statusHistory={statusHistory || []} />;
}
