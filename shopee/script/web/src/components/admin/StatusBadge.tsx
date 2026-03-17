import type { OrderStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: 'sm' | 'md';
}

const statusColors: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  payment_failed: 'bg-red-50 text-red-700 border-red-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  artwork_in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  awaiting_customer_approval: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ready_to_ship: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = statusColors[status as OrderStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold uppercase ${colorClass} ${sizeClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
