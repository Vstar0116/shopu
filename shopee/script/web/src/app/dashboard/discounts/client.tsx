'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { colors } from '@/lib/uiConfig';

interface Discount {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  usage_count: number;
  max_uses: number | null;
}

interface DiscountsClientProps {
  discounts: Discount[];
}

export default function DiscountsClient({ discounts: initialDiscounts }: DiscountsClientProps) {
  const [discounts] = useState<Discount[]>(initialDiscounts);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>(initialDiscounts);

  const filters: FilterConfig[] = [
    {
      key: 'is_active',
      label: 'Status',
      type: 'boolean',
    },
    {
      key: 'type',
      label: 'Discount Type',
      type: 'select',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed_amount', label: 'Fixed Amount' },
      ],
    },
    {
      key: 'valid_date',
      label: 'Valid Period',
      type: 'date-range',
    },
    {
      key: 'usage',
      label: 'Usage Count',
      type: 'number-range',
    },
  ];

  const handleFilterChange = (activeFilters: Record<string, any>) => {
    let filtered = [...discounts];

    if (activeFilters.is_active) {
      filtered = filtered.filter(
        (discount) => discount.is_active === (activeFilters.is_active === 'true')
      );
    }

    if (activeFilters.type) {
      filtered = filtered.filter((discount) => discount.type === activeFilters.type);
    }

    if (activeFilters.valid_date?.from) {
      filtered = filtered.filter((discount) => {
        if (!discount.valid_from) return true;
        return new Date(discount.valid_from) >= new Date(activeFilters.valid_date.from);
      });
    }
    if (activeFilters.valid_date?.to) {
      filtered = filtered.filter((discount) => {
        if (!discount.valid_until) return true;
        return new Date(discount.valid_until) <= new Date(activeFilters.valid_date.to);
      });
    }

    if (activeFilters.usage?.min) {
      filtered = filtered.filter(
        (discount) => discount.usage_count >= parseFloat(activeFilters.usage.min)
      );
    }
    if (activeFilters.usage?.max) {
      filtered = filtered.filter(
        (discount) => discount.usage_count <= parseFloat(activeFilters.usage.max)
      );
    }

    setFilteredDiscounts(filtered);
  };

  const columns: Column<Discount>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (discount) => (
        <span className="font-mono font-semibold text-slate-900">{discount.code}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (discount) => (
        <span className="text-sm text-slate-600">
          {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
        </span>
      ),
    },
    {
      key: 'usage_count',
      label: 'Usage',
      sortable: true,
      render: (discount) => (
        <span className="text-sm text-slate-900">
          {discount.usage_count}
          {discount.max_uses && ` / ${discount.max_uses}`}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (discount) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            discount.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {discount.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={() => setFilteredDiscounts(discounts)}
      />

      <DataTable
        columns={columns}
        data={filteredDiscounts}
        keyExtractor={(discount) => discount.id.toString()}
        searchPlaceholder="Search discounts by code..."
        emptyMessage="No discounts found"
      />
    </div>
  );
}
