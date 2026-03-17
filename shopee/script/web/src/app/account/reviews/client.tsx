"use client";

import Link from "next/link";
import { colors } from "@/lib/uiConfig";

type Review = {
  id: number;
  product_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  is_published: boolean;
  created_at: string;
  products: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type Props = {
  reviews: Review[];
};

export function ReviewsClient({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className={`rounded-2xl border ${colors.borderLight} ${colors.surfaceAlt} p-12 text-center`}>
        <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No reviews yet</h3>
        <p className="mt-2 text-sm text-slate-600">
          Purchase products and share your experience with reviews
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">
        My Reviews ({reviews.length})
      </h2>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`rounded-2xl border ${colors.borderLight} ${colors.surface} p-6 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Product Link */}
                {review.products && (
                  <Link
                    href={`/products/${review.products.slug}`}
                    className="text-sm font-semibold text-slate-900 hover:text-amber-600"
                  >
                    {review.products.name}
                  </Link>
                )}

                {/* Rating */}
                <div className="mt-2 flex gap-1">
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
                  <h4 className="mt-3 text-sm font-semibold text-slate-900">{review.title}</h4>
                )}

                {/* Review Body */}
                {review.body && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.body}</p>
                )}

                {/* Meta Info */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                  <span>•</span>
                  <span className={`rounded-full px-2 py-0.5 ${
                    review.is_published
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {review.is_published ? "Published" : "Pending Approval"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
