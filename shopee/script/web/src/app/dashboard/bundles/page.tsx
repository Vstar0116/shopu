import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import BundlesClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BundlesPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all bundles
  const { data: bundles } = await supabase
    .from('product_bundles')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      compare_at_price,
      is_active,
      created_at
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Product Bundles</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create combo offers by bundling multiple products together
        </p>
      </div>

      <BundlesClient bundles={bundles || []} />
    </div>
  );
}
