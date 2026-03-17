import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import BundleForm from '@/components/admin/BundleForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewBundlePage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch products for selection
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Bundle</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bundle multiple products together as a combo offer
        </p>
      </div>

      <BundleForm products={products || []} />
    </div>
  );
}
