"use client";

import { useRouter } from "next/navigation";
import { CartItemControls } from "@/components/cart/CartItemControls";
import Link from "next/link";
import { colors } from "@/lib/uiConfig";

type CartItem = {
  id: number;
  quantity: number;
  unit_price_snapshot: string;
  products: any;
  product_variants: any;
};

type Props = {
  items: CartItem[];
  subtotal: number;
};

export function CartClientWrapper({ items, subtotal }: Props) {
  const router = useRouter();

  function handleUpdate() {
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex gap-5 rounded-2xl border ${colors.borderLight} ${colors.surface} p-5 shadow-sm`}
          >
            <div className="h-24 w-24 flex-none overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-1">
                <Link
                  href={`/products/${(item.products as any)?.slug ?? ""}`}
                  className="text-base font-semibold text-slate-900 hover:text-amber-600"
                >
                  {(item.products as any)?.name}
                </Link>
                {(item.product_variants as any)?.title ? (
                  <p className="text-xs text-slate-500">{(item.product_variants as any).title}</p>
                ) : null}
                <p className="text-sm font-bold text-slate-700">
                  ₹{Number(item.unit_price_snapshot).toLocaleString("en-IN")} each
                </p>
              </div>
              <CartItemControls
                itemId={item.id}
                initialQuantity={item.quantity}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="h-fit space-y-6">
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className={`flex justify-between border-t ${colors.borderLight} pt-3 text-base`}>
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/checkout"
          className={`flex w-full items-center justify-center gap-2 rounded-xl ${colors.primary} px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all ${colors.primaryHover} hover:shadow-xl`}
        >
          Proceed to Checkout
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        <div className={`rounded-xl border ${colors.borderLight} ${colors.surfaceAlt} p-4 text-xs ${colors.textLight}`}>
          <p className="font-medium text-slate-700">Secure Checkout</p>
          <p className="mt-1">Your payment information is protected and encrypted.</p>
        </div>
      </div>
    </div>
  );
}
