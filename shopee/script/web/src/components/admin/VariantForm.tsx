'use client';

import { useState } from 'react';
import FormModal from '@/components/admin/FormModal';

interface Variant {
  id?: number;
  product_id: number;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
}

interface VariantFormProps {
  productId: number;
  variant?: Variant;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VariantForm({ productId, variant, onSuccess, onCancel }: VariantFormProps) {
  const [formData, setFormData] = useState<{
    sku: string;
    title: string;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number | null;
    is_active: boolean;
    size: string;
    color: string;
    material: string;
  }>({
    sku: variant?.sku || '',
    title: variant?.title || '',
    price: variant?.price || 0,
    compare_at_price: variant?.compare_at_price || null,
    stock_quantity: variant?.stock_quantity ?? null,
    is_active: variant?.is_active ?? true,
    // Attributes as separate fields for easier editing
    size: (variant?.attributes?.size as string) || '',
    color: (variant?.attributes?.color as string) || '',
    material: (variant?.attributes?.material as string) || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build attributes object
      const attributes: Record<string, string> = {};
      if (formData.size) attributes.size = formData.size;
      if (formData.color) attributes.color = formData.color;
      if (formData.material) attributes.material = formData.material;

      const payload = {
        product_id: productId,
        sku: formData.sku,
        title: formData.title,
        attributes,
        price: parseFloat(formData.price.toString()),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price.toString()) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity.toString()) : null,
        is_active: formData.is_active,
      };

      const url = variant
        ? `/api/admin/product-variants/${variant.id}`
        : '/api/admin/product-variants';
      
      const method = variant ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save variant');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={variant ? 'Edit Variant' : 'Create Variant'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Variant Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., Small - Red - Framed"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Size
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="A4, A3, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Red, Blue, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Material
            </label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Canvas, Acrylic, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="SKU-12345"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Compare at Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.compare_at_price || ''}
              onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Original price"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Stock Quantity
          </label>
          <input
            type="number"
            value={formData.stock_quantity || ''}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
            Active (available for purchase)
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
