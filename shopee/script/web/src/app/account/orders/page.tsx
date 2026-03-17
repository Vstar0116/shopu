import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AccountOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // DEBUG: Log authentication state
  console.log("=== ACCOUNT ORDERS DEBUG ===");
  console.log("User authenticated:", !!user);
  console.log("User ID:", user?.id);
  console.log("User email:", user?.email);

  if (!user) {
    return (
      <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="mb-6 text-sm text-slate-600">Please sign in to view your orders.</p>
          <Link href="/" className={`inline-flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white transition-all ${colors.primaryHover}`}>
            Go to Home & Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Get orders linked to this user's profile
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, status, placed_at, payment_status, profile_id")
    .eq("profile_id", user.id)
    .order("placed_at", { ascending: false });

  // DEBUG: Log query results
  console.log("Orders query error:", ordersError);
  console.log("Orders found:", orders?.length || 0);
  console.log("Orders data:", JSON.stringify(orders, null, 2));

  // Also check if there are ANY orders in the database
  const { data: allOrders, error: allOrdersError } = await supabase
    .from("orders")
    .select("id, order_number, profile_id")
    .limit(10);
  
  console.log("All orders in DB (first 10):", JSON.stringify(allOrders, null, 2));
  console.log("All orders error:", allOrdersError);

  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-50 text-yellow-700 border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    artwork_in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Header */}
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-600">
          Track and manage all your custom artwork orders in one place.
        </p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-12 text-center shadow-sm`}>
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start by browsing our collections and finding the perfect artwork for your space.
          </p>
          <Link
            href="/collections/photo-to-art"
            className={`mt-6 inline-flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.order_number}`}
              className={`group block rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-600">
                      {order.order_number}
                    </h2>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${statusColors[order.status] || statusColors.processing}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      {order.placed_at ? new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pending"}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                      </svg>
                      {order.payment_status === "paid" ? "Paid" : order.payment_status === "pending" ? "Payment Pending" : order.payment_status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Amount</p>
                  <p className="text-xl font-bold text-slate-900">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
