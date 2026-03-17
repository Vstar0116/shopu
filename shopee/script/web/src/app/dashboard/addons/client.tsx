'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import AddonForm from '@/components/admin/AddonForm';
import { colors } from '@/lib/uiConfig';

interface Addon {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_required: boolean;
  max_quantity: number | null;
  is_active: boolean;
}

interface AddonsClientProps {
  addons: Addon[];
}

export default function AddonsClient({ addons: initialAddons }: AddonsClientProps) {
  const [addons, setAddons] = useState<Addon[]>(initialAddons);
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  const refreshAddons = async () => {
    const res = await fetch('/api/admin/addons');
    const data = await res.json();
    setAddons(data);
  };

  const handleCreate = () => {
    setEditingAddon(null);
    setShowForm(true);
  };

  const handleEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setShowForm(true);
  };

  const handleDelete = async (addon: Addon) => {
    if (!confirm(`Delete add-on "${addon.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      await refreshAddons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingAddon(null);
    await refreshAddons();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddon(null);
  };

  const columns: Column<Addon>[] = [
    {
      key: 'name',
      label: 'Add-on',
      sortable: true,
      render: (addon) => (
        <div>
          <p className="font-semibold text-slate-900">{addon.name}</p>
          {addon.description && (
            <p className="text-xs text-slate-500 line-clamp-1">{addon.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (addon) => (
        <span className="font-semibold text-slate-900">
          ₹{Number(addon.price).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'is_required',
      label: 'Type',
      render: (addon) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            addon.is_required
              ? 'bg-purple-50 text-purple-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {addon.is_required ? 'Required' : 'Optional'}
        </span>
      ),
    },
    {
      key: 'max_quantity',
      label: 'Max Qty',
      render: (addon) => (
        <span className="text-sm text-slate-600">
          {addon.max_quantity || 'Unlimited'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (addon) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            addon.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {addon.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Add-on
        </button>
      </div>

      <DataTable
        columns={columns}
        data={addons}
        keyExtractor={(addon) => addon.id.toString()}
        searchPlaceholder="Search add-ons..."
        emptyMessage="No add-ons yet. Create add-ons to offer extra services or products."
        actions={(addon) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(addon)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(addon)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <AddonForm
          addon={editingAddon || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
