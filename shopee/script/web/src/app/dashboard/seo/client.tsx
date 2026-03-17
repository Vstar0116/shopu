'use client';

import { useState } from 'react';
import { colors } from '@/lib/uiConfig';

interface SeoSettings {
  id?: number;
  default_title_suffix: string | null;
  default_meta_description: string | null;
  default_og_image: string | null;
  twitter_handle: string | null;
  extra_meta_tags: any;
}

interface SeoClientProps {
  settings: SeoSettings | null;
}

export default function SeoClient({ settings }: SeoClientProps) {
  const [formData, setFormData] = useState({
    default_title_suffix: settings?.default_title_suffix || ' | Shopee',
    default_meta_description: settings?.default_meta_description || '',
    default_og_image: settings?.default_og_image || '',
    twitter_handle: settings?.twitter_handle || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/seo', {
        method: settings?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          SEO settings saved successfully!
        </div>
      )}

      <div className="space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Default Title Suffix
          </label>
          <input
            type="text"
            value={formData.default_title_suffix}
            onChange={(e) => setFormData({ ...formData, default_title_suffix: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
            placeholder=" | Your Store Name"
          />
          <p className="mt-1 text-xs text-slate-500">
            This will be appended to all page titles
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Default Meta Description
          </label>
          <textarea
            value={formData.default_meta_description}
            onChange={(e) => setFormData({ ...formData, default_meta_description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
            placeholder="Default description for pages without custom meta..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Default OG Image URL
          </label>
          <input
            type="url"
            value={formData.default_og_image}
            onChange={(e) => setFormData({ ...formData, default_og_image: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Twitter Handle
          </label>
          <input
            type="text"
            value={formData.twitter_handle}
            onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
            placeholder="@yourhandle"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className={`rounded-xl ${colors.primary} px-8 py-3 font-semibold text-white transition-colors ${colors.primaryHover} disabled:opacity-50`}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
}
