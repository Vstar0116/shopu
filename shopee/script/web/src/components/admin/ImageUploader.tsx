'use client';

import { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSizeMB?: number;
  bucket?: string;
  folder?: string;
}

export default function ImageUploader({
  onUpload,
  maxFiles = 5,
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  bucket = 'products',
  folder = 'images',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: File[]) => {
    setError('');
    
    // Validate
    const validFiles = files.filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} is too large (max ${maxSizeMB}MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > maxFiles) {
      setError(`You can only upload ${maxFiles} files at once`);
      return;
    }

    if (validFiles.length === 0) {
      return;
    }

    setLoading(true);

    try {
      // Upload files to API
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await res.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      onUpload(urls.filter(Boolean));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    []
  );

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-amber-500 bg-amber-50'
            : 'border-slate-300 bg-slate-50 hover:border-amber-400'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
            <span className="text-sm font-medium text-slate-700">Uploading...</span>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Max {maxFiles} files, {maxSizeMB}MB each
            </p>
            <input
              type="file"
              multiple
              accept={acceptedTypes}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFiles(files);
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
