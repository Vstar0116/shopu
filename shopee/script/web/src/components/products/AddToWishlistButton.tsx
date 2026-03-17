"use client";

import { useState, useEffect } from "react";
import { colors } from "@/lib/uiConfig";

type Props = {
  productId: number;
  variantId?: number;
};

export function AddToWishlistButton({ productId, variantId }: Props) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);

  // Check if item is in wishlist on mount
  useEffect(() => {
    async function checkWishlist() {
      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();
          const item = data.items?.find((i: any) => 
            i.product_id === productId && 
            (variantId ? i.variant_id === variantId : !i.variant_id)
          );
          if (item) {
            setIsInWishlist(true);
            setWishlistItemId(item.id);
          }
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    }
    
    checkWishlist();
  }, [productId, variantId]);

  async function handleToggleWishlist() {
    setLoading(true);
    
    try {
      if (isInWishlist && wishlistItemId) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsInWishlist(false);
          setWishlistItemId(null);
        } else {
          const error = await response.json();
          if (error.error === "Unauthorized") {
            alert("Please sign in to manage your wishlist");
          } else {
            alert("Failed to remove from wishlist");
          }
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, variantId }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsInWishlist(true);
          setWishlistItemId(data.id);
        } else {
          const error = await response.json();
          if (error.error === "Unauthorized") {
            alert("Please sign in to add to wishlist");
          } else {
            alert("Failed to add to wishlist");
          }
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl border-2 ${
        isInWishlist 
          ? "border-red-500 bg-red-50 text-red-600" 
          : `${colors.border} ${colors.surface} text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600`
      } px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className="h-5 w-5"
        fill={isInWishlist ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {loading ? "..." : isInWishlist ? "Saved" : "Save"}
    </button>
  );
}
