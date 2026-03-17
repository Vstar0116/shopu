'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/uiConfig';
import ImageUploader from '@/components/admin/ImageUploader';

interface ArtworkApproval {
  id: number;
  status: 'pending' | 'approved' | 'changes_requested';
  designer_notes: string | null;
  customer_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

interface Artwork {
  id: number;
  order_id: number;
  order_item_id: number;
  file_url: string;
  version: number;
  uploaded_at: string;
  orders?: {
    order_number: string;
    profiles?: {
      full_name: string | null;
    }[];
  }[];
  artwork_approvals?: ArtworkApproval[];
}

interface ArtworkDetailClientProps {
  artwork: Artwork;
  adminProfile: any;
}

export default function ArtworkDetailClient({ artwork: initialArtwork, adminProfile }: ArtworkDetailClientProps) {
  const [artwork, setArtwork] = useState(initialArtwork);
  const [action, setAction] = useState<'approve' | 'changes' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  const latestApproval = artwork.artwork_approvals && artwork.artwork_approvals.length > 0
    ? artwork.artwork_approvals[artwork.artwork_approvals.length - 1]
    : null;

  const handleSubmit = async () => {
    if (!action) return;
    
    setLoading(true);
    setError('');

    try {
      const url = action === 'approve'
        ? `/api/admin/artwork/${artwork.id}/approve`
        : `/api/admin/artwork/${artwork.id}/request-changes`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designer_notes: notes,
          approved_by: adminProfile.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      router.push('/dashboard/artwork');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewVersion = async (urls: string[]) => {
    if (urls.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/artwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: artwork.order_id,
          order_item_id: artwork.order_item_id,
          file_url: urls[0],
          version: artwork.version + 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload');
      }

      router.refresh();
      setShowUpload(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Artwork Review - v{artwork.version}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Order: {artwork.orders?.[0]?.order_number || 'Unknown'} • Customer: {artwork.orders?.[0]?.profiles?.[0]?.full_name || 'Unknown'}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Artwork Preview */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Artwork Preview</h2>
          <div className="rounded-xl bg-slate-100 p-4">
            <img
              src={artwork.file_url}
              alt={`Artwork v${artwork.version}`}
              className="w-full rounded-lg"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href={artwork.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download
            </a>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={`flex-1 rounded-xl ${colors.primary} px-4 py-2 text-sm font-semibold text-white ${colors.primaryHover}`}
            >
              Upload New Version
            </button>
          </div>

          {showUpload && (
            <div className="mt-4">
              <ImageUploader
                onUpload={handleUploadNewVersion}
                maxFiles={1}
                bucket="artwork"
                folder={`order-${artwork.order_id}`}
              />
            </div>
          )}
        </div>

        {/* Approval Actions */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Review Status</h2>

          {/* Current Status */}
          {latestApproval && (
            <div className="mb-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Current Status:</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    latestApproval.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : latestApproval.status === 'changes_requested'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {latestApproval.status === 'approved'
                    ? 'Approved'
                    : latestApproval.status === 'changes_requested'
                    ? 'Changes Requested'
                    : 'Pending'}
                </span>
              </div>
              {latestApproval.designer_notes && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600">Designer Notes:</p>
                  <p className="mt-1 text-sm text-slate-700">{latestApproval.designer_notes}</p>
                </div>
              )}
              {latestApproval.customer_notes && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600">Customer Notes:</p>
                  <p className="mt-1 text-sm text-slate-700">{latestApproval.customer_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${
                  action === 'approve'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setAction('changes')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${
                  action === 'changes'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                ✕ Request Changes
              </button>
            </div>

            {action && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {action === 'approve' ? 'Approval Notes (optional)' : 'What changes are needed? *'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder={
                    action === 'approve'
                      ? 'Add any notes for the customer...'
                      : 'Describe what needs to be changed...'
                  }
                  required={action === 'changes'}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || (action === 'changes' && !notes.trim())}
                  className={`mt-4 w-full rounded-xl ${
                    action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  } px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50`}
                >
                  {loading ? 'Submitting...' : action === 'approve' ? 'Approve Artwork' : 'Request Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Version History */}
          {artwork.artwork_approvals && artwork.artwork_approvals.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">History</h3>
              <div className="space-y-2">
                {artwork.artwork_approvals.map((approval, index) => (
                  <div key={approval.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {approval.status === 'approved' ? 'Approved' : approval.status === 'changes_requested' ? 'Changes Requested' : 'Pending'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {approval.approved_at
                          ? new Date(approval.approved_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Pending'}
                      </span>
                    </div>
                    {approval.designer_notes && (
                      <p className="mt-2 text-xs text-slate-600">{approval.designer_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
