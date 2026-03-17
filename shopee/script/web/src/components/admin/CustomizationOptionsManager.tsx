'use client';

import { useState, useEffect } from 'react';
import CustomizationOptionForm from './CustomizationOptionForm';
import { colors } from '@/lib/uiConfig';

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

interface CustomizationOptionsManagerProps {
  productId: number;
  initialOptions?: CustomizationOption[];
}

export default function CustomizationOptionsManager({
  productId,
  initialOptions = [],
}: CustomizationOptionsManagerProps) {
  const [options, setOptions] = useState<CustomizationOption[]>(initialOptions);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null);

  useEffect(() => {
    fetchOptions();
  }, [productId]);

  const fetchOptions = async () => {
    try {
      const res = await fetch(`/api/admin/customization-options?product_id=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const handleCreate = () => {
    setEditingOption(null);
    setShowForm(true);
  };

  const handleEdit = (option: CustomizationOption) => {
    setEditingOption(option);
    setShowForm(true);
  };

  const handleDelete = async (optionId: number) => {
    if (!confirm('Delete this customization option?')) return;

    try {
      const res = await fetch(`/api/admin/customization-options/${optionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      await fetchOptions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...options];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    // Update sort_order
    const updated = reordered.map((opt, index) => ({
      ...opt,
      sort_order: index,
    }));

    setOptions(updated);

    // Save to backend
    try {
      await Promise.all(
        updated.map((opt) =>
          fetch(`/api/admin/customization-options/${opt.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sort_order: opt.sort_order }),
          })
        )
      );
    } catch (err) {
      console.error('Failed to reorder:', err);
      await fetchOptions();
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingOption(null);
    await fetchOptions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOption(null);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Text Input',
      textarea: 'Text Area',
      select: 'Dropdown',
      multi_select: 'Multiple Select',
      file: 'File Upload',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Customization Options</h3>
          <p className="text-sm text-slate-600 mt-1">
            Define custom fields customers can fill when ordering this product
          </p>
        </div>
        <button
          onClick={handleCreate}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-4 py-2 text-sm font-semibold text-white transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Option
        </button>
      </div>

      {options.length > 0 ? (
        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="group rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-amber-400"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{option.label}</span>
                    {option.required && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Required
                      </span>
                    )}
                    <span className="text-xs text-slate-500">({getTypeLabel(option.type)})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Key: {option.key}</p>
                  
                  {option.type === 'select' || option.type === 'multi_select' ? (
                    option.config.options && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {option.config.options.map((opt: string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(index, index - 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                  )}
                  {index < options.length - 1 && (
                    <button
                      onClick={() => handleReorder(index, index + 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(option)}
                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(option.id!)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-slate-600">
            No customization options yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add custom fields like text inputs, dropdowns, or file uploads
          </p>
        </div>
      )}

      {showForm && (
        <CustomizationOptionForm
          productId={productId}
          option={editingOption || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
