'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Upload {
  id: number;
  profile_id: string;
  order_id: number | null;
  storage_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  profiles?: {
    full_name: string | null;
  }[];
  orders?: {
    order_number: string;
  }[];
}

interface UploadsClientProps {
  uploads: Upload[];
}

export default function UploadsClient({ uploads: initialUploads }: UploadsClientProps) {
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  const handleDelete = async (upload: Upload) => {
    if (!confirm('Delete this upload? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/uploads/${upload.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      // Refresh list
      const refreshRes = await fetch('/api/admin/uploads');
      const data = await refreshRes.json();
      setUploads(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleView = (upload: Upload) => {
    setSelectedUpload(upload);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    }
    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  };

  const columns: Column<Upload>[] = [
    {
      key: 'file_url',
      label: 'File',
      render: (upload) => (
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${colors.primary} p-2 text-white`}>
            {getFileIcon(upload.mime_type)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {upload.storage_path.split('/').pop()}
            </p>
            <p className="text-xs text-slate-500">
              {upload.mime_type} • {formatFileSize(upload.file_size)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'profile_id',
      label: 'Customer',
      render: (upload) => {
        const profile = upload.profiles?.[0];
        return (
          <span className="text-sm text-slate-900">
            {profile?.full_name || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'order_id',
      label: 'Order',
      render: (upload) => {
        const order = upload.orders?.[0];
        return order?.order_number ? (
          <span className="font-mono text-sm text-slate-900">
            {order.order_number}
          </span>
        ) : (
          <span className="text-sm text-slate-500">—</span>
        );
      },
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      sortable: true,
      render: (upload) => (
        <span className="text-sm text-slate-600">
          {new Date(upload.uploaded_at).toLocaleDateString('en-IN', {
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
      <DataTable
        columns={columns}
        data={uploads}
        keyExtractor={(upload) => upload.id.toString()}
        searchPlaceholder="Search uploads..."
        emptyMessage="No customer uploads found"
        actions={(upload) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(upload)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View
            </button>
            <a
              href={upload.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-green-600 hover:underline"
            >
              Download
            </a>
            <button
              onClick={() => handleDelete(upload)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {/* Preview Modal */}
      {selectedUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedUpload(null)}
        >
          <div
            className="max-w-4xl w-full rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedUpload.storage_path.split('/').pop()}
              </h3>
              <button
                onClick={() => setSelectedUpload(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="rounded-xl bg-slate-100 p-8 text-center">
              {selectedUpload.mime_type.startsWith('image/') ? (
                <img
                  src={selectedUpload.file_url}
                  alt="Upload preview"
                  className="mx-auto max-h-96 rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className={`rounded-2xl ${colors.primary} p-8 text-white`}>
                    {getFileIcon(selectedUpload.mime_type)}
                  </div>
                  <p className="text-sm text-slate-600">
                    Preview not available for this file type
                  </p>
                  <a
                    href={selectedUpload.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-xl ${colors.primary} px-6 py-3 font-semibold text-white transition-all ${colors.primaryHover}`}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-700">Customer</p>
                <p className="text-slate-600">
                  {selectedUpload.profiles?.[0]?.full_name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Order</p>
                <p className="text-slate-600">
                  {selectedUpload.orders?.[0]?.order_number || '—'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Size</p>
                <p className="text-slate-600">{formatFileSize(selectedUpload.file_size)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Uploaded</p>
                <p className="text-slate-600">
                  {new Date(selectedUpload.uploaded_at).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
