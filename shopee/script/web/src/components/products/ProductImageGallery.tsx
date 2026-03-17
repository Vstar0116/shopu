"use client";

import { useState } from "react";
import Image from "next/image";
import { colors } from "@/lib/uiConfig";

type ProductImage = {
  id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images
  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
          <div className="aspect-square w-full flex items-center justify-center">
            <svg
              className="h-24 w-24 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
        <div className="relative aspect-square w-full">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || productName}
            fill
            className="object-cover"
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === index
                  ? `border-amber-500 ring-2 ring-amber-200`
                  : `${colors.border} hover:border-amber-300 hover:shadow-md`
              }`}
            >
              <div className="relative h-full w-full bg-slate-100">
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
