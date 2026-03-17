'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/uiConfig';

interface ProductFormProps {
  product?: any;
  categories?: any[];
  sellers?: any[];
}

export default function ProductForm({ product, categories = [], sellers = [] }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    long_description: product?.long_description || '',
    base_price: product?.base_price || '',
    category_id: product?.category_id || '',
    seller_id: product?.seller_id || '',
    is_customizable: product?.is_customizable || false,
    is_active: product?.is_active ?? true,
    min_processing_days: product?.min_processing_days || '',
    max_processing_days: product?.max_processing_days || '',
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
    seo_keywords: product?.seo_keywords || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name' && !product) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Basic Information</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Digital Painting with Frame"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="digital-painting-with-frame"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Seller
            </label>
            <select
              name="seller_id"
              value={formData.seller_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select seller</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Base Price (₹)
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              step="0.01"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="2999"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_customizable"
                checked={formData.is_customizable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Customizable</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Short Description
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Brief product description..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Long Description
            </label>
            <textarea
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Detailed product description..."
            />
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Processing Time</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Min Days
            </label>
            <input
              type="number"
              name="min_processing_days"
              value={formData.min_processing_days}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Max Days
            </label>
            <input
              type="number"
              name="max_processing_days"
              value={formData.max_processing_days}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="7"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SEO Title
            </label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Buy Digital Painting with Frame Online"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SEO Description
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Meta description for search engines..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              name="seo_keywords"
              value={formData.seo_keywords}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="digital painting, custom art, framed painting"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover} disabled:opacity-50`}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {product ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
