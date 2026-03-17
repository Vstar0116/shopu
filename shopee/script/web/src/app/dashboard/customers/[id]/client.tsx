'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomerDetailClientProps {
  customer: any;
  orders: any[];
  addresses: any[];
  reviews: any[];
  wishlistItems: any[];
}

export default function CustomerDetailClient({ customer, orders, addresses, reviews, wishlistItems }: CustomerDetailClientProps) {
  const router = useRouter();

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  const statusDisplay: Record<string, string> = {
    pending_payment: 'Pending Payment',
    processing: 'Processing',
    artwork_in_progress: 'Artwork In Progress',
    awaiting_customer_approval: 'Awaiting Approval',
    ready_to_ship: 'Ready to Ship',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Customers
        </button>
        <h1 className="text-3xl font-bold text-slate-900">
          {customer.full_name || 'Unnamed Customer'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Customer since {new Date(customer.created_at).toLocaleDateString('en-IN')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Orders */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Order History</h2>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="block rounded-lg border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono font-semibold text-slate-900">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-600">
                          {statusDisplay[order.status] || order.status}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">No orders yet</p>
            )}
          </div>

          {/* Addresses */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Saved Addresses</h2>
            {addresses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{address.full_name}</p>
                    <p className="mt-1 text-sm text-slate-600">{address.phone}</p>
                    <p className="mt-2 text-sm text-slate-600">{address.address_line1}</p>
                    {address.address_line2 && (
                      <p className="text-sm text-slate-600">{address.address_line2}</p>
                    )}
                    <p className="text-sm text-slate-600">
                      {address.city}, {address.state} {address.zip_code}
                    </p>
                    {address.is_default && (
                      <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">No saved addresses</p>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Reviews ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review: any) => (
                  <div key={review.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {review.products && (
                          <Link
                            href={`/products/${review.products.slug}`}
                            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                          >
                            {review.products.name}
                          </Link>
                        )}
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? 'text-amber-400' : 'text-slate-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.title && (
                          <p className="mt-2 text-sm font-semibold text-slate-900">{review.title}</p>
                        )}
                        {review.body && (
                          <p className="mt-1 text-sm text-slate-600">{review.body}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            {new Date(review.created_at).toLocaleDateString('en-IN')}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 ${
                            review.is_published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {review.is_published ? 'Published' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">No reviews yet</p>
            )}
          </div>

          {/* Wishlist */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Wishlist ({wishlistItems.length})</h2>
            {wishlistItems.length > 0 ? (
              <div className="space-y-2">
                {wishlistItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    {item.products && (
                      <Link
                        href={`/products/${item.products.slug}`}
                        className="text-sm font-medium text-slate-900 hover:text-amber-600"
                      >
                        {item.products.name}
                      </Link>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">No wishlist items</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Customer Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed Orders</p>
                <p className="text-2xl font-bold text-slate-900">{completedOrders}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Average Order Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{orders.length > 0 ? Math.round(totalSpent / orders.length).toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Contact Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600">Full Name</p>
                <p className="font-semibold text-slate-900">
                  {customer.full_name || 'N/A'}
                </p>
              </div>
              {customer.phone && (
                <div>
                  <p className="text-slate-600">Phone</p>
                  <p className="font-semibold text-slate-900">{customer.phone}</p>
                </div>
              )}
              <div>
                <p className="text-slate-600">User ID</p>
                <p className="font-mono text-xs text-slate-500">
                  {customer.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600">Role</p>
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {customer.role}
                </span>
              </div>
              <div>
                <p className="text-slate-600">Member Since</p>
                <p className="font-semibold text-slate-900">
                  {new Date(customer.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Last Updated</p>
                <p className="font-semibold text-slate-900">
                  {new Date(customer.updated_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
