'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders: initialOrders }: OrdersClientProps) {
  const router = useRouter();
  const [orders] = useState<Order[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders);

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Order Status',
      type: 'multiselect',
      options: [
        { value: 'pending_payment', label: 'Pending Payment' },
        { value: 'processing', label: 'Processing' },
        { value: 'artwork_in_progress', label: 'Artwork In Progress' },
        { value: 'awaiting_customer_approval', label: 'Awaiting Approval' },
        { value: 'ready_to_ship', label: 'Ready to Ship' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
    {
      key: 'date',
      label: 'Order Date',
      type: 'date-range',
    },
    {
      key: 'amount',
      label: 'Order Amount (₹)',
      type: 'number-range',
    },
  ];

  const handleFilterChange = (activeFilters: Record<string, any>) => {
    let filtered = [...orders];

    // Status filter (multiselect)
    if (activeFilters.status && activeFilters.status.length > 0) {
      filtered = filtered.filter((order) =>
        activeFilters.status.includes(order.status)
      );
    }

    // Payment status filter
    if (activeFilters.payment_status) {
      filtered = filtered.filter(
        (order) => order.payment_status === activeFilters.payment_status
      );
    }

    // Date range filter
    if (activeFilters.date?.from) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= new Date(activeFilters.date.from)
      );
    }
    if (activeFilters.date?.to) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) <= new Date(activeFilters.date.to)
      );
    }

    // Amount range filter
    if (activeFilters.amount?.min) {
      filtered = filtered.filter(
        (order) => order.total_amount >= parseFloat(activeFilters.amount.min)
      );
    }
    if (activeFilters.amount?.max) {
      filtered = filtered.filter(
        (order) => order.total_amount <= parseFloat(activeFilters.amount.max)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleClearFilters = () => {
    setFilteredOrders(orders);
  };

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-50 text-yellow-700',
    processing: 'bg-blue-50 text-blue-700',
    artwork_in_progress: 'bg-purple-50 text-purple-700',
    awaiting_customer_approval: 'bg-orange-50 text-orange-700',
    ready_to_ship: 'bg-indigo-50 text-indigo-700',
    shipped: 'bg-cyan-50 text-cyan-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
    refunded: 'bg-slate-50 text-slate-700',
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true,
      render: (order) => (
        <span className="font-mono font-semibold text-slate-900">
          {order.order_number}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => (
        <span className="text-slate-700">
          {order.profiles?.full_name || 'Guest'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusColors[order.status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {order.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (order) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            order.payment_status === 'paid'
              ? 'bg-emerald-50 text-emerald-700'
              : order.payment_status === 'failed'
              ? 'bg-red-50 text-red-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
        </span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-slate-900">
          ₹{order.total_amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (order) => (
        <span className="text-sm text-slate-600">
          {new Date(order.created_at).toLocaleDateString('en-IN', {
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
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={filteredOrders}
        keyExtractor={(order) => order.id.toString()}
        searchPlaceholder="Search orders by number or customer..."
        emptyMessage="No orders found"
        onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
      />
    </div>
  );
}
