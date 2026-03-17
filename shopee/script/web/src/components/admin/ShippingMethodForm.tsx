'use client';

import { useState } from 'react';
import FormModal from './FormModal';

interface ShippingMethod {
  id?: number;
  name: string;
  description: string | null;
  base_fee: number;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  seller_id: number | null;
  is_active: boolean;
}

interface Seller {
  id: number;
  name: string;
}

interface ShippingMethodFormProps {
  method?: ShippingMethod;
  sellers: Seller[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ShippingMethodForm({ method, sellers, onSuccess, onCancel }: ShippingMethodFormProps) {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    description: method?.description || '',
    base_fee: method?.base_fee || 0,
    estimated_days_min: method?.estimated_days_min || null,
    estimated_days_max: method?.estimated_days_max || null,
    seller_id: method?.seller_id || null,
    is_active: method?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = method
        ? `/api/admin/shipping/methods/${method.id}`
        : '/api/admin/shipping/methods';
      
      const res = await fetch(url, {
        method: method ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
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
      title={method ? 'Edit Shipping Method' : 'Add Shipping Method'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Method Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., Standard Shipping, Express Delivery"
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
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="Brief description..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Base Fee (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.base_fee}
            onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Min Days
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimated_days_min || ''}
              onChange={(e) => setFormData({ ...formData, estimated_days_min: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="e.g., 3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Max Days
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimated_days_max || ''}
              onChange={(e) => setFormData({ ...formData, estimated_days_max: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="e.g., 5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Seller (optional)
          </label>
          <select
            value={formData.seller_id || ''}
            onChange={(e) => setFormData({ ...formData, seller_id: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Platform-wide (all sellers)</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Leave empty for platform-wide, or assign to specific seller
          </p>
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
            Active (available at checkout)
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
            {loading ? 'Saving...' : method ? 'Update Method' : 'Add Method'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
