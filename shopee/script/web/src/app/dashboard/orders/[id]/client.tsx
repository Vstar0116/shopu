'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/uiConfig';
import OrderStatusTimeline from '@/components/admin/OrderStatusTimeline';

interface OrderDetailClientProps {
  order: any;
  statusHistory?: any[];
}

export default function OrderDetailClient({ order, statusHistory = [] }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);

  const statusOptions = [
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'processing', label: 'Processing' },
    { value: 'artwork_in_progress', label: 'Artwork In Progress' },
    { value: 'awaiting_customer_approval', label: 'Awaiting Approval' },
    { value: 'ready_to_ship', label: 'Ready to Ship' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order');
      }

      alert('Order updated successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const shippingAddress = order.shipping_address_snapshot;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Placed on {new Date(order.created_at).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 border-b border-slate-200 pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.product_name_snapshot || item.products?.name}
                    </p>
                    {item.variant_title_snapshot && (
                      <p className="text-sm text-slate-600">
                        Variant: {item.variant_title_snapshot}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ₹{Number(item.total_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  ₹{Number(order.subtotal_amount).toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-green-600">
                    -₹{Number(order.discount_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-slate-900">
                  ₹{Number(order.shipping_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">
                    ₹{Number(order.tax_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Shipping Address</h2>
            {shippingAddress && (
              <div className="text-sm text-slate-700">
                <p className="font-semibold">{shippingAddress.full_name}</p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.email}</p>
                <p className="mt-2">{shippingAddress.address_line1}</p>
                {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className={`w-full rounded-xl ${colors.primary} px-6 py-3 font-semibold text-white shadow-lg transition-all ${colors.primaryHover} disabled:opacity-50`}
              >
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Customer Info</h2>
            <div className="text-sm text-slate-700">
              <p className="font-semibold">
                {order.profiles?.full_name || shippingAddress?.full_name || 'Guest'}
              </p>
              {order.profiles?.phone && <p>{order.profiles.phone}</p>}
              {shippingAddress?.email && <p>{shippingAddress.email}</p>}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Payment Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-600">Method:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Status:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {paymentStatusOptions.find((opt) => opt.value === order.payment_status)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      {statusHistory && statusHistory.length > 0 && (
        <OrderStatusTimeline
          orderNumber={order.order_number}
          statusHistory={statusHistory}
        />
      )}

      {/* Order Notes Section */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Internal Notes</h2>
          <button
            onClick={() => setShowNotesForm(!showNotesForm)}
            className={`rounded-lg ${colors.primary} px-4 py-2 text-sm font-semibold text-white ${colors.primaryHover}`}
          >
            {showNotesForm ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {showNotesForm && (
          <div className="mb-4 rounded-xl bg-slate-50 p-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none"
              placeholder="Add internal notes about this order..."
            />
            <button
              onClick={async () => {
                if (!notes.trim()) return;
                
                try {
                  const res = await fetch(`/api/admin/orders/${order.id}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ note: notes }),
                  });

                  if (!res.ok) throw new Error('Failed to add note');

                  alert('Note added');
                  setNotes('');
                  setShowNotesForm(false);
                  router.refresh();
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className={`mt-2 rounded-xl ${colors.primary} px-6 py-2 text-sm font-semibold text-white ${colors.primaryHover}`}
            >
              Save Note
            </button>
          </div>
        )}

        <p className="text-sm text-slate-500">Order notes and internal communications will appear here</p>
      </div>
    </div>
  );
}
