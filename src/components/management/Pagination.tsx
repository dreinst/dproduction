"use client";

import { useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZES, type PaginationState } from "@/hooks/usePagination";

type Props = { pagination: Pick<PaginationState, "page" | "totalPages" | "total" | "from" | "to" | "setPage"> };

export default function Pagination({ pagination: p }: Props) {
  const button =
    "inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

  return (
    <nav aria-label="Navigasi halaman tabel" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600" aria-live="polite">
        {p.total ? `Menampilkan ${p.from} sampai ${p.to} dari ${p.total}` : "Tidak ada data untuk ditampilkan"}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={button}
          onClick={() => p.setPage(p.page - 1)}
          aria-disabled={p.page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <span className="whitespace-nowrap text-sm text-slate-600">
          Halaman {p.page} dari {p.totalPages}
        </span>
        <button
          type="button"
          className={button}
          onClick={() => p.setPage(p.page + 1)}
          aria-disabled={p.page >= p.totalPages}
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

export function PageSizeSelect({ pagination: p }: { pagination: Pick<PaginationState, "pageSize" | "setPageSize"> }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <label htmlFor={id}>Tampilkan</label>
      <select
        id={id}
        value={p.pageSize}
        onChange={(e) => p.setPageSize(Number(e.target.value))}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-base pointer-fine:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
      >
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>baris</span>
    </div>
  );
}
