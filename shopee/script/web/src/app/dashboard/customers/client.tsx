'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';

interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  orderCount: number;
  totalSpent: number;
  created_at: string;
}

interface CustomersClientProps {
  customers: Customer[];
}

export default function CustomersClient({ customers: initialCustomers }: CustomersClientProps) {
  const router = useRouter();
  const [customers] = useState<Customer[]>(initialCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(initialCustomers);

  const filters: FilterConfig[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'seller_admin', label: 'Seller Admin' },
        { value: 'platform_admin', label: 'Platform Admin' },
      ],
    },
    {
      key: 'registration_date',
      label: 'Registration Date',
      type: 'date-range',
    },
  ];

  const handleFilterChange = (activeFilters: Record<string, any>) => {
    let filtered = [...customers];

    if (activeFilters.role) {
      filtered = filtered.filter((customer) => customer.role === activeFilters.role);
    }

    if (activeFilters.registration_date?.from) {
      filtered = filtered.filter(
        (customer) => new Date(customer.created_at) >= new Date(activeFilters.registration_date.from)
      );
    }
    if (activeFilters.registration_date?.to) {
      filtered = filtered.filter(
        (customer) => new Date(customer.created_at) <= new Date(activeFilters.registration_date.to)
      );
    }

    setFilteredCustomers(filtered);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (customer) => (
        <span className="font-semibold text-slate-900">
          {customer.full_name || 'Unnamed'}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (customer) => (
        <span className="text-sm text-slate-600">
          {customer.email || 'N/A'}
        </span>
      ),
    },
    {
      key: 'orderCount',
      label: 'Orders',
      sortable: true,
      render: (customer) => (
        <span className="font-medium text-slate-900">
          {customer.orderCount}
        </span>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (customer) => (
        <span className="font-medium text-slate-900">
          ₹{customer.totalSpent.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (customer) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            customer.role === 'platform_admin'
              ? 'bg-purple-50 text-purple-700'
              : customer.role === 'seller_admin'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {customer.role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (customer) => (
        <span className="text-sm text-slate-600">
          {new Date(customer.created_at).toLocaleDateString('en-IN', {
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
        onClear={() => setFilteredCustomers(customers)}
      />

      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(customer) => customer.id}
        searchPlaceholder="Search customers by name..."
        emptyMessage="No customers found"
        onRowClick={(customer) => router.push(`/dashboard/customers/${customer.id}`)}
      />
    </div>
  );
}
