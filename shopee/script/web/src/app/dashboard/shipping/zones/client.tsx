'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface ShippingZone {
  id: number;
  name: string;
  type: 'postal_list' | 'radius' | 'polygon';
  config: any;
  is_active: boolean;
}

interface ShippingZonesClientProps {
  zones: ShippingZone[];
}

export default function ShippingZonesClient({ zones: initialZones }: ShippingZonesClientProps) {
  const [zones, setZones] = useState<ShippingZone[]>(initialZones);
  const router = useRouter();

  const handleDelete = async (zone: ShippingZone) => {
    if (!confirm(`Delete zone "${zone.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping/zones/${zone.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const refreshRes = await fetch('/api/admin/shipping/zones');
      const data = await refreshRes.json();
      setZones(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<ShippingZone>[] = [
    {
      key: 'name',
      label: 'Zone Name',
      sortable: true,
      render: (zone) => <span className="font-semibold text-slate-900">{zone.name}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (zone) => (
        <span className="text-sm text-slate-600 capitalize">
          {zone.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (zone) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            zone.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {zone.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/dashboard/shipping/zones/new')}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Zone
        </button>
      </div>

      <DataTable
        columns={columns}
        data={zones}
        keyExtractor={(zone) => zone.id.toString()}
        searchPlaceholder="Search zones..."
        emptyMessage="No shipping zones configured."
        actions={(zone) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/shipping/zones/${zone.id}`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(zone)}
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
