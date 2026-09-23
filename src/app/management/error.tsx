"use client";

import { useEffect } from "react";

export default function ManagementError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-800">Halaman ini gagal ditampilkan</h1>
      <p className="mt-2 text-sm text-slate-600">
        Terjadi kesalahan saat memuat halaman. Data yang sudah tersimpan tidak terpengaruh, tetapi isian yang belum
        disimpan mungkin hilang. Coba lagi, atau pilih menu lain.
      </p>
      {error.digest && <p className="mt-2 text-xs text-slate-500">Kode kesalahan: {error.digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
