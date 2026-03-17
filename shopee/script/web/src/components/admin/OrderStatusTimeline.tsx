'use client';

import { colors } from '@/lib/uiConfig';

interface StatusChange {
  id: number;
  order_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderStatusTimelineProps {
  orderNumber: string;
  statusHistory: StatusChange[];
}

export default function OrderStatusTimeline({ orderNumber, statusHistory }: OrderStatusTimelineProps) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status History</h2>

      {statusHistory.length === 0 ? (
        <p className="text-sm text-slate-500">No status changes yet</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

          <div className="space-y-6">
            {statusHistory.map((change, index) => (
              <div key={change.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 h-8 w-8 rounded-full border-4 border-white ${colors.primary} flex items-center justify-center`}>
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {change.old_status ? (
                          <>
                            {change.old_status.replace(/_/g, ' ')} → {change.new_status.replace(/_/g, ' ')}
                          </>
                        ) : (
                          change.new_status.replace(/_/g, ' ')
                        )}
                      </p>
                      {change.notes && (
                        <p className="mt-1 text-sm text-slate-600">{change.notes}</p>
                      )}
                      {change.changed_by && (
                        <p className="mt-2 text-xs text-slate-500">By: {change.changed_by}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(change.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
