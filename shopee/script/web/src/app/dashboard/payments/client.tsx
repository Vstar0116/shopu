'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Payment {
  id: number;
  order_id: number;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'succeeded' | 'failed';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  orders?: {
    order_number: string;
    profiles?: {
      full_name: string | null;
    };
  };
}

interface PaymentsClientProps {
  payments: Payment[];
}

export default function PaymentsClient({ payments: initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'failed' | 'created'>('all');

  const filteredPayments = payments.filter((p) => 
    filter === 'all' ? true : p.status === filter
  );

  const handleRefund = async (payment: Payment) => {
    if (!confirm(`Initiate refund for ₹${payment.amount}?`)) return;

    try {
      const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Refund failed');

      alert('Refund initiated successfully');
      const refreshRes = await fetch('/api/admin/payments');
      const data = await refreshRes.json();
      setPayments(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'order_id',
      label: 'Order',
      render: (payment) => (
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">
            {payment.orders?.order_number}
          </p>
          <p className="text-xs text-slate-500">
            {payment.orders?.profiles?.full_name}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (payment) => (
        <span className="font-semibold text-slate-900">
          ₹{Number(payment.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (payment) => {
        const statusStyles = {
          created: 'bg-blue-50 text-blue-700',
          attempted: 'bg-yellow-50 text-yellow-700',
          succeeded: 'bg-emerald-50 text-emerald-700',
          failed: 'bg-red-50 text-red-700',
        };

        return (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[payment.status]}`}>
            {payment.status}
          </span>
        );
      },
    },
    {
      key: 'razorpay_payment_id',
      label: 'Payment ID',
      render: (payment) => (
        <span className="font-mono text-xs text-slate-600">
          {payment.razorpay_payment_id || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (payment) => (
        <span className="text-sm text-slate-600">
          {new Date(payment.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  const succeededCount = payments.filter(p => p.status === 'succeeded').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;
  const totalAmount = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900">
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Successful</p>
          <p className="text-2xl font-bold text-emerald-600">{succeededCount}</p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'succeeded', 'failed', 'created'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === status
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        keyExtractor={(payment) => payment.id.toString()}
        searchPlaceholder="Search payments..."
        emptyMessage="No payment transactions found"
        actions={(payment) => (
          payment.status === 'succeeded' && (
            <button
              onClick={() => handleRefund(payment)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Refund
            </button>
          )
        )}
      />
    </div>
  );
}
