'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Application {
  id: number;
  discount_amount: number;
  applied_at: string;
  orders?: {
    order_number: string;
    total_amount: number;
    created_at: string;
    profiles?: {
      full_name: string | null;
    };
  };
}

interface DiscountAnalyticsClientProps {
  discount: any;
  applications: Application[];
}

export default function DiscountAnalyticsClient({ discount, applications }: DiscountAnalyticsClientProps) {
  const totalUsage = applications.length;
  const totalRevenue = applications.reduce((sum, app) => sum + (app.orders?.total_amount || 0), 0);
  const totalDiscount = applications.reduce((sum, app) => sum + app.discount_amount, 0);

  const columns: Column<Application>[] = [
    {
      key: 'orders',
      label: 'Order',
      render: (app) => (
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">
            {app.orders?.order_number}
          </p>
          <p className="text-xs text-slate-500">
            {app.orders?.profiles?.full_name || 'Guest'}
          </p>
        </div>
      ),
    },
    {
      key: 'discount_amount',
      label: 'Discount',
      render: (app) => (
        <span className="font-semibold text-red-600">
          -₹{app.discount_amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Order Total',
      render: (app) => (
        <span className="font-semibold text-slate-900">
          ₹{(app.orders?.total_amount || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'applied_at',
      label: 'Date',
      sortable: true,
      render: (app) => (
        <span className="text-sm text-slate-600">
          {new Date(app.applied_at).toLocaleDateString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Total Usage</p>
          <p className="text-2xl font-bold text-slate-900">{totalUsage}</p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Total Discount Given</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{totalDiscount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Revenue Generated</p>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Usage History</h2>
        
        <DataTable
          columns={columns}
          data={applications}
          keyExtractor={(app) => app.id.toString()}
          searchPlaceholder="Search applications..."
          emptyMessage="This discount hasn't been used yet"
        />
      </div>
    </div>
  );
}
