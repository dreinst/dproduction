"use client";

import React, { useState } from "react";
import { Search, Eye } from "lucide-react";

interface DatabaseItem {
  id: number;
  name: string;
  records: number;
  lastUpdated: string;
}

// Sample database entries
const initialData: DatabaseItem[] = [
  { id: 1, name: "Tabel Klien", records: 17, lastUpdated: "26 Jun 2026" },
  { id: 2, name: "Tabel Event", records: 49, lastUpdated: "26 Jun 2026" },
  { id: 3, name: "Tabel Team", records: 36, lastUpdated: "26 Jun 2026" },
  { id: 4, name: "Tabel Rental", records: 12, lastUpdated: "25 Jun 2026" },
  { id: 5, name: "Tabel Galeri Foto", records: 9, lastUpdated: "27 Apr 2026" },
  { id: 6, name: "Tabel Galeri Video", records: 2, lastUpdated: "27 Apr 2026" },
];

export default function DatabasePage() {
  const [data, setData] = useState<DatabaseItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEntries, setShowEntries] = useState(50);

  const filteredRaw = data.filter((e) =>
    searchQuery
      ? e.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );
  
  const filtered = filteredRaw.slice(0, showEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 uppercase">Database</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div></div> {/* Spacer instead of Add button */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <div className="relative">
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
             <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-left font-semibold">Nama Tabel</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Total Records</th>
              <th className="px-4 py-3 text-left font-semibold w-40">Update Terakhir</th>
              <th className="px-4 py-3 text-center font-semibold w-28">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, idx) => (
              <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{entry.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{entry.records}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{entry.lastUpdated}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => alert(`Detail data ${entry.name}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Lihat Detail">
                    <Eye className="w-4 h-4 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                 <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-blue-600">Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filteredRaw.length} entries</p>
    </div>
  );
}
