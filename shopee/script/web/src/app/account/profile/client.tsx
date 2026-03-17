"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Props = {
  profile: Profile | null;
  email: string;
};

export function ProfileClient({ profile, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
      <h2 className="mb-6 text-xl font-bold text-slate-900">Profile Information</h2>

      {success && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className={`w-full rounded-lg border ${colors.border} bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-slate-500">
            Email is managed by your account settings and cannot be changed here
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className={`w-full rounded-lg border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full rounded-lg border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
            placeholder="Enter your phone number"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 rounded-xl ${colors.primary} px-6 py-3 text-sm font-bold text-white shadow-lg transition-all ${colors.primaryHover} disabled:opacity-50`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
