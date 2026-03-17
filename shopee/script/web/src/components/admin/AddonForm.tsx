'use client';

import { useState } from 'react';
import FormModal from './FormModal';

interface Addon {
  id?: number;
  name: string;
  description: string | null;
  price: number;
  is_required: boolean;
  max_quantity: number | null;
  is_active: boolean;
}

interface AddonFormProps {
  addon?: Addon;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddonForm({ addon, onSuccess, onCancel }: AddonFormProps) {
  const [formData, setFormData] = useState({
    name: addon?.name || '',
    description: addon?.description || '',
    price: addon?.price || 0,
    is_required: addon?.is_required ?? false,
    max_quantity: addon?.max_quantity || null,
    is_active: addon?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = addon
        ? `/api/admin/addons/${addon.id}`
        : '/api/admin/addons';
      
      const method = addon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save add-on');
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
      title={addon ? 'Edit Add-on' : 'Create Add-on'}
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
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., Gift Wrapping, Express Delivery"
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
            placeholder="Describe this add-on..."
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
              Max Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_quantity || ''}
              onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required}
              onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_required" className="text-sm font-medium text-slate-700">
              Required (must be added to cart)
            </label>
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
              Active (visible to customers)
            </label>
          </div>
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
            {loading ? 'Saving...' : addon ? 'Update Add-on' : 'Create Add-on'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
