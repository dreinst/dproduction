"use client";

import { useEffect } from "react";
import "./globals.css";

// Cadangan terakhir: dipakai kalau root layout sendiri gagal, atau galat tidak tertangkap error.tsx mana pun.
// Mengganti seluruh dokumen, jadi wajib membawa <html> dan <body> sendiri dan tidak boleh bergantung pada data apa pun.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
        <title>Terjadi kesalahan | D&apos;Production</title>
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Terjadi kesalahan</h1>
          <p className="mt-2 text-slate-600">Halaman gagal dimuat. Silakan coba lagi dalam beberapa saat.</p>
          {error.digest && <p className="mt-2 text-xs text-slate-500">Kode kesalahan: {error.digest}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Coba lagi
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
              Ke beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
