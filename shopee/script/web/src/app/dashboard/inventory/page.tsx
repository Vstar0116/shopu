import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import InventoryClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all products with variants and stock info
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      sku,
      stock_quantity,
      track_inventory,
      product_variants (
        id,
        sku,
        title,
        stock_quantity,
        is_active
      )
    `)
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track stock levels across all products and variants
        </p>
      </div>

      <InventoryClient products={products || []} />
    </div>
  );
}
