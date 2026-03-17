'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import FilterBar, { type FilterConfig } from '@/components/admin/FilterBar';

interface Review {
  id: number;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_purchase: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
  products?: {
    name: string;
  };
}

interface ReviewsClientProps {
  reviews: Review[];
}

export default function ReviewsClient({ reviews: initialReviews }: ReviewsClientProps) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(initialReviews);

  const filters: FilterConfig[] = [
    {
      key: 'rating',
      label: 'Rating',
      type: 'multiselect',
      options: [
        { value: '5', label: '5 Stars' },
        { value: '4', label: '4 Stars' },
        { value: '3', label: '3 Stars' },
        { value: '2', label: '2 Stars' },
        { value: '1', label: '1 Star' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      key: 'verified_purchase',
      label: 'Verified Purchase',
      type: 'boolean',
    },
    {
      key: 'date',
      label: 'Review Date',
      type: 'date-range',
    },
  ];

  const handleFilterChange = (activeFilters: Record<string, any>) => {
    let filtered = [...reviews];

    if (activeFilters.rating && activeFilters.rating.length > 0) {
      filtered = filtered.filter((review) =>
        activeFilters.rating.includes(review.rating.toString())
      );
    }

    if (activeFilters.status) {
      filtered = filtered.filter((review) => review.status === activeFilters.status);
    }

    if (activeFilters.verified_purchase) {
      filtered = filtered.filter(
        (review) => review.verified_purchase === (activeFilters.verified_purchase === 'true')
      );
    }

    if (activeFilters.date?.from) {
      filtered = filtered.filter(
        (review) => new Date(review.created_at) >= new Date(activeFilters.date.from)
      );
    }
    if (activeFilters.date?.to) {
      filtered = filtered.filter(
        (review) => new Date(review.created_at) <= new Date(activeFilters.date.to)
      );
    }

    setFilteredReviews(filtered);
  };

  const columns: Column<Review>[] = [
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (review) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < review.rating ? 'text-yellow-400' : 'text-slate-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      ),
    },
    {
      key: 'comment',
      label: 'Review',
      render: (review) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-900 line-clamp-2">{review.comment}</p>
          <p className="mt-1 text-xs text-slate-500">
            by {review.profiles?.full_name || 'Anonymous'}
          </p>
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (review) => (
        <span className="text-sm text-slate-700">{review.products?.name}</span>
      ),
    },
    {
      key: 'verified_purchase',
      label: 'Verified',
      render: (review) =>
        review.verified_purchase ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
        ) : null,
    },
    {
      key: 'status',
      label: 'Status',
      render: (review) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            review.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700'
              : review.status === 'rejected'
              ? 'bg-red-50 text-red-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={() => setFilteredReviews(reviews)}
      />

      <DataTable
        columns={columns}
        data={filteredReviews}
        keyExtractor={(review) => review.id.toString()}
        searchPlaceholder="Search reviews..."
        emptyMessage="No reviews found"
      />
    </div>
  );
}
