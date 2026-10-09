"use client";

import { useEffect } from "react";

// Galat saat merender halaman situs. Muncul di dalam layout grup, jadi navigasi dan footer tetap ada.
// Next 16.3: prop pemulihnya bernama retry (mengambil ulang data dari server). reset hanya merender ulang tanpa mengambil
// ulang, jadi tidak memulihkan galat dari server.
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Halaman ini belum bisa ditampilkan</h1>
      <p className="mt-3 text-slate-600">Ada kendala saat memuat halaman ini. Silakan coba lagi dalam beberapa saat.</p>
      {error.digest && <p className="mt-2 text-xs text-slate-500">Kode kesalahan: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Coba lagi
        </button>
        {/* Tautan biasa supaya dokumen dimuat ulang penuh. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100">
          Ke beranda
        </a>
      </div>
    </section>
  );
}
