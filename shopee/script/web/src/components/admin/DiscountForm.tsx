'use client';

import { useState } from 'react';
import FormModal from '@/components/admin/FormModal';

interface DiscountFormProps {
  discount?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DiscountForm({ discount, onSuccess, onCancel }: DiscountFormProps) {
  const [formData, setFormData] = useState({
    code: discount?.code || '',
    description: discount?.description || '',
    type: discount?.type || 'percentage',
    value: discount?.value || 0,
    min_order_amount: discount?.min_order_amount || 0,
    max_uses: discount?.max_uses || null,
    max_uses_per_user: discount?.max_uses_per_user || 1,
    starts_at: discount?.starts_at ? new Date(discount.starts_at).toISOString().slice(0, 16) : '',
    ends_at: discount?.ends_at ? new Date(discount.ends_at).toISOString().slice(0, 16) : '',
    is_active: discount?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = discount
        ? `/api/admin/discounts/${discount.id}`
        : '/api/admin/discounts';
      
      const method = discount ? 'PUT' : 'POST';

      // Convert empty strings to null for optional fields
      const payload = {
        ...formData,
        min_order_amount: formData.min_order_amount || 0,
        max_uses: formData.max_uses || null,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save discount');
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
      title={discount ? 'Edit Discount' : 'Create Discount'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Discount Code *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-slate-900 uppercase focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="SAVE10"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., 10% off on all orders"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Value *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder={formData.type === 'percentage' ? '10' : '100'}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              {formData.type === 'percentage' ? 'Percentage (0-100)' : 'Amount in ₹'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Minimum Order Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.min_order_amount}
            onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Max Total Uses
            </label>
            <input
              type="number"
              value={formData.max_uses || ''}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Max Uses Per User
            </label>
            <input
              type="number"
              value={formData.max_uses_per_user}
              onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              min="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Starts At
            </label>
            <input
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ends At
            </label>
            <input
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            Active (customers can use this code)
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
            {loading ? 'Saving...' : discount ? 'Update Discount' : 'Create Discount'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
