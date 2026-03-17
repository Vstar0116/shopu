"use client";

import { useState } from "react";
import { VariantSelector } from "@/components/products/VariantSelector";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { FileUpload } from "@/components/customer/FileUpload";
import { ProductAddons } from "@/components/products/ProductAddons";
import { AddToWishlistButton } from "@/components/products/AddToWishlistButton";
import { colors } from "@/lib/uiConfig";

type Variant = {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  stock_quantity?: number | null;
};

type CustomizationOption = {
  id: number;
  key: string;
  label: string;
  type: string;
  required: boolean;
  config?: {
    options?: string[];
    [key: string]: any;
  } | null;
};

type Addon = {
  id: number;
  is_required: boolean;
  addon: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    addon_type: string;
    is_active: boolean;
  } | {
    id: number;
    name: string;
    description: string | null;
    price: string;
    addon_type: string;
    is_active: boolean;
  }[];
};

type Props = {
  productId: number;
  variants: Variant[];
  customizationOptions: CustomizationOption[];
  addons?: Addon[];
};

export function ProductClientWrapper({ productId, variants, customizationOptions, addons = [] }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(
    variants.length > 0 ? variants[0].id : undefined
  );
  const [customizationData, setCustomizationData] = useState<Record<string, any>>({});
  const [selectedAddons, setSelectedAddons] = useState<{ addon_id: number; quantity: number }[]>([]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  function handleCustomizationChange(key: string, value: any) {
    setCustomizationData(prev => ({ ...prev, [key]: value }));
  }

  return (
    <>
      {/* Pricing */}
      {selectedVariant && (
        <div className={`space-y-3 rounded-2xl border ${colors.borderLight} bg-gradient-to-br from-amber-50 to-orange-50 p-6`}>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{Number(selectedVariant.price).toLocaleString("en-IN")}
            </span>
            {selectedVariant.compare_at_price &&
              Number(selectedVariant.compare_at_price) > Number(selectedVariant.price) && (
                <span className="text-sm text-slate-500 line-through">
                  ₹{Number(selectedVariant.compare_at_price).toLocaleString("en-IN")}
                </span>
              )}
          </div>
          <p className="text-xs text-slate-600">
            Price includes frame and ready-to-hang installation. Free shipping nationwide.
          </p>
          {/* Stock Badge */}
          {selectedVariant.stock_quantity !== undefined && selectedVariant.stock_quantity !== null && (
            <div className="pt-2">
              {selectedVariant.stock_quantity > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {selectedVariant.stock_quantity <= 5 
                    ? `Only ${selectedVariant.stock_quantity} left in stock!` 
                    : "In Stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of Stock
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Variants Selection */}
      {variants.length > 0 && (
        <VariantSelector
          variants={variants}
          onVariantSelect={setSelectedVariantId}
        />
      )}

      {/* Product Add-ons */}
      {addons.length > 0 && (
        <ProductAddons addons={addons} onAddonsChange={setSelectedAddons} />
      )}

      {/* Customization Options */}
      {customizationOptions.length > 0 && (
        <div className={`space-y-4 rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-6`}>
          <h3 className="text-sm font-semibold text-slate-900">
            Personalization Options
          </h3>
          <div className="space-y-3">
            {customizationOptions.map((opt) => (
              <div key={opt.id} className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  {opt.label}
                  {opt.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                {opt.type === "text" ? (
                  <input
                    type="text"
                    value={customizationData[opt.key] || ""}
                    onChange={(e) => handleCustomizationChange(opt.key, e.target.value)}
                    required={opt.required}
                    className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  />
                ) : opt.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={customizationData[opt.key] || ""}
                    onChange={(e) => handleCustomizationChange(opt.key, e.target.value)}
                    required={opt.required}
                    className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  />
                ) : opt.type === "select" && opt.config?.options ? (
                  <select
                    value={customizationData[opt.key] || ""}
                    onChange={(e) => handleCustomizationChange(opt.key, e.target.value)}
                    required={opt.required}
                    className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
                  >
                    <option value="">Select an option...</option>
                    {opt.config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : opt.type === "multi_select" && opt.config?.options ? (
                  <div className="space-y-2">
                    {opt.config.options.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(customizationData[opt.key] as string[] || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = (customizationData[opt.key] as string[]) || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v) => v !== option);
                            handleCustomizationChange(opt.key, newValues);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-slate-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : opt.type === "file" ? (
                  <FileUpload
                    label={opt.label}
                    required={opt.required}
                    onChange={(fileUrl) => handleCustomizationChange(opt.key, fileUrl)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <div className="flex gap-3">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariantId}
          quantity={1}
          customizationData={Object.keys(customizationData).length > 0 ? customizationData : undefined}
          selectedAddons={selectedAddons.length > 0 ? selectedAddons : undefined}
          disabled={selectedVariant?.stock_quantity === 0}
        />
        <AddToWishlistButton productId={productId} variantId={selectedVariantId} />
      </div>
    </>
  );
}
