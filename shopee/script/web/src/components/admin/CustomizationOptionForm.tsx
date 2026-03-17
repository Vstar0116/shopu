'use client';

import { useState } from 'react';
import FormModal from './FormModal';

interface CustomizationOption {
  id?: number;
  product_id: number;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multi_select' | 'file';
  required: boolean;
  config: Record<string, any>;
  sort_order: number;
}

interface CustomizationOptionFormProps {
  productId: number;
  option?: CustomizationOption;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomizationOptionForm({
  productId,
  option,
  onSuccess,
  onCancel,
}: CustomizationOptionFormProps) {
  const [formData, setFormData] = useState({
    key: option?.key || '',
    label: option?.label || '',
    type: option?.type || 'text' as CustomizationOption['type'],
    required: option?.required ?? false,
    config: option?.config || {},
    selectOptions: (option?.config?.options || ['']).join('\n'),
    placeholder: option?.config?.placeholder || '',
    maxLength: option?.config?.maxLength || '',
    accept: option?.config?.accept || '',
    maxSize: option?.config?.maxSize || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build config object based on type
      const config: Record<string, any> = {};
      
      if (formData.type === 'select' || formData.type === 'multi_select') {
        config.options = formData.selectOptions
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean);
        
        if (config.options.length === 0) {
          throw new Error('At least one option is required for dropdown fields');
        }
      }
      
      if (formData.type === 'text' || formData.type === 'textarea') {
        if (formData.placeholder) config.placeholder = formData.placeholder;
        if (formData.maxLength) config.maxLength = parseInt(formData.maxLength);
      }
      
      if (formData.type === 'file') {
        if (formData.accept) config.accept = formData.accept;
        if (formData.maxSize) config.maxSize = parseInt(formData.maxSize);
      }

      const payload = {
        product_id: productId,
        key: formData.key,
        label: formData.label,
        type: formData.type,
        required: formData.required,
        config,
        sort_order: option?.sort_order ?? 0,
      };

      const url = option
        ? `/api/admin/customization-options/${option.id}`
        : '/api/admin/customization-options';
      
      const method = option ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save option');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={option ? 'Edit Customization Option' : 'Add Customization Option'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Label *
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., Custom Text, Size, Color"
            required
          />
          <p className="mt-1 text-xs text-slate-500">This will be shown to customers</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Key *
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="e.g., custom_text, size, color"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Unique identifier (lowercase, underscores only)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Field Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomizationOption['type'] })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
          >
            <option value="text">Text Input</option>
            <option value="textarea">Text Area</option>
            <option value="select">Dropdown (Single Select)</option>
            <option value="multi_select">Multi-Select</option>
            <option value="file">File Upload</option>
          </select>
        </div>

        {/* Type-specific fields */}
        {(formData.type === 'select' || formData.type === 'multi_select') && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Options * (one per line)
            </label>
            <textarea
              value={formData.selectOptions}
              onChange={(e) => setFormData({ ...formData, selectOptions: e.target.value })}
              rows={5}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Small&#10;Medium&#10;Large"
              required
            />
          </div>
        )}

        {(formData.type === 'text' || formData.type === 'textarea') && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Enter your text here..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Length
              </label>
              <input
                type="number"
                value={formData.maxLength}
                onChange={(e) => setFormData({ ...formData, maxLength: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g., 200"
              />
            </div>
          </>
        )}

        {formData.type === 'file' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Accepted File Types
              </label>
              <input
                type="text"
                value={formData.accept}
                onChange={(e) => setFormData({ ...formData, accept: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g., image/*, .pdf"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={formData.maxSize}
                onChange={(e) => setFormData({ ...formData, maxSize: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="e.g., 10"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="required"
            checked={formData.required}
            onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="required" className="text-sm font-medium text-slate-700">
            Required field
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : option ? 'Update Option' : 'Add Option'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
