'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Bundle {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  created_at: string;
}

interface BundlesClientProps {
  bundles: Bundle[];
}

export default function BundlesClient({ bundles: initialBundles }: BundlesClientProps) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const router = useRouter();

  const handleDelete = async (bundle: Bundle) => {
    if (!confirm(`Delete bundle "${bundle.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      // Refresh list
      const refreshRes = await fetch('/api/admin/bundles');
      const data = await refreshRes.json();
      setBundles(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Bundle>[] = [
    {
      key: 'name',
      label: 'Bundle',
      sortable: true,
      render: (bundle) => (
        <div>
          <p className="font-semibold text-slate-900">{bundle.name}</p>
          {bundle.description && (
            <p className="text-xs text-slate-500 line-clamp-1">{bundle.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (bundle) => (
        <div>
          <p className="font-semibold text-slate-900">
            ₹{Number(bundle.price).toLocaleString('en-IN')}
          </p>
          {bundle.compare_at_price && (
            <p className="text-xs text-slate-500 line-through">
              ₹{Number(bundle.compare_at_price).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (bundle) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            bundle.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {bundle.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (bundle) => (
        <span className="text-sm text-slate-600">
          {new Date(bundle.created_at).toLocaleDateString('en-IN', {
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
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/dashboard/bundles/new')}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Bundle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={bundles}
        keyExtractor={(bundle) => bundle.id.toString()}
        searchPlaceholder="Search bundles..."
        emptyMessage="No bundles yet. Create combo offers to increase sales."
        actions={(bundle) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/bundles/${bundle.id}`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(bundle)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
