"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Variant = {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
};

type Props = {
  variants: Variant[];
  onVariantSelect: (variantId: number) => void;
};

export function VariantSelector({ variants, onVariantSelect }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(
    variants.length > 0 ? variants[0].id : null
  );

  function handleSelect(id: number) {
    setSelectedId(id);
    onVariantSelect(id);
  }

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-900">
        Select Size & Frame
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => handleSelect(variant.id)}
            className={`group rounded-xl border-2 p-4 text-left transition-all ${
              selectedId === variant.id
                ? `border-amber-500 bg-amber-50`
                : `${colors.border} ${colors.surface} hover:border-amber-300 hover:bg-amber-50`
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                selectedId === variant.id
                  ? "text-amber-700"
                  : "text-slate-900 group-hover:text-amber-600"
              }`}
            >
              {variant.title}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-700">
              ₹{Number(variant.price).toLocaleString("en-IN")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
