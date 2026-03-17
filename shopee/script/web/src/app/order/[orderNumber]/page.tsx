import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import Link from "next/link";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    return (
      <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
          <p className="text-sm text-slate-500">Order not found.</p>
          <Link href="/" className={`mt-4 inline-block text-sm font-semibold ${colors.primaryText}`}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Security check: Verify order ownership
  if (order.profile_id) {
    // Logged-in order - check if user owns the order
    if (!user || order.profile_id !== user.id) {
      return (
        <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
          <div className={`rounded-2xl border border-red-200 bg-red-50 p-12 text-center`}>
            <svg className="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Access Denied</h2>
            <p className="mt-2 text-sm text-slate-600">
              You don't have permission to view this order.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/" className={`inline-block text-sm font-semibold ${colors.primaryText}`}>
                Return to Home
              </Link>
              {!user && (
                <>
                  <span className="text-slate-300">|</span>
                  <Link href="/account/orders" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    My Orders
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }
  }
  // Guest order: Currently allowing access (would need session validation for stricter security)

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name_snapshot, variant_title_snapshot, quantity, total_price")
    .eq("order_id", order.id);

  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    artwork_in_progress: "bg-purple-100 text-purple-800 border-purple-200",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  
  const statusColor = statusColors[order.status] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order Details</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {order.order_number}
            </h1>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${statusColor}`}>
            <div className="h-2 w-2 rounded-full bg-current"></div>
            {order.status.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Placed on {order.placed_at ? new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            Payment: {order.payment_method?.toUpperCase() ?? "N/A"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Order Items */}
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Items</h2>
          <div className="space-y-4">
            {(items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.product_name_snapshot}
                  </p>
                  {item.variant_title_snapshot ? (
                    <p className="text-xs text-slate-500">{item.variant_title_snapshot}</p>
                  ) : null}
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  ₹{Number(item.total_price).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className={`my-4 border-t ${colors.borderLight}`}></div>

          <div className="flex justify-between text-base">
            <span className="font-bold text-slate-900">Total Amount</span>
            <span className="font-bold text-slate-900">
              ₹{Number(order.total_amount ?? order.subtotal_amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="space-y-6">
          <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
            <h2 className="mb-4 text-sm font-bold text-slate-900">Shipping Address</h2>
            <div className="space-y-1 text-xs text-slate-600">
              {order.shipping_address_snapshot && typeof order.shipping_address_snapshot === "object" ? (
                <>
                  <p className="font-semibold text-slate-900">
                    {(order.shipping_address_snapshot as any).full_name}
                  </p>
                  <p>{(order.shipping_address_snapshot as any).address_line1}</p>
                  <p>
                    {(order.shipping_address_snapshot as any).city}, {(order.shipping_address_snapshot as any).state} {(order.shipping_address_snapshot as any).pincode}
                  </p>
                  <p>{(order.shipping_address_snapshot as any).country}</p>
                  <p className="pt-2 font-medium">Phone: {(order.shipping_address_snapshot as any).phone}</p>
                </>
              ) : (
                <p className="text-slate-500">Address information not available</p>
              )}
            </div>
          </div>

          <div className={`rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800`}>
            <p className="font-semibold">What happens next?</p>
            <ul className="mt-2 space-y-1">
              <li>• Our artists will start working on your artwork</li>
              <li>• You'll receive a preview on WhatsApp</li>
              <li>• Once approved, we'll ship it to you</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
