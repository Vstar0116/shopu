'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import { colors } from '@/lib/uiConfig';

interface ProductType {
  id: number;
  name: string;
  description: string | null;
}

interface ProductTypesClientProps {
  productTypes: ProductType[];
}

export default function ProductTypesClient({ productTypes: initialTypes }: ProductTypesClientProps) {
  const [types, setTypes] = useState<ProductType[]>(initialTypes);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const refreshTypes = async () => {
    const res = await fetch('/api/admin/product-types');
    const data = await res.json();
    setTypes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editing
        ? `/api/admin/product-types/${editing.id}`
        : '/api/admin/product-types';

      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', description: '' });
      await refreshTypes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: ProductType) => {
    if (!confirm(`Delete "${type.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/product-types/${type.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await refreshTypes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<ProductType>[] = [
    {
      key: 'name',
      label: 'Type Name',
      sortable: true,
      render: (type) => (
        <div>
          <p className="font-semibold text-slate-900">{type.name}</p>
          {type.description && (
            <p className="text-xs text-slate-500">{type.description}</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ name: '', description: '' });
            setShowForm(true);
          }}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Type
        </button>
      </div>

      <DataTable
        columns={columns}
        data={types}
        keyExtractor={(type) => type.id.toString()}
        searchPlaceholder="Search types..."
        emptyMessage="No product types yet"
        actions={(type) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing(type);
                setFormData({ name: type.name, description: type.description || '' });
                setShowForm(true);
              }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(type)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <FormModal
          isOpen={true}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? 'Edit Product Type' : 'Add Product Type'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
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
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
}
