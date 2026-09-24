"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import AdminThumb from "@/components/management/AdminThumb";
import { RequestError, useApiRequest } from "@/hooks/useCrud";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
};

const DEFAULT_HINT = "Unggah JPG, PNG, atau WebP (maksimal 5 MB), atau isi path di situs ini (diawali /) atau alamat https://.";
const UPLOAD_FAILED = "Gagal mengunggah gambar. Coba lagi.";

// Kolom gambar: tetap menerima path atau URL https, ditambah tombol unggah yang mengisi kolom dengan URL hasil unggahan.
export default function ImageField({ id, label, value, onChange, disabled, required, hint = DEFAULT_HINT }: Props) {
  const request = useApiRequest();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = disabled || uploading;

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const result = (await request("/api/uploads", UPLOAD_FAILED, { method: "POST", body })) as { url?: unknown } | null;
      if (typeof result?.url !== "string") throw new RequestError(UPLOAD_FAILED);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof RequestError ? err.message : UPLOAD_FAILED);
    } finally {
      setUploading(false);
      // Dikosongkan supaya file yang sama bisa dipilih lagi setelah gagal.
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={id}
          type="text"
          inputMode="url"
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          disabled={busy}
          required={required}
          maxLength={2000}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100"
        />
        <AdminThumb src={value} alt={`Pratinjau ${label.toLowerCase()}`} />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" aria-hidden />
          Unggah gambar
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">
        {hint}
      </p>
      <p aria-live="polite" className="mt-1 text-xs text-slate-700">
        {uploading ? "Mengunggah gambar..." : ""}
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
