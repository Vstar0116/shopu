'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import SellerForm from '@/components/admin/SellerForm';
import { colors } from '@/lib/uiConfig';

interface SellersClientProps {
  sellers: any[];
}

export default function SellersClient({ sellers: initialSellers }: SellersClientProps) {
  const [sellers, setSellers] = useState(initialSellers);
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<any>(null);

  const refreshSellers = async () => {
    const res = await fetch('/api/admin/sellers');
    const data = await res.json();
    setSellers(data);
  };

  const handleCreate = () => {
    setEditingSeller(null);
    setShowForm(true);
  };

  const handleEdit = (seller: any) => {
    setEditingSeller(seller);
    setShowForm(true);
  };

  const handleDelete = async (seller: any) => {
    if (!confirm(`Delete seller "${seller.name}"? This will also affect all products from this seller.`)) return;

    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      await refreshSellers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingSeller(null);
    await refreshSellers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSeller(null);
  };
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Seller',
      sortable: true,
      render: (seller) => (
        <div>
          <p className="font-semibold text-slate-900">{seller.name}</p>
          <p className="text-xs text-slate-500">{seller.slug}</p>
        </div>
      ),
    },
    {
      key: 'contact_email',
      label: 'Contact',
      render: (seller) => (
        <div>
          {seller.contact_email && (
            <p className="text-sm text-slate-700">{seller.contact_email}</p>
          )}
          {seller.contact_phone && (
            <p className="text-xs text-slate-500">{seller.contact_phone}</p>
          )}
          {!seller.contact_email && !seller.contact_phone && (
            <span className="text-sm text-slate-500">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      render: (seller) => (
        <span className="text-sm text-slate-700">
          {seller.city ? `${seller.city}, ${seller.state || ''}` : '—'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (seller) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            seller.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {seller.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (seller) => (
        <span className="text-sm text-slate-600">
          {new Date(seller.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sellers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage seller accounts and their access to the platform.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Seller
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sellers}
        keyExtractor={(seller) => seller.id}
        searchPlaceholder="Search sellers..."
        emptyMessage="No sellers found."
        actions={(seller) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(seller)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(seller)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <SellerForm
          seller={editingSeller}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
