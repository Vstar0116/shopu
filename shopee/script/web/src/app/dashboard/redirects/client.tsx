'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import { colors } from '@/lib/uiConfig';

interface Redirect {
  id: number;
  from_path: string;
  to_path: string;
  is_permanent: boolean;
  is_active: boolean;
  created_at: string;
}

interface RedirectsClientProps {
  redirects: Redirect[];
}

export default function RedirectsClient({ redirects: initialRedirects }: RedirectsClientProps) {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({
    from_path: '',
    to_path: '',
    is_permanent: true,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const refreshRedirects = async () => {
    const res = await fetch('/api/admin/redirects');
    const data = await res.json();
    setRedirects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editing
        ? `/api/admin/redirects/${editing.id}`
        : '/api/admin/redirects';

      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      setShowForm(false);
      setEditing(null);
      setFormData({ from_path: '', to_path: '', is_permanent: true, is_active: true });
      await refreshRedirects();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (redirect: Redirect) => {
    if (!confirm('Delete this redirect?')) return;

    try {
      const res = await fetch(`/api/admin/redirects/${redirect.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await refreshRedirects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Redirect>[] = [
    {
      key: 'from_path',
      label: 'From',
      sortable: true,
      render: (redirect) => (
        <span className="font-mono text-sm text-slate-900">{redirect.from_path}</span>
      ),
    },
    {
      key: 'to_path',
      label: 'To',
      render: (redirect) => (
        <span className="font-mono text-sm text-slate-600">{redirect.to_path}</span>
      ),
    },
    {
      key: 'is_permanent',
      label: 'Type',
      render: (redirect) => (
        <span className="text-sm text-slate-600">
          {redirect.is_permanent ? '301' : '302'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (redirect) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            redirect.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {redirect.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ from_path: '', to_path: '', is_permanent: true, is_active: true });
            setShowForm(true);
          }}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Redirect
        </button>
      </div>

      <DataTable
        columns={columns}
        data={redirects}
        keyExtractor={(redirect) => redirect.id.toString()}
        searchPlaceholder="Search redirects..."
        emptyMessage="No redirects configured"
        actions={(redirect) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing(redirect);
                setFormData({
                  from_path: redirect.from_path,
                  to_path: redirect.to_path,
                  is_permanent: redirect.is_permanent,
                  is_active: redirect.is_active,
                });
                setShowForm(true);
              }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(redirect)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showForm && (
        <FormModal
          isOpen={true}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? 'Edit Redirect' : 'Add Redirect'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                From Path *
              </label>
              <input
                type="text"
                value={formData.from_path}
                onChange={(e) => setFormData({ ...formData, from_path: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                placeholder="/old-product"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                To Path *
              </label>
              <input
                type="text"
                value={formData.to_path}
                onChange={(e) => setFormData({ ...formData, to_path: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                placeholder="/new-product"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_permanent"
                  checked={formData.is_permanent}
                  onChange={(e) => setFormData({ ...formData, is_permanent: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_permanent" className="text-sm font-medium text-slate-700">
                  Permanent (301) - Recommended for SEO
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
}
