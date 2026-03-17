"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Address = {
  id: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
};

type Props = {
  addresses: Address[];
};

export function AddressesClient({ addresses: initialAddresses }: Props) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",
    phone: "",
    is_default: false,
  });

  function resetForm() {
    setFormData({
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      zip_code: "",
      country: "India",
      phone: "",
      is_default: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  }

  function handleEdit(address: Address) {
    setFormData({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      phone: address.phone,
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `/api/account/addresses/${editingAddress.id}`
        : "/api/account/addresses";
      
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh addresses
        const refreshResponse = await fetch("/api/account/addresses");
        const data = await refreshResponse.json();
        setAddresses(data.addresses);
        resetForm();
      } else {
        alert("Failed to save address. Please try again.");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAddresses(addresses.filter((a) => a.id !== id));
      } else {
        alert("Failed to delete address.");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className={`rounded-lg ${colors.primary} px-4 py-2 text-sm font-semibold text-white transition-all ${colors.primaryHover}`}
          >
            + Add New Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  required
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                  placeholder="Street address, P.O. box, company name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  required
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className={`w-full rounded-lg border ${colors.border} px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 ring-amber-100`}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-700">Set as default address</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={`flex-1 rounded-lg ${colors.primary} px-4 py-2.5 text-sm font-semibold text-white transition-all ${colors.primaryHover}`}
              >
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`rounded-lg border ${colors.border} px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
            <p className="text-sm text-slate-500">No saved addresses yet</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-2xl border ${
                address.is_default ? "border-amber-300 bg-amber-50" : `${colors.borderLight} ${colors.surface}`
              } p-6 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {address.is_default && (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 mb-2">
                      Default
                    </span>
                  )}
                  <p className="text-sm leading-relaxed text-slate-700">
                    {address.address_line1}
                    {address.address_line2 && <>, {address.address_line2}</>}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {address.city}, {address.state} {address.zip_code}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{address.country}</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">Phone: {address.phone}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
