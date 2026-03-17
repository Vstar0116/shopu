'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';
import { colors } from '@/lib/uiConfig';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock_quantity: number | null;
  is_active: boolean;
  created_at: string;
  image_url: string | null;
  categories?: {
    name: string;
  };
  sellers?: {
    business_name: string;
  };
}

interface ProductsClientProps {
  products: Product[];
  categories: Array<{ id: number; name: string }>;
}

export default function ProductsClient({ products: initialProducts, categories }: ProductsClientProps) {
  const router = useRouter();
  const [products] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  const filters: FilterConfig[] = [
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })),
    },
    {
      key: 'stock',
      label: 'Stock Status',
      type: 'select',
      options: [
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock (<10)' },
        { value: 'out_of_stock', label: 'Out of Stock' },
        { value: 'unlimited', label: 'Unlimited' },
      ],
    },
    {
      key: 'price',
      label: 'Price Range (₹)',
      type: 'number-range',
    },
    {
      key: 'date',
      label: 'Created Date',
      type: 'date-range',
    },
  ];

  const handleFilterChange = (activeFilters: Record<string, any>) => {
    let filtered = [...products];

    // Active/Inactive filter
    if (activeFilters.is_active) {
      filtered = filtered.filter(
        (product) => product.is_active === (activeFilters.is_active === 'true')
      );
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter(
        (product) => product.categories?.name === activeFilters.category
      );
    }

    // Stock status filter
    if (activeFilters.stock) {
      filtered = filtered.filter((product) => {
        if (activeFilters.stock === 'unlimited') {
          return product.stock_quantity === null;
        }
        if (activeFilters.stock === 'out_of_stock') {
          return product.stock_quantity !== null && product.stock_quantity === 0;
        }
        if (activeFilters.stock === 'low_stock') {
          return product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity < 10;
        }
        if (activeFilters.stock === 'in_stock') {
          return product.stock_quantity !== null && product.stock_quantity >= 10;
        }
        return true;
      });
    }

    // Price range filter
    if (activeFilters.price?.min) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(activeFilters.price.min)
      );
    }
    if (activeFilters.price?.max) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(activeFilters.price.max)
      );
    }

    // Date range filter
    if (activeFilters.date?.from) {
      filtered = filtered.filter(
        (product) => new Date(product.created_at) >= new Date(activeFilters.date.from)
      );
    }
    if (activeFilters.date?.to) {
      filtered = filtered.filter(
        (product) => new Date(product.created_at) <= new Date(activeFilters.date.to)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleClearFilters = () => {
    setFilteredProducts(products);
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      label: 'Image',
      render: (product) =>
        product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-slate-200" />
        ),
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-semibold text-slate-900">{product.name}</p>
          {product.sku && (
            <p className="text-xs text-slate-500">SKU: {product.sku}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (product) => (
        <span className="text-sm text-slate-600">
          {product.categories?.name || '—'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product) => (
        <span className="font-semibold text-slate-900">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'stock_quantity',
      label: 'Stock',
      sortable: true,
      render: (product) => {
        if (product.stock_quantity === null) {
          return (
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Unlimited
            </span>
          );
        }
        if (product.stock_quantity === 0) {
          return (
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              Out of Stock
            </span>
          );
        }
        if (product.stock_quantity < 10) {
          return (
            <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
              {product.stock_quantity} (Low)
            </span>
          );
        }
        return (
          <span className="font-medium text-slate-900">
            {product.stock_quantity}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (product) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/products/new')}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(product) => product.id.toString()}
        searchPlaceholder="Search products by name or SKU..."
        emptyMessage="No products found"
        onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
      />
    </div>
  );
}
