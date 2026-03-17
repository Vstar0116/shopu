"use client";

import { useState } from "react";
import { colors } from "@/lib/uiConfig";

type Props = {
  label: string;
  required?: boolean;
  accept?: string;
  onChange: (fileUrl: string | null) => void;
};

export function FileUpload({ label, required, accept = "image/*", onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      onChange(null);
      setFileName(null);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFileName(file.name);
      onChange(data.url);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file. Please try again.");
      onChange(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="file"
          onChange={handleFileChange}
          accept={accept}
          disabled={uploading}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border ${colors.border} bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {uploading ? "Uploading..." : fileName ? "Change File" : "Choose File"}
        </label>
      </label>
      {fileName && (
        <p className="text-xs text-slate-600">
          Selected: <span className="font-medium">{fileName}</span>
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
