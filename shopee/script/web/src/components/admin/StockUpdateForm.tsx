'use client';

import { useState } from 'react';
import FormModal from './FormModal';

interface InventoryItem {
  id: string;
  type: 'product' | 'variant';
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  stockQuantity: number | null;
  trackInventory: boolean;
}

interface StockUpdateFormProps {
  item: InventoryItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StockUpdateForm({ item, onSuccess, onCancel }: StockUpdateFormProps) {
  const [formData, setFormData] = useState({
    operation: 'set' as 'set' | 'add' | 'subtract',
    quantity: item.stockQuantity || 0,
    delta: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let newQuantity = formData.quantity;
      
      if (formData.operation === 'add') {
        newQuantity = (item.stockQuantity || 0) + formData.delta;
      } else if (formData.operation === 'subtract') {
        newQuantity = Math.max(0, (item.stockQuantity || 0) - formData.delta);
      }

      const table = item.type === 'product' ? 'products' : 'product_variants';
      const id = item.type === 'product' ? item.productId : item.variantId;

      const res = await fetch(`/api/admin/inventory/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            {
              table,
              id,
              stock_quantity: newQuantity,
            },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update stock');
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
      title="Update Stock Level"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-700">{item.name}</p>
          {item.sku && (
            <p className="text-xs font-mono text-slate-500 mt-1">{item.sku}</p>
          )}
          <p className="text-xs text-slate-600 mt-2">
            Current stock: <span className="font-semibold">{item.stockQuantity ?? 'Unlimited'}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Operation
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, operation: 'set' })}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                formData.operation === 'set'
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              Set To
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, operation: 'add' })}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                formData.operation === 'add'
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, operation: 'subtract' })}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                formData.operation === 'subtract'
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              Subtract
            </button>
          </div>
        </div>

        {formData.operation === 'set' ? (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              New Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Quantity to {formData.operation === 'add' ? 'Add' : 'Subtract'}
            </label>
            <input
              type="number"
              min="1"
              value={formData.delta}
              onChange={(e) => setFormData({ ...formData, delta: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              required
            />
            <p className="mt-2 text-xs text-slate-600">
              New stock will be:{' '}
              <span className="font-semibold">
                {formData.operation === 'add'
                  ? (item.stockQuantity || 0) + formData.delta
                  : Math.max(0, (item.stockQuantity || 0) - formData.delta)}
              </span>
            </p>
          </div>
        )}

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
            {loading ? 'Updating...' : 'Update Stock'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
