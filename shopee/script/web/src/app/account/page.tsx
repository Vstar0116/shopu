import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import Link from "next/link";
import { colors } from "@/lib/uiConfig";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AccountOverviewPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  // Fetch order stats
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, status, placed_at")
    .eq("profile_id", user.id)
    .order("placed_at", { ascending: false })
    .limit(5);

  const totalOrders = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  // Fetch wishlist count
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  let wishlistCount = 0;
  if (wishlist) {
    const { count } = await supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("wishlist_id", wishlist.id);
    wishlistCount = count ?? 0;
  }

  // Fetch review count
  const { count: reviewCount } = await supabase
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const stats = [
    { label: "Total Orders", value: totalOrders, href: "/account/orders", icon: "orders" },
    { label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, href: "/account/orders", icon: "money" },
    { label: "Wishlist Items", value: wishlistCount, href: "/account/wishlist", icon: "wishlist" },
    { label: "Reviews Written", value: reviewCount ?? 0, href: "/account/reviews", icon: "reviews" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
        <h2 className="text-xl font-bold text-slate-900">
          Welcome back, {profile?.full_name || "Customer"}!
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-300`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
            View All
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className={`flex items-center justify-between rounded-lg border ${colors.border} p-4 transition-all hover:border-amber-300 hover:shadow-sm`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {new Date(order.placed_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-8">No orders yet</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/profile"
          className={`flex items-center gap-4 rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-300`}
        >
          <div className={`rounded-full ${colors.primaryLight} p-3`}>
            <svg className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Edit Profile</h4>
            <p className="text-xs text-slate-600">Update your personal information</p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className={`flex items-center gap-4 rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-300`}
        >
          <div className={`rounded-full ${colors.primaryLight} p-3`}>
            <svg className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Manage Addresses</h4>
            <p className="text-xs text-slate-600">Add or edit shipping addresses</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
