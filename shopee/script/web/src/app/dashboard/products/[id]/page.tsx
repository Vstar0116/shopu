import ProductForm from '@/components/admin/ProductForm';
import ProductImagesManager from '@/components/admin/ProductImagesManager';
import CustomizationOptionsManager from '@/components/admin/CustomizationOptionsManager';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  // Fetch product images
  const { data: productImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', id)
    .order('sort_order', { ascending: true });

  // Fetch customization options
  const { data: customizationOptions } = await supabase
    .from('customization_options')
    .select('*')
    .eq('product_id', id)
    .order('sort_order', { ascending: true });

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
          <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update product details and settings.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <Link
          href={`/dashboard/products/${id}`}
          className="border-b-2 border-amber-600 px-4 py-2 text-sm font-semibold text-amber-600"
        >
          Basic Info
        </Link>
        <Link
          href={`/dashboard/products/${id}/variants`}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Variants
        </Link>
      </div>

      {/* Form */}
      <ProductForm
        product={product}
        categories={categories || []}
        sellers={sellers || []}
      />

      {/* Images Section */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <ProductImagesManager
          productId={parseInt(id)}
          initialImages={productImages || []}
        />
      </div>

      {/* Customization Options Section */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <CustomizationOptionsManager
          productId={parseInt(id)}
          initialOptions={customizationOptions || []}
        />
      </div>
    </div>
  );
}
