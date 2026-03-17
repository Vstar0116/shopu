"use client";

import { colors } from "@/lib/uiConfig";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
  } | {
    full_name: string | null;
  }[];
};

type Props = {
  reviews: Review[];
  productName: string;
};

export function ProductReviews({ reviews, productName }: Props) {
  if (reviews.length === 0) {
    return (
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-8 text-center`}>
        <p className="text-sm text-slate-500">No reviews yet. Be the first to review {productName}!</p>
      </div>
    );
  }

  // Calculate statistics
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => 
    reviews.filter(r => r.rating === star).length
  );

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}>
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
            <div className="mt-2 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating) ? "text-amber-400" : "text-slate-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600">{reviews.length} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = ratingCounts[idx];
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-slate-600">{star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-slate-600 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Customer Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border ${colors.borderLight} ${colors.surface} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "text-amber-400" : "text-slate-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="mt-2 text-sm font-semibold text-slate-900">{review.title}</h4>
                  )}

                  {/* Review Body */}
                  {review.body && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.body}</p>
                  )}

                  {/* Reviewer Info */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {Array.isArray(review.profile) 
                        ? (review.profile[0]?.full_name || "Anonymous")
                        : (review.profile?.full_name || "Anonymous")
                      }
                    </span>
                    <span>•</span>
                    <span>{new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
