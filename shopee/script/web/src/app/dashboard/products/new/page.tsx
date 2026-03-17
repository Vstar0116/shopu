import ProductForm from '@/components/admin/ProductForm';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewProductPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch categories and sellers for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Product</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create a new product in your catalog.
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories || []} sellers={sellers || []} />
    </div>
  );
}
