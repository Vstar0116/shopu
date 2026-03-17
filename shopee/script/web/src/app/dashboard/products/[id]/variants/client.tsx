'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import VariantForm from '@/components/admin/VariantForm';
import { colors } from '@/lib/uiConfig';

interface Variant {
  id: number;
  product_id: number;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
}

interface ProductVariantsClientProps {
  productId: number;
  variants: Variant[];
}

export default function ProductVariantsClient({
  productId,
  variants: initialVariants,
}: ProductVariantsClientProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const refreshVariants = async () => {
    const res = await fetch(`/api/admin/product-variants?product_id=${productId}`);
    const data = await res.json();
    setVariants(data);
  };

  const handleCreate = () => {
    setEditingVariant(null);
    setShowForm(true);
  };

  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    setShowForm(true);
  };

  const handleDelete = async (variant: Variant) => {
    if (!confirm(`Delete variant "${variant.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/product-variants/${variant.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      await refreshVariants();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingVariant(null);
    await refreshVariants();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVariant(null);
  };

  const columns: Column<Variant>[] = [
    {
      key: 'title',
      label: 'Variant',
      sortable: true,
      render: (variant) => (
        <div>
          <p className="font-semibold text-slate-900">{variant.title}</p>
          {variant.sku && (
            <p className="text-xs font-mono text-slate-500">{variant.sku}</p>
          )}
        </div>
      ),
    },
    {
      key: 'attributes',
      label: 'Attributes',
      render: (variant) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(variant.attributes || {}).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
            >
              {key}: {value}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (variant) => (
        <div>
          <p className="font-semibold text-slate-900">
            ₹{Number(variant.price).toLocaleString('en-IN')}
          </p>
          {variant.compare_at_price && (
            <p className="text-xs text-slate-500 line-through">
              ₹{Number(variant.compare_at_price).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stock_quantity',
      label: 'Stock',
      sortable: true,
      render: (variant) => {
        if (variant.stock_quantity === null) {
          return <span className="text-sm text-slate-500">Unlimited</span>;
        }
        
        const isLowStock = variant.stock_quantity < 10;
        const isOutOfStock = variant.stock_quantity === 0;
        
        return (
          <span
            className={`font-semibold ${
              isOutOfStock
                ? 'text-red-600'
                : isLowStock
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {variant.stock_quantity}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (variant) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            variant.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {variant.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Configure size, color, and other options for this product
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Variant
        </button>
      </div>

      <DataTable
        columns={columns}
        data={variants}
        keyExtractor={(variant) => variant.id.toString()}
        searchPlaceholder="Search variants..."
        emptyMessage="No variants yet. Add variants to offer different options like sizes or colors."
        actions={(variant) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(variant)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(variant)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <VariantForm
          productId={productId}
          variant={editingVariant || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
