import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { getOrCreateCart } from "@/lib/services/cart";
import Link from "next/link";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";
import { CartClientWrapper } from "./client-wrapper";

export default async function CartPage() {
  const supabase = await createServerSupabaseClient();
  const cart = await getOrCreateCart();

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      unit_price_snapshot,
      products!inner (
        id,
        name,
        slug
      ),
      product_variants (
        id,
        title
      )
    `
    )
    .eq("cart_id", cart.id);

  const cartItems = items ?? [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.unit_price_snapshot) * item.quantity,
    0
  );

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
        <p className="text-sm text-slate-600">
          Review your items and proceed to checkout when ready.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-12 text-center shadow-sm`}>
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse our collections to find the perfect artwork for your space.
          </p>
          <Link
            href="/collections/photo-to-art"
            className={`mt-6 inline-flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
          >
            Explore Collections
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <CartClientWrapper items={cartItems} subtotal={subtotal} />
      )}
    </div>
  );
}
