import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { getOrCreateCart } from "@/lib/services/cart";
import { colors, layout as layoutConfig } from "@/lib/uiConfig";

export default async function CheckoutPage() {
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
      )
    `
    )
    .eq("cart_id", cart.id);

  const cartItems = items ?? [];

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.unit_price_snapshot) * item.quantity,
    0
  );

  return (
    <div className={`mx-auto ${layoutConfig.maxWidth} ${layoutConfig.pagePadding}`}>
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.primary} font-semibold text-white`}>1</div>
            <span className="font-semibold text-slate-900">Shipping</span>
          </div>
          <div className="h-px w-12 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500">2</div>
            <span className="text-slate-500">Payment</span>
          </div>
          <div className="h-px w-12 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500">3</div>
            <span className="text-slate-500">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Shipping Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shipping Details</h1>
            <p className="text-sm text-slate-600">
              Enter your delivery address to receive your custom artwork.
            </p>
          </div>

          <form
            action="/api/checkout"
            method="post"
            className={`space-y-5 rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}
          >
            {!user ? (
              <div className={`rounded-xl border border-blue-200 ${colors.primaryLight} p-4 text-xs text-blue-800`}>
                <p className="font-semibold">Guest Checkout</p>
                <p className="mt-1">You&apos;re checking out as a guest. Create an account to track your orders easily.</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="full_name"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="phone"
                  type="tel"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="address_line1"
                className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                placeholder="House No., Street Name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="city"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="state"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="country"
                  defaultValue="India"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="pincode"
                  className={`w-full rounded-xl border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  placeholder="400001"
                />
              </div>
            </div>

            <input type="hidden" name="subtotal" value={subtotal} />

            <button
              type="submit"
              className={`mt-6 w-full rounded-xl ${colors.primary} px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all ${colors.primaryHover} hover:shadow-xl`}
            >
              Place Order (Cash on Delivery)
            </button>

            <p className={`text-center text-xs ${colors.textLight}`}>
              By placing your order, you agree to our terms and conditions.
            </p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{(item.products as any)?.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ₹{(Number(item.unit_price_snapshot) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className={`my-4 border-t ${colors.borderLight}`}></div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className={`flex justify-between border-t ${colors.borderLight} pt-3 text-base`}>
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border ${colors.borderLight} ${colors.surfaceAlt} p-4 text-xs`}>
            <p className="font-semibold text-slate-700">Payment Options</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>• Cash on Delivery available</li>
              <li>• Razorpay secure online payment</li>
              <li>• 30% advance + 70% COD option</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
