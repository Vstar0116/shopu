'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';

interface Address {
  id: number;
  address_type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

interface AddressesClientProps {
  addresses: Address[];
  customerId: string;
}

export default function AddressesClient({ addresses: initialAddresses, customerId }: AddressesClientProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  const handleDelete = async (address: Address) => {
    if (!confirm('Delete this address?')) return;

    try {
      const res = await fetch(`/api/admin/addresses/${address.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const refreshRes = await fetch(`/api/admin/addresses?profile_id=${customerId}`);
      const data = await refreshRes.json();
      setAddresses(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Address>[] = [
    {
      key: 'address_type',
      label: 'Type',
      render: (address) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            address.address_type === 'shipping'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700'
          }`}
        >
          {address.address_type}
        </span>
      ),
    },
    {
      key: 'full_name',
      label: 'Contact',
      sortable: true,
      render: (address) => (
        <div>
          <p className="font-semibold text-slate-900">{address.full_name}</p>
          <p className="text-xs text-slate-500">{address.phone}</p>
        </div>
      ),
    },
    {
      key: 'address_line1',
      label: 'Address',
      render: (address) => (
        <div className="text-sm text-slate-700">
          <p>{address.address_line1}</p>
          {address.address_line2 && <p>{address.address_line2}</p>}
          <p>
            {address.city}, {address.state} {address.zip_code}
          </p>
        </div>
      ),
    },
    {
      key: 'is_default',
      label: 'Default',
      render: (address) =>
        address.is_default ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Default
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={addresses}
      keyExtractor={(address) => address.id.toString()}
      searchPlaceholder="Search addresses..."
      emptyMessage="No saved addresses"
      actions={(address) => (
        <button
          onClick={() => handleDelete(address)}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Delete
        </button>
      )}
    />
  );
}
