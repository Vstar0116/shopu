import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import ShippingZonesClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShippingZonesPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch shipping zones
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Shipping Zones</h1>
        <p className="mt-2 text-sm text-slate-600">
          Define delivery zones with postal codes and area restrictions
        </p>
      </div>

      <ShippingZonesClient zones={zones || []} />
    </div>
  );
}
