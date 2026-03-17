import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const navItems = [
    { href: "/account", label: "Overview", icon: "home" },
    { href: "/account/orders", label: "My Orders", icon: "orders" },
    { href: "/account/profile", label: "Profile", icon: "profile" },
    { href: "/account/addresses", label: "Addresses", icon: "addresses" },
    { href: "/account/wishlist", label: "Wishlist", icon: "wishlist" },
    { href: "/account/reviews", label: "Reviews", icon: "reviews" },
  ];

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding} py-8`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar Navigation */}
          <nav className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-4 shadow-sm lg:sticky lg:top-4 h-fit`}>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-amber-50 hover:text-amber-700`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
