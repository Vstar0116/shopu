'use client';

import { useState } from 'react';
import FormModal from '@/components/admin/FormModal';

interface CategoryFormProps {
  category?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save category');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={category ? 'Edit Category' : 'Create Category'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={generateSlug}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            URL-friendly version (auto-generated)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <p className="mt-1 text-xs text-slate-500">
            Lower numbers appear first
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
            Active (visible to customers)
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
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
