"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { colors } from "@/lib/uiConfig";

type WishlistItem = {
  id: number;
  product_id: number;
  variant_id: number | null;
  created_at: string;
  products: {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    image_url: string | null;
  } | null;
  product_variants: {
    id: number;
    title: string;
    price: string;
    stock_quantity: number | null;
  } | null;
};

type Props = {
  items: WishlistItem[];
};

export function WishlistClient({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);

  async function handleRemove(itemId: number) {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((i) => i.id !== itemId));
      } else {
        alert("Failed to remove item from wishlist.");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Something went wrong.");
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    try {
      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Optionally remove from wishlist after adding to cart
        await handleRemove(item.id);
        window.location.href = "/cart";
      } else {
        alert("Failed to add to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong.");
    }
  }

  if (items.length === 0) {
    return (
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
        <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Your wishlist is empty</h3>
        <p className="mt-2 text-sm text-slate-600">
          Save items you love to your wishlist for easy access later
        </p>
        <Link
          href="/"
          className={`mt-6 inline-block rounded-lg ${colors.primary} px-6 py-2.5 text-sm font-semibold text-white transition-all ${colors.primaryHover}`}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">
        My Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const product = item.products;
          const variant = item.product_variants;
          const price = variant?.price || product?.base_price || "0";
          const inStock = variant ? (variant.stock_quantity ?? 0) > 0 : true;

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border ${colors.borderLight} ${colors.surface} shadow-sm transition-all hover:shadow-md`}
            >
              {/* Product Image */}
              <Link href={`/products/${product?.slug}`}>
                <div className="relative aspect-square bg-slate-100">
                  {product?.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product?.slug}`}>
                  <h3 className="text-sm font-semibold text-slate-900 hover:text-amber-600">
                    {product?.name}
                  </h3>
                </Link>
                {variant && (
                  <p className="mt-1 text-xs text-slate-600">{variant.title}</p>
                )}
                <p className="mt-2 text-sm font-bold text-slate-900">
                  ₹{Number(price).toLocaleString("en-IN")}
                </p>

                {/* Stock Status */}
                {!inStock && (
                  <span className="mt-2 inline-block text-xs text-red-600">Out of Stock</span>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!inStock}
                    className={`flex-1 rounded-lg ${colors.primary} px-3 py-2 text-xs font-semibold text-white transition-all ${colors.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    title="Remove from wishlist"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
