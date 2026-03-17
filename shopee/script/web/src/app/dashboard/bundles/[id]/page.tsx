import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect, notFound } from 'next/navigation';
import BundleForm from '@/components/admin/BundleForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBundlePage({ params }: Props) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch bundle
  const { data: bundle } = await supabase
    .from('product_bundles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!bundle) {
    notFound();
  }

  // Fetch bundle items
  const { data: bundleItems } = await supabase
    .from('product_bundle_items')
    .select(`
      id,
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq('bundle_id', id);

  // Fetch products for selection
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Bundle</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update bundle details and products
        </p>
      </div>

      <BundleForm
        bundle={bundle}
        bundleItems={bundleItems || []}
        products={products || []}
      />
    </div>
  );
}
