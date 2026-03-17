'use client';

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { colors } from '@/lib/uiConfig';

interface ProductImage {
  id?: number;
  product_id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

interface ProductImagesManagerProps {
  productId: number;
  initialImages?: ProductImage[];
}

export default function ProductImagesManager({
  productId,
  initialImages = [],
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/admin/product-images?product_id=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
    }
  };

  const handleUpload = async (urls: string[]) => {
    setLoading(true);
    try {
      // Create image records for each uploaded URL
      const createPromises = urls.map((url, index) =>
        fetch('/api/admin/product-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            image_url: url,
            alt_text: '',
            sort_order: images.length + index,
          }),
        })
      );

      await Promise.all(createPromises);
      await fetchImages();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAltText = async (imageId: number, altText: string) => {
    try {
      const res = await fetch(`/api/admin/product-images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: altText }),
      });

      if (!res.ok) throw new Error('Failed to update alt text');
      
      setImages(
        images.map((img) =>
          img.id === imageId ? { ...img, alt_text: altText } : img
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Delete this image?')) return;

    try {
      const res = await fetch(`/api/admin/product-images/${imageId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete image');

      await fetchImages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...images];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    // Update sort_order
    const updated = reordered.map((img, index) => ({
      ...img,
      sort_order: index,
    }));

    setImages(updated);

    // Save to backend
    try {
      await Promise.all(
        updated.map((img) =>
          fetch(`/api/admin/product-images/${img.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sort_order: img.sort_order }),
          })
        )
      );
    } catch (err) {
      console.error('Failed to reorder:', err);
      await fetchImages(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Product Images</h3>
        <ImageUploader
          onUpload={handleUpload}
          maxFiles={10}
          bucket="products"
          folder="images"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative rounded-xl border-2 border-slate-200 p-2 hover:border-amber-400"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded-full bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                    Primary
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <input
                type="text"
                value={image.alt_text}
                onChange={(e) => handleUpdateAltText(image.id!, e.target.value)}
                placeholder="Alt text..."
                className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none"
              />

              {/* Actions */}
              <div className="mt-2 flex gap-2">
                {index > 0 && (
                  <button
                    onClick={() => handleReorder(index, index - 1)}
                    className="flex-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    onClick={() => handleReorder(index, index + 1)}
                    className="flex-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    →
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image.id!)}
                  className="flex-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
