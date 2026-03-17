import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import ShippingMethodsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShippingMethodsPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch shipping methods
  const { data: shippingMethods } = await supabase
    .from('shipping_methods')
    .select(`
      *,
      sellers (
        name
      )
    `)
    .order('name', { ascending: true });

  // Fetch sellers for dropdown
  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Shipping Methods</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure shipping options and delivery methods
        </p>
      </div>

      <ShippingMethodsClient 
        shippingMethods={shippingMethods || []} 
        sellers={sellers || []}
      />
    </div>
  );
}
