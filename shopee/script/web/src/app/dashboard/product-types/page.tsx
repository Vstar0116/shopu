import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import ProductTypesClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductTypesPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  const { data: productTypes } = await supabase
    .from('product_types')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Product Types</h1>
        <p className="mt-2 text-sm text-slate-600">
          Define product type categories for better organization
        </p>
      </div>

      <ProductTypesClient productTypes={productTypes || []} />
    </div>
  );
}
