"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

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
  addons: Addon[];
  onAddonsChange: (selectedAddons: { addon_id: number; quantity: number }[]) => void;
};

export function ProductAddons({ addons, onAddonsChange }: Props) {
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

  if (!addons || addons.length === 0) return null;

  function handleAddonChange(addonId: number, selected: boolean, isRequired: boolean) {
    const newSelected = { ...selectedAddons };
    
    if (selected) {
      newSelected[addonId] = 1;
    } else {
      if (!isRequired) {
        delete newSelected[addonId];
      }
    }
    
    setSelectedAddons(newSelected);
    
    // Convert to array format for parent
    const addonsArray = Object.entries(newSelected).map(([id, quantity]) => ({
      addon_id: parseInt(id),
      quantity
    }));
    onAddonsChange(addonsArray);
  }

  function handleQuantityChange(addonId: number, quantity: number) {
    if (quantity < 1) return;
    
    const newSelected = { ...selectedAddons };
    newSelected[addonId] = quantity;
    setSelectedAddons(newSelected);
    
    const addonsArray = Object.entries(newSelected).map(([id, qty]) => ({
      addon_id: parseInt(id),
      quantity: qty
    }));
    onAddonsChange(addonsArray);
  }

  return (
    <div className={`space-y-4 rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-6`}>
      <h3 className="text-sm font-semibold text-slate-900">
        Add-ons & Extras
      </h3>
      <div className="space-y-3">
        {addons.map((addonLink) => {
          const addon = Array.isArray(addonLink.addon) ? addonLink.addon[0] : addonLink.addon;
          if (!addon) return null;
          
          const isSelected = selectedAddons[addon.id] !== undefined;
          
          return (
            <div
              key={addon.id}
              className={`flex items-start gap-3 rounded-lg border ${
                isSelected ? 'border-amber-300 bg-amber-50' : colors.border + ' bg-white'
              } p-4 transition-all`}
            >
              <input
                type="checkbox"
                checked={isSelected || addonLink.is_required}
                disabled={addonLink.is_required}
                onChange={(e) => handleAddonChange(addon.id, e.target.checked, addonLink.is_required)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {addon.name}
                      {addonLink.is_required && (
                        <span className="ml-2 text-xs font-normal text-amber-600">(Required)</span>
                      )}
                    </p>
                    {addon.description && (
                      <p className="mt-1 text-xs text-slate-600">{addon.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    +₹{Number(addon.price).toLocaleString("en-IN")}
                  </span>
                </div>
                
                {/* Quantity selector for selected addons */}
                {isSelected && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-600">Quantity:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(addon.id, selectedAddons[addon.id] - 1)}
                        disabled={selectedAddons[addon.id] <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {selectedAddons[addon.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(addon.id, selectedAddons[addon.id] + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {addons.some(a => {
        const addon = Array.isArray(a.addon) ? a.addon[0] : a.addon;
        return addon && selectedAddons[addon.id];
      }) && (
        <div className={`border-t ${colors.borderLight} pt-3`}>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Add-ons Total:</span>
            <span className="font-bold text-slate-900">
              +₹{Object.entries(selectedAddons).reduce((total, [id, qty]) => {
                const addonLink = addons.find(a => {
                  const addon = Array.isArray(a.addon) ? a.addon[0] : a.addon;
                  return addon && addon.id === parseInt(id);
                });
                if (!addonLink) return total;
                const addon = Array.isArray(addonLink.addon) ? addonLink.addon[0] : addonLink.addon;
                return total + (addon ? Number(addon.price) * qty : 0);
              }, 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
