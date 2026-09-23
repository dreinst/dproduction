"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface DatabaseItem {
  id: number;
  table: string;
  name: string;
  href: string;
  records: number;
  lastUpdated: string | null;
}

const formatWib = (iso: string) =>
  `${new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB`;

export default function DatabasePage() {
  const { data, loading, error } = useCrud<DatabaseItem>({ endpoint: "/api/database" });
  const [searchQuery, setSearchQuery] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const rows = data.filter((t) => !q || t.name.toLowerCase().includes(q) || t.table.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Database</h1>

      <div className="relative w-full sm:w-72 sm:ml-auto">
        <label htmlFor="db-search" className="sr-only">
          Cari nama modul atau tabel
        </label>
        <input
          id="db-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama modul atau tabel"
          className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data tabel...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold w-12">No</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Modul</th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold">Jumlah Data</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Update Terakhir</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
                  <td className="px-3 sm:px-4 py-3 text-sm">
                    <span className="block font-medium text-slate-800">{entry.name}</span>
                    <span className="block text-xs text-slate-500">Tabel {entry.table}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-slate-700 text-right">{entry.records}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-slate-700">
                    {entry.lastUpdated ? formatWib(entry.lastUpdated) : "Belum ada data"}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <Link
                      href={entry.href}
                      className="inline-flex items-center gap-1 p-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`Buka halaman ${entry.name}`}
                    >
                      <span className="hidden sm:inline">Buka</span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                    Tidak ada tabel yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
