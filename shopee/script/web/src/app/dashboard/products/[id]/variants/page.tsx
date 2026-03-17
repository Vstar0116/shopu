import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductVariantsClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductVariantsPage({ params }: Props) {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('id', id)
    .single();

  if (!product) {
    redirect('/dashboard/products');
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('id', { ascending: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/products/${id}`}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-600">Manage product variants</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <Link
          href={`/dashboard/products/${id}`}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Basic Info
        </Link>
        <Link
          href={`/dashboard/products/${id}/variants`}
          className="border-b-2 border-amber-600 px-4 py-2 text-sm font-semibold text-amber-600"
        >
          Variants
        </Link>
      </div>

      <ProductVariantsClient
        productId={parseInt(id)}
        variants={variants || []}
      />
    </div>
  );
}
