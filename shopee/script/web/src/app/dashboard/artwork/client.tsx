'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface ArtworkApproval {
  id: number;
  status: 'pending' | 'approved' | 'changes_requested';
  designer_notes: string | null;
  customer_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

interface Artwork {
  id: number;
  order_id: number;
  order_item_id: number;
  file_url: string;
  version: number;
  uploaded_at: string;
  orders?: {
    order_number: string;
    profiles?: {
      full_name: string | null;
    }[];
  }[];
  artwork_approvals?: ArtworkApproval[];
}

interface ArtworkClientProps {
  artworks: Artwork[];
}

export default function ArtworkClient({ artworks: initialArtworks }: ArtworkClientProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'changes_requested'>('all');
  const router = useRouter();

  const getLatestApproval = (artwork: Artwork): ArtworkApproval | null => {
    if (!artwork.artwork_approvals || artwork.artwork_approvals.length === 0) {
      return null;
    }
    return artwork.artwork_approvals[artwork.artwork_approvals.length - 1];
  };

  const filteredArtworks = artworks.filter((artwork) => {
    if (filter === 'all') return true;
    const approval = getLatestApproval(artwork);
    if (!approval) return filter === 'pending';
    return approval.status === filter;
  });

  const columns: Column<Artwork>[] = [
    {
      key: 'file_url',
      label: 'Preview',
      render: (artwork) => (
        <img
          src={artwork.file_url}
          alt={`Artwork v${artwork.version}`}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'order_id',
      label: 'Order',
      render: (artwork) => {
        const order = artwork.orders?.[0];
        const customer = order?.profiles?.[0];
        
        return (
          <div>
            <p className="font-mono text-sm font-semibold text-slate-900">
              {order?.order_number || 'Unknown'}
            </p>
            <p className="text-xs text-slate-500">
              {customer?.full_name || 'Unknown'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (artwork) => (
        <span className="text-sm font-medium text-slate-900">v{artwork.version}</span>
      ),
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      sortable: true,
      render: (artwork) => (
        <span className="text-sm text-slate-600">
          {new Date(artwork.uploaded_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (artwork) => {
        const approval = getLatestApproval(artwork);
        const status = approval?.status || 'pending';
        
        const statusStyles = {
          pending: 'bg-yellow-50 text-yellow-700',
          approved: 'bg-emerald-50 text-emerald-700',
          changes_requested: 'bg-red-50 text-red-700',
        };

        const statusLabels = {
          pending: 'Pending Review',
          approved: 'Approved',
          changes_requested: 'Changes Requested',
        };

        return (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
        );
      },
    },
  ];

  // Stats
  const pendingCount = artworks.filter(a => !getLatestApproval(a) || getLatestApproval(a)?.status === 'pending').length;
  const approvedCount = artworks.filter(a => getLatestApproval(a)?.status === 'approved').length;
  const changesRequestedCount = artworks.filter(a => getLatestApproval(a)?.status === 'changes_requested').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-600 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Changes Requested</p>
              <p className="text-2xl font-bold text-slate-900">{changesRequestedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({artworks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'approved'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('changes_requested')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'changes_requested'
              ? 'bg-red-100 text-red-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Changes Requested ({changesRequestedCount})
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredArtworks}
        keyExtractor={(artwork) => artwork.id.toString()}
        searchPlaceholder="Search artworks..."
        emptyMessage="No artworks found"
        actions={(artwork) => (
          <button
            onClick={() => router.push(`/dashboard/artwork/${artwork.id}`)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Review
          </button>
        )}
      />
    </div>
  );
}
