"use client";

import { useId } from "react";
import { PAGE_SIZES, type PaginationState } from "@/hooks/usePagination";

type Props = {
  pagination: Pick<PaginationState, "page" | "totalPages" | "total" | "from" | "to" | "setPage">;
  // Kata benda datanya, misalnya "item" atau "event". Kalau diisi, kalimatnya mengikuti desain v2: "Menampilkan 7 dari 22 item".
  noun?: string;
};

export default function Pagination({ pagination: p, noun }: Props) {
  const button = "adm-btn adm-btn--sm adm-btn--outline";
  const summary = !p.total
    ? "Tidak ada data untuk ditampilkan"
    : noun
      ? `Menampilkan ${p.to - p.from + 1} dari ${p.total} ${noun}`
      : `Menampilkan ${p.from} sampai ${p.to} dari ${p.total}`;

  return (
    <nav aria-label="Navigasi halaman tabel" className="flex flex-wrap items-start justify-between gap-3">
      <p className="adm-count" aria-live="polite">
        {summary}
      </p>
      {p.totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={button} onClick={() => p.setPage(p.page - 1)} aria-disabled={p.page <= 1}>
            Sebelumnya
          </button>
          <span className="adm-count whitespace-nowrap">
            Halaman {p.page} dari {p.totalPages}
          </span>
          <button
            type="button"
            className={button}
            onClick={() => p.setPage(p.page + 1)}
            aria-disabled={p.page >= p.totalPages}
          >
            Berikutnya
          </button>
        </div>
      )}
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
