"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Props = {
  productId: number;
  productName: string;
  onSuccess?: () => void;
};

export function ReviewForm({ productId, productName, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    body: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          rating: formData.rating,
          title: formData.title || null,
          body: formData.body || null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        if (error.error === "Unauthorized") {
          alert("Please sign in to submit a review");
        } else {
          alert(error.error || "Failed to submit review. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`rounded-2xl border ${colors.borderLight} bg-emerald-50 p-8 text-center`}>
        <svg className="mx-auto h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Review Submitted!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for your feedback. Your review will be published after admin approval.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
      <h3 className="mb-4 text-lg font-bold text-slate-900">Write a Review for {productName}</h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className={`h-8 w-8 ${
                    star <= formData.rating ? "text-amber-400" : "text-slate-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full rounded-lg border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
            placeholder="Summarize your experience"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={5}
            className={`w-full rounded-lg border ${colors.border} px-4 py-2.5 text-sm outline-none ring-amber-100 transition focus:border-amber-500 focus:ring-2`}
            placeholder="Share your thoughts about this product"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl ${colors.primary} px-6 py-3 text-sm font-bold text-white shadow-lg transition-all ${colors.primaryHover} disabled:opacity-50`}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
