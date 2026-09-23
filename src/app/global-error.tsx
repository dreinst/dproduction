"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
        <title>Terjadi kesalahan | D&apos;Production</title>
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Terjadi kesalahan</h1>
          <p className="mt-2 text-slate-600">Halaman gagal dimuat. Coba lagi dalam beberapa saat.</p>
          {error.digest && <p className="mt-2 text-xs text-slate-500">Kode kesalahan: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
