import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DiagnosticPage() {
  const supabase = await createServerSupabaseClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Check orders for this user
  const { data: userOrders, error: userOrdersError } = await supabase
    .from("orders")
    .select("*")
    .eq("profile_id", user?.id || "no-user")
    .order("placed_at", { ascending: false });
  
  // Check ALL orders in database
  const { data: allOrders, error: allOrdersError } = await supabase
    .from("orders")
    .select("id, order_number, profile_id, status, placed_at")
    .order("placed_at", { ascending: false })
    .limit(20);
  
  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "no-user")
    .maybeSingle();

  // Check RLS policies
  let policiesResult = { data: null, error: 'RPC not available' };
  try {
    const rpcResult = await supabase.rpc('get_policies_info' as any);
    if (rpcResult) {
      policiesResult = rpcResult as any;
    }
  } catch (e) {
    // RPC not available, use default
  }
  const { data: policies, error: policiesError } = policiesResult;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">🔍 Diagnostic Report</h1>
      
      {/* Authentication */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">1. Authentication Status</h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">Logged In:</span>
            <span className={user ? "text-green-600" : "text-red-600"}>
              {user ? "✅ YES" : "❌ NO"}
            </span>
          </div>
          {user && (
            <>
              <div className="flex gap-4">
                <span className="font-semibold text-slate-600">User ID:</span>
                <span className="text-slate-900">{user.id}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-slate-600">Email:</span>
                <span className="text-slate-900">{user.email}</span>
              </div>
            </>
          )}
          {authError && (
            <div className="rounded bg-red-50 p-3 text-red-700">
              <strong>Auth Error:</strong> {authError.message}
            </div>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">2. Profile Data</h2>
        {profile ? (
          <pre className="overflow-auto rounded bg-slate-50 p-4 text-xs">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-600">
            {profileError ? (
              <div className="rounded bg-red-50 p-3 text-red-700">
                <strong>Profile Error:</strong> {profileError.message}
              </div>
            ) : (
              <p>No profile found</p>
            )}
          </div>
        )}
      </div>

      {/* User's Orders */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">3. Your Orders (profile_id = {user?.id})</h2>
        <div className="flex gap-4 mb-3">
          <span className="font-semibold text-slate-600">Count:</span>
          <span className={userOrders && userOrders.length > 0 ? "text-green-600" : "text-orange-600"}>
            {userOrders?.length || 0} orders found
          </span>
        </div>
        {userOrdersError ? (
          <div className="rounded bg-red-50 p-3 text-red-700">
            <strong>Query Error:</strong> {userOrdersError.message}
          </div>
        ) : userOrders && userOrders.length > 0 ? (
          <pre className="overflow-auto rounded bg-slate-50 p-4 text-xs">
            {JSON.stringify(userOrders, null, 2)}
          </pre>
        ) : (
          <div className="rounded bg-yellow-50 p-3 text-yellow-800">
            No orders found for this user ID. This means:<br/>
            • You haven't placed any orders while logged in, OR<br/>
            • Your orders have profile_id = NULL (guest orders), OR<br/>
            • RLS policies are blocking the query
          </div>
        )}
      </div>

      {/* All Orders in DB */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">4. All Orders in Database (First 20)</h2>
        <div className="flex gap-4 mb-3">
          <span className="font-semibold text-slate-600">Total Found:</span>
          <span className="text-blue-600">{allOrders?.length || 0} orders</span>
        </div>
        {allOrdersError ? (
          <div className="rounded bg-red-50 p-3 text-red-700">
            <strong>Query Error:</strong> {allOrdersError.message}
          </div>
        ) : allOrders && allOrders.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Order Number</th>
                  <th className="px-3 py-2 text-left">Profile ID</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Placed At</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order: any) => (
                  <tr key={order.id} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-mono">{order.order_number}</td>
                    <td className="px-3 py-2 font-mono">
                      {order.profile_id || <span className="text-orange-600">NULL (guest)</span>}
                    </td>
                    <td className="px-3 py-2">{order.status}</td>
                    <td className="px-3 py-2">{order.placed_at ? new Date(order.placed_at).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded bg-red-50 p-3 text-red-700">
            No orders found in database AT ALL! Database may be empty or RLS is blocking everything.
          </div>
        )}
      </div>

      {/* Analysis */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-3 text-xl font-bold text-blue-900">📊 Root Cause Analysis</h2>
        <div className="space-y-3 text-sm text-blue-900">
          {!user && (
            <div className="rounded bg-red-100 p-3">
              <strong>❌ Problem:</strong> You are NOT logged in. Sign in first.
            </div>
          )}
          
          {user && (!userOrders || userOrders.length === 0) && allOrders && allOrders.length > 0 && (
            <div className="rounded bg-orange-100 p-3">
              <strong>⚠️ Problem:</strong> Orders exist in database, but none match your profile_id.<br/>
              <strong>Reason:</strong> All orders have profile_id = NULL (guest orders).<br/>
              <strong>Solution:</strong> Place a NEW order WHILE logged in to see it in "My Orders".
            </div>
          )}

          {user && (!allOrders || allOrders.length === 0) && (
            <div className="rounded bg-red-100 p-3">
              <strong>❌ Problem:</strong> No orders in database at all, OR RLS is blocking SELECT.<br/>
              <strong>Solution:</strong> Run the RLS-SIMPLE.sql migration to enable order viewing.
            </div>
          )}

          {user && userOrders && userOrders.length > 0 && (
            <div className="rounded bg-green-100 p-3 text-green-900">
              <strong>✅ Success:</strong> Everything is working! You have {userOrders.length} orders.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900">🔧 Quick Actions</h2>
        <div className="space-y-2">
          <a href="/" className="block rounded bg-amber-500 px-4 py-2 text-center font-semibold text-white hover:bg-amber-600">
            Go Home
          </a>
          <a href="/account/orders" className="block rounded bg-blue-500 px-4 py-2 text-center font-semibold text-white hover:bg-blue-600">
            View My Orders Page
          </a>
          <a href="/collections/photo-to-art" className="block rounded bg-green-500 px-4 py-2 text-center font-semibold text-white hover:bg-green-600">
            Browse Products (Place New Order)
          </a>
        </div>
      </div>
    </div>
  );
}
