'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/uiConfig';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
}

interface BundleItem {
  id?: number;
  product_id: number;
  quantity: number;
  products?: Product | Product[];
}

interface Bundle {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
}

interface BundleFormProps {
  bundle?: Bundle;
  bundleItems?: BundleItem[];
  products: Product[];
}

export default function BundleForm({ bundle, bundleItems = [], products }: BundleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: bundle?.name || '',
    slug: bundle?.slug || '',
    description: bundle?.description || '',
    price: bundle?.price || 0,
    compare_at_price: bundle?.compare_at_price || null,
    discount_type: bundle?.discount_type || 'percentage' as 'fixed' | 'percentage',
    discount_value: bundle?.discount_value || 0,
    is_active: bundle?.is_active ?? true,
    meta_title: bundle?.meta_title || '',
    meta_description: bundle?.meta_description || '',
  });
  const [selectedProducts, setSelectedProducts] = useState<BundleItem[]>(
    bundleItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      products: item.products,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = selectedProducts.find(p => p.product_id === productId);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.product_id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, {
        product_id: productId,
        quantity: 1,
        products: product,
      }]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts(
      selectedProducts.map(p =>
        p.product_id === productId ? { ...p, quantity } : p
      )
    );
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((sum, item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      const productPrice = product?.price || 0;
      return sum + (productPrice * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedProducts.length === 0) {
        throw new Error('Please add at least one product to the bundle');
      }

      const url = bundle
        ? `/api/admin/bundles/${bundle.id}`
        : '/api/admin/bundles';
      
      const method = bundle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: selectedProducts.map(p => ({
            product_id: p.product_id,
            quantity: p.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save bundle');
      }

      router.push('/dashboard/bundles');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalOriginalPrice = calculateTotalPrice();
  const discountedPrice = formData.discount_type === 'fixed'
    ? totalOriginalPrice - formData.discount_value
    : totalOriginalPrice * (1 - formData.discount_value / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bundle Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                });
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Discount Type
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'fixed' | 'percentage' })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
              />
            </div>
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
              Active (visible on storefront)
            </label>
          </div>
        </div>
      </div>

      {/* Bundle Products */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Bundle Products</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Add Product
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddProduct(parseInt(e.target.value));
                e.target.value = '';
              }
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Select a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ₹{product.price.toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="space-y-3">
            {selectedProducts.map((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              
              return (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                >
                  {product?.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{product?.name}</p>
                    <p className="text-sm text-slate-500">
                      ₹{product?.price.toLocaleString('en-IN')} × {item.quantity} = ₹
                      {((product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(item.product_id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Original Price:</span>
                <span className="font-semibold text-slate-900">
                  ₹{totalOriginalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Discount ({formData.discount_type === 'percentage' ? `${formData.discount_value}%` : `₹${formData.discount_value}`}):
                </span>
                <span className="font-semibold text-red-600">
                  -₹{(totalOriginalPrice - discountedPrice).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">Bundle Price:</span>
                <span className="text-lg font-bold text-amber-600">
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">No products added yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 rounded-xl ${colors.primary} px-6 py-3 font-semibold text-white transition-colors ${colors.primaryHover} disabled:opacity-50`}
          disabled={loading}
        >
          {loading ? 'Saving...' : bundle ? 'Update Bundle' : 'Create Bundle'}
        </button>
      </div>
    </form>
  );
}
