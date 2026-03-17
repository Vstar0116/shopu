'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ShippingMethodForm from '@/components/admin/ShippingMethodForm';
import { colors } from '@/lib/uiConfig';

interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  base_fee: number;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  seller_id: number | null;
  is_active: boolean;
  sellers?: {
    name: string;
  };
}

interface Seller {
  id: number;
  name: string;
}

interface ShippingMethodsClientProps {
  shippingMethods: ShippingMethod[];
  sellers: Seller[];
}

export default function ShippingMethodsClient({ 
  shippingMethods: initialMethods,
  sellers 
}: ShippingMethodsClientProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>(initialMethods);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);

  const refreshMethods = async () => {
    const res = await fetch('/api/admin/shipping/methods');
    const data = await res.json();
    setMethods(data);
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (method: ShippingMethod) => {
    if (!confirm(`Delete shipping method "${method.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping/methods/${method.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      await refreshMethods();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<ShippingMethod>[] = [
    {
      key: 'name',
      label: 'Method',
      sortable: true,
      render: (method) => (
        <div>
          <p className="font-semibold text-slate-900">{method.name}</p>
          {method.description && (
            <p className="text-xs text-slate-500 line-clamp-1">{method.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'base_fee',
      label: 'Base Fee',
      sortable: true,
      render: (method) => (
        <span className="font-semibold text-slate-900">
          ₹{Number(method.base_fee).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'estimated_days',
      label: 'Delivery Time',
      render: (method) => {
        if (!method.estimated_days_min && !method.estimated_days_max) {
          return <span className="text-sm text-slate-500">Not specified</span>;
        }
        if (method.estimated_days_min === method.estimated_days_max) {
          return <span className="text-sm text-slate-600">{method.estimated_days_min} days</span>;
        }
        return (
          <span className="text-sm text-slate-600">
            {method.estimated_days_min}-{method.estimated_days_max} days
          </span>
        );
      },
    },
    {
      key: 'seller_id',
      label: 'Seller',
      render: (method) => (
        <span className="text-sm text-slate-600">
          {method.sellers?.name || 'Platform-wide'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (method) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            method.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {method.is_active ? 'Active' : 'Inactive'}
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
          Add Shipping Method
        </button>
      </div>

      <DataTable
        columns={columns}
        data={methods}
        keyExtractor={(method) => method.id.toString()}
        searchPlaceholder="Search shipping methods..."
        emptyMessage="No shipping methods configured yet."
        actions={(method) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(method)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(method)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <ShippingMethodForm
          method={editingMethod || undefined}
          sellers={sellers}
          onSuccess={async () => {
            setShowForm(false);
            setEditingMethod(null);
            await refreshMethods();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingMethod(null);
          }}
        />
      )}
    </div>
  );
}
