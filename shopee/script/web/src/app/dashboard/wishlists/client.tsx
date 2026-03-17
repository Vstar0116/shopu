'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';

interface Wishlist {
  id: number;
  profile_id: string;
  name: string;
  is_public: boolean;
  updated_at: string;
  profiles?: {
    full_name: string | null;
  };
  wishlist_items?: Array<{
    id: number;
    products?: {
      name: string;
    };
  }>;
}

interface WishlistsClientProps {
  wishlists: Wishlist[];
}

export default function WishlistsClient({ wishlists }: WishlistsClientProps) {
  const columns: Column<Wishlist>[] = [
    {
      key: 'name',
      label: 'Wishlist',
      sortable: true,
      render: (wishlist) => <span className="font-semibold text-slate-900">{wishlist.name}</span>,
    },
    {
      key: 'profile_id',
      label: 'Customer',
      render: (wishlist) => (
        <span className="text-sm text-slate-600">
          {wishlist.profiles?.full_name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (wishlist) => (
        <span className="text-sm font-medium text-slate-900">
          {wishlist.wishlist_items?.length || 0}
        </span>
      ),
    },
    {
      key: 'is_public',
      label: 'Visibility',
      render: (wishlist) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            wishlist.is_public
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {wishlist.is_public ? 'Public' : 'Private'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      render: (wishlist) => (
        <span className="text-sm text-slate-600">
          {new Date(wishlist.updated_at).toLocaleDateString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={wishlists}
      keyExtractor={(wishlist) => wishlist.id.toString()}
      searchPlaceholder="Search wishlists..."
      emptyMessage="No wishlists found"
    />
  );
}
