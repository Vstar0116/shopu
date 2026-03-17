import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect, notFound } from 'next/navigation';
import DiscountAnalyticsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function DiscountAnalyticsPage({ params }: Props) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch discount
  const { data: discount } = await supabase
    .from('discounts')
    .select('*')
    .eq('id', id)
    .single();

  if (!discount) {
    notFound();
  }

  // Fetch discount applications/usage
  const { data: applications } = await supabase
    .from('discount_applications')
    .select(`
      *,
      orders (
        order_number,
        total_amount,
        created_at,
        profiles (
          full_name
        )
      )
    `)
    .eq('discount_id', id)
    .order('applied_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{discount.code} - Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track discount usage and revenue impact
        </p>
      </div>

      <DiscountAnalyticsClient 
        discount={discount}
        applications={applications || []}
      />
    </div>
  );
}
