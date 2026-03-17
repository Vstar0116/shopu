'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import CategoryForm from '@/components/admin/CategoryForm';
import { colors } from '@/lib/uiConfig';

interface CategoriesClientProps {
  categories: any[];
}

export default function CategoriesClient({ categories: initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const refreshCategories = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: any) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      await refreshCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingCategory(null);
    await refreshCategories();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (category) => (
        <div>
          <p className="font-semibold text-slate-900">{category.name}</p>
          <p className="text-xs text-slate-500">{category.slug}</p>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (category) => (
        <span className="text-sm text-slate-600">
          {category.description ? category.description.substring(0, 80) + '...' : '—'}
        </span>
      ),
    },
    {
      key: 'sort_order',
      label: 'Order',
      sortable: true,
      render: (category) => (
        <span className="text-sm text-slate-700">{category.sort_order || '—'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (category) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            category.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-600">
            Organize your products into categories for easy navigation.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        keyExtractor={(category) => category.id}
        searchPlaceholder="Search categories..."
        emptyMessage="No categories found."
        actions={(category) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(category)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(category)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
