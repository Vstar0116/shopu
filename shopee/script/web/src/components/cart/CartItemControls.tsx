"use client";

import { useState } from "react";

type Props = {
  itemId: number;
  initialQuantity: number;
  onUpdate: () => void;
};

export function CartItemControls({ itemId, initialQuantity, onUpdate }: Props) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/cart/update-item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        setQuantity(newQuantity);
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem() {
    if (!confirm("Remove this item from cart?")) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/cart/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateQuantity(quantity - 1)}
          disabled={loading || quantity <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-900">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => updateQuantity(quantity + 1)}
          disabled={loading}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={removeItem}
        disabled={loading}
        className="text-xs text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "..." : "Remove"}
      </button>
    </div>
  );
}
