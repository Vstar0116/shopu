'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StockUpdateForm from '@/components/admin/StockUpdateForm';
import { colors } from '@/lib/uiConfig';

interface Variant {
  id: number;
  sku: string;
  title: string;
  stock_quantity: number | null;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  stock_quantity: number | null;
  track_inventory: boolean;
  product_variants: Variant[];
}

interface InventoryItem {
  id: string;
  type: 'product' | 'variant';
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  stockQuantity: number | null;
  trackInventory: boolean;
}

interface InventoryClientProps {
  products: Product[];
}

export default function InventoryClient({ products: initialProducts }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Flatten products and variants into inventory items
  const inventoryItems: InventoryItem[] = [];
  
  products.forEach((product) => {
    if (product.product_variants && product.product_variants.length > 0) {
      // Add variants
      product.product_variants.forEach((variant) => {
        inventoryItems.push({
          id: `variant-${variant.id}`,
          type: 'variant',
          productId: product.id,
          variantId: variant.id,
          name: `${product.name} - ${variant.title}`,
          sku: variant.sku || product.sku || '',
          stockQuantity: variant.stock_quantity,
          trackInventory: product.track_inventory,
        });
      });
    } else {
      // Add product without variants
      inventoryItems.push({
        id: `product-${product.id}`,
        type: 'product',
        productId: product.id,
        name: product.name,
        sku: product.sku || '',
        stockQuantity: product.stock_quantity,
        trackInventory: product.track_inventory,
      });
    }
  });

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = async () => {
    setShowUpdateForm(false);
    setSelectedItem(null);
    
    // Refresh data
    const res = await fetch('/api/admin/inventory');
    const data = await res.json();
    setProducts(data);
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'name',
      label: 'Product / Variant',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          {item.sku && (
            <p className="text-xs font-mono text-slate-500">{item.sku}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      label: 'Stock Level',
      sortable: true,
      render: (item) => {
        if (!item.trackInventory) {
          return <span className="text-sm text-slate-500">Not tracked</span>;
        }
        
        if (item.stockQuantity === null) {
          return <span className="text-sm text-slate-500">Unlimited</span>;
        }

        const isOutOfStock = item.stockQuantity === 0;
        const isLowStock = item.stockQuantity > 0 && item.stockQuantity < 10;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                isOutOfStock
                  ? 'text-red-600'
                  : isLowStock
                  ? 'text-orange-600'
                  : 'text-green-600'
              }`}
            >
              {item.stockQuantity}
            </span>
            {isOutOfStock && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                Low Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <span className="text-sm text-slate-600 capitalize">{item.type}</span>
      ),
    },
  ];

  // Stats
  const totalItems = inventoryItems.filter((item) => item.trackInventory).length;
  const lowStockItems = inventoryItems.filter(
    (item) =>
      item.trackInventory &&
      item.stockQuantity !== null &&
      item.stockQuantity > 0 &&
      item.stockQuantity < 10
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) =>
      item.trackInventory &&
      item.stockQuantity !== null &&
      item.stockQuantity === 0
  ).length;
  const totalStock = inventoryItems.reduce(
    (sum, item) =>
      item.trackInventory && item.stockQuantity !== null
        ? sum + item.stockQuantity
        : sum,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl ${colors.primary} p-3`}>
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Items</p>
              <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-600 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Stock</p>
              <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-600 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-2xl font-bold text-slate-900">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Out of Stock</p>
              <p className="text-2xl font-bold text-slate-900">{outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={inventoryItems}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search products or variants..."
        emptyMessage="No inventory items found"
        actions={(item) => (
          <button
            onClick={() => handleUpdateStock(item)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Update Stock
          </button>
        )}
      />

      {showUpdateForm && selectedItem && (
        <StockUpdateForm
          item={selectedItem}
          onSuccess={handleUpdateSuccess}
          onCancel={() => {
            setShowUpdateForm(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
