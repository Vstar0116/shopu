"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Props = {
  productId: number;
  variantId?: number;
  quantity?: number;
  customizationData?: Record<string, any>;
  selectedAddons?: { addon_id: number; quantity: number }[];
  disabled?: boolean;
};

export function AddToCartButton({ productId, variantId, quantity = 1, customizationData, selectedAddons, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId, 
          variantId, 
          quantity,
          customizationData,
          selectedAddons
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/cart";
        }, 500);
      } else {
        alert("Failed to add to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={loading || success || disabled}
      className={`flex-1 rounded-xl ${colors.primary} px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all ${colors.primaryHover} hover:shadow-xl hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {disabled ? "Out of Stock" : loading ? "Adding..." : success ? "Added! Redirecting..." : "Add to Cart"}
    </button>
  );
}
