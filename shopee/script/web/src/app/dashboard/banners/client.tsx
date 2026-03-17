'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string | null;
  cta_text: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
}

interface BannersClientProps {
  banners: Banner[];
}

export default function BannersClient({ banners: initialBanners }: BannersClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const refreshRes = await fetch('/api/admin/banners');
      const data = await refreshRes.json();
      setBanners(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Banner>[] = [
    {
      key: 'image_url',
      label: 'Preview',
      render: (banner) => (
        <img
          src={banner.image_url}
          alt={banner.title}
          className="h-16 w-32 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (banner) => (
        <div>
          <p className="font-semibold text-slate-900">{banner.title}</p>
          {banner.cta_text && (
            <p className="text-xs text-slate-500">CTA: {banner.cta_text}</p>
          )}
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Schedule',
      render: (banner) => {
        if (!banner.start_date && !banner.end_date) {
          return <span className="text-sm text-slate-500">Always active</span>;
        }

        return (
          <div className="text-xs text-slate-600">
            {banner.start_date && (
              <p>From: {new Date(banner.start_date).toLocaleDateString('en-IN')}</p>
            )}
            {banner.end_date && (
              <p>To: {new Date(banner.end_date).toLocaleDateString('en-IN')}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (banner) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            banner.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {banner.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => alert('Banner form not yet implemented')}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        keyExtractor={(banner) => banner.id.toString()}
        searchPlaceholder="Search banners..."
        emptyMessage="No banners configured yet"
        actions={(banner) => (
          <button
            onClick={() => handleDelete(banner)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      />
    </div>
  );
}
