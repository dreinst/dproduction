"use client";

import { useState } from "react";
import { Search, Pencil, Calendar } from "lucide-react";

// Salary data from reference screenshot
const salaryData = [
  { id: 1, waktu: "30 Agt 2025 17:00", klien: "Universitas Ma Chung", event: "Loading Jalan Sehat Machung", deskripsi: "Loading Sound Jalan Sehat di Machung" },
  { id: 2, waktu: "5 Agt 2025 07:00", klien: "UNAIR", event: "Loading UNAIR", deskripsi: "Loading UNAIR" },
  { id: 3, waktu: "28 Mar 2026 09:00", klien: "Smara WO", event: "Wedding Devrian dan Silvia #Level C", deskripsi: "Wedding di Ijen Suites" },
  { id: 4, waktu: "30 Nov 2025 09:00", klien: "Smara WO", event: "Loading Dwita #Level C", deskripsi: "Done" },
  { id: 5, waktu: "28 Jul 2025 22:00", klien: "Salsa Nadhif", event: "Launching Album Salsa - The Grove", deskripsi: "Loading Sound Launching Album Salsa" },
  { id: 6, waktu: "27 Jul 2025 08:00", klien: "Renta", event: "Loading Sound Ngajum Sae", deskripsi: "Loading Sound Ngajum Sae" },
  { id: 7, waktu: "24 Agt 2025 08:00", klien: "Pasbata Prabowo", event: "Pasbata Prabowo", deskripsi: "Cancel" },
  { id: 8, waktu: "1 Okt 2025 07:00", klien: "Kemenpolhukam", event: "Polhukam #Level B", deskripsi: "Forum Koordinasi Polhukam" },
  { id: 9, waktu: "26 Jun 2025 17:00", klien: "Kemendagri", event: "Loading Sound Savana", deskripsi: "Orderan Mas Supret" },
  { id: 10, waktu: "20 Sep 2025 18:30", klien: "Gereja Katolik Paroki", event: "HUT Paroki BWI", deskripsi: "-" },
  { id: 11, waktu: "25 Okt 2025 08:00", klien: "D Production", event: "DKT #Level C", deskripsi: "DKT" },
  { id: 12, waktu: "28 Nov 2025 17:00", klien: "D Production", event: "Birthday Arabian #Level C", deskripsi: "78th Rien Sahoor Birthday" },
  { id: 13, waktu: "21 Sep 2025 04:00", klien: "D Production", event: "Double Tree #Level C", deskripsi: "-" },
  { id: 14, waktu: "21 Sep 2025 05:00", klien: "D Production", event: "Double Tree #Level C", deskripsi: "-" },
  { id: 15, waktu: "18 Jan 2026 04:00", klien: "D Production", event: "EMBA JETBUS RUN #Level C", deskripsi: "EMBA JETBUS RUN MALANG 10K" },
  { id: 16, waktu: "30 Nov 2025 08:00", klien: "D Production", event: "Loading SanMar #Level C", deskripsi: "-" },
  { id: 17, waktu: "9 Sep 2025 09:00", klien: "D Production", event: "Kerja PR #Level A", deskripsi: "-" },
  { id: 18, waktu: "31 Des 2025 18:00", klien: "D Production", event: "New Year - eL Hotel", deskripsi: "New Year Eve eL Hotel" },
  { id: 19, waktu: "16 Nov 2025 08:00", klien: "D Production", event: "Dempo OMK #Level C", deskripsi: "OMK DEMAKO YUBILEUM" },
  { id: 20, waktu: "12 Okt 2025 06:00", klien: "D Production", event: "HUT SSK #Level C", deskripsi: "SSK 20TH" },
  { id: 21, waktu: "15 Nov 2025 09:00", klien: "D Production", event: "Loading KDS #Level C", deskripsi: "Loading KDS" },
  { id: 22, waktu: "5 Okt 2025 05:30", klien: "D Production", event: "Loading Dragon King #Level C", deskripsi: "-" },
  { id: 23, waktu: "8 Agt 2025 21:00", klien: "D Production", event: "Loading Tunjungsekar", deskripsi: "Loading Sound Tunjungsekar" },
  { id: 24, waktu: "5 Des 2025 08:00", klien: "D Production", event: "Reuni Teratai #Level C", deskripsi: "Reuni Teratai" },
  { id: 25, waktu: "28 Des 2025 08:00", klien: "D Production", event: "Loading Ijen Suites #Level C", deskripsi: "-" },
  { id: 26, waktu: "27 Des 2025 10:30", klien: "D Production", event: "Beres-beres kantor #Level C", deskripsi: "-" },
  { id: 27, waktu: "31 Des 2025 09:00", klien: "D Production", event: "Loading Ibis #Level C", deskripsi: "-" },
  { id: 28, waktu: "18 Jul 2025 15:30", klien: "Cuddle Me", event: "Cuddleme - Employee Gathering 2025", deskripsi: "Gathering Karyawan Cuddle Me" },
  { id: 29, waktu: "19 Jul 2025 13:15", klien: "BRI", event: "Starlink BRI Bromo", deskripsi: "Starlink BRI Bromo" },
  { id: 30, waktu: "1 Jul 2025 18:00", klien: "Bentoel Group", event: "Meeting Online", deskripsi: "Meeting Online" },
  { id: 31, waktu: "21 Agt 2025 08:00", klien: "Bank Indonesia Institute", event: "BINS", deskripsi: "BINS Goes To Campus" },
  { id: 32, waktu: "11 Nov 2025 08:00", klien: "BI Sulteng", event: "BI Sulteng #Level B", deskripsi: "Capacity Building Petani Cabai & Bawang Merah" },
  { id: 33, waktu: "14 Nov 2025 09:00", klien: "BI Kalbar", event: "BI Kalbar Bogor #Level B", deskripsi: "Bi Kalbar Bogor One Big Family" },
  { id: 34, waktu: "8 Nov 2025 09:00", klien: "Bank Indonesia", event: "CB BI Kalbar #Level B", deskripsi: "Capacity Building Kopi & Hebitren BI Kalbar" },
  { id: 35, waktu: "11 Nov 2025 08:00", klien: "Bank Indonesia", event: "BI JKT PonPes #Level B", deskripsi: "Bi Jakarta CB PonPes" },
  { id: 36, waktu: "29 Nov 2025 08:00", klien: "Bank Indonesia", event: "BI DSPK #Level B", deskripsi: "Capacity Building DSPK" },
  { id: 37, waktu: "29 Sep 2025 08:00", klien: "Bank Indonesia", event: "Kuliah Kebangsaan #Level B", deskripsi: "Kuliah Kebangsaan BI UM bersama Sandiaga Uno &" },
  { id: 38, waktu: "6 Agt 2025 19:00", klien: "Bank Indonesia", event: "BI PQN QJI 2025", deskripsi: "Bank Indonesia Malang - Pekan QRIS Nasional &" },
  { id: 39, waktu: "21 Jul 2025 08:00", klien: "Bank Indonesia", event: "Loading BI", deskripsi: "Loading Sound BI" },
  { id: 40, waktu: "15 Jul 2025 08:00", klien: "Bank Indonesia", event: "Temu Responden - BI Malang", deskripsi: "Temu Responden Bank Indonesia Malang" },
  { id: 41, waktu: "26 Jun 2025 06:00", klien: "Bank Indonesia", event: "Event BI Kalbar", deskripsi: "Bank Indonesia Kalimantan Barat" },
  { id: 42, waktu: "28 Jan 2026 09:00", klien: "Bank Indonesia", event: "Pasar Santri #Level B", deskripsi: "BI Pasar Santri Sidogin" },
  { id: 43, waktu: "14 Mar 2026 08:00", klien: "Bank Indonesia", event: "Serambi BI #Level C", deskripsi: "Event Serambi 2026 Malang & Pasuruan 14-15 Maret" },
  { id: 44, waktu: "28 Jun 2025 12:00", klien: "Bank Indonesia", event: "D'Pro Bromo BI Kalbar", deskripsi: "Crew D'Pro" },
  { id: 45, waktu: "25 Apr 2026 15:00", klien: "Bank Indonesia", event: "QrisMa #Level B", deskripsi: "Qris Malang BI (17-22 April 2026) di Kayutangan" },
  { id: 46, waktu: "27 Jun 2025 08:00", klien: "Bank Indonesia", event: "Gathering BI Kalbar", deskripsi: "Bank Indonesia Prov Kalimantan Barat" },
  { id: 47, waktu: "26 Apr 2026 04:00", klien: "MS GLOW", event: "Ms. Glow Run #Level A", deskripsi: "Event Running Ms Glow for men" },
  { id: 48, waktu: "14 Mar 2026 08:00", klien: "Bank Indonesia", event: "Event BI Kalbar", deskripsi: "Bank Indonesia Kalimantan Barat" },
  { id: 49, waktu: "15 Mar 2026 09:00", klien: "Aice", event: "Gathering Aice Malang #Level C", deskripsi: "10th years Aice Malang di Atria" },
];

export default function WorkspaceSalaryPage() {
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = salaryData.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.klien.toLowerCase().includes(q) || s.event.toLowerCase().includes(q) || s.deskripsi.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">SALARY EVENT</h1>

      <div>
        <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]">
          <option>Aktif</option>
          <option>Semua</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input type="number" value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm" />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-3 py-3 text-left font-semibold w-10">No</th>
              <th className="px-3 py-3 text-left font-semibold">Waktu</th>
              <th className="px-3 py-3 text-left font-semibold">Klien</th>
              <th className="px-3 py-3 text-left font-semibold">Event</th>
              <th className="px-3 py-3 text-left font-semibold">Deskripsi</th>
              <th className="px-3 py-3 text-center font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, showEntries).map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs">
                <td className="px-3 py-2 text-slate-600">{idx + 1}.</td>
                <td className="px-3 py-2 text-blue-600 whitespace-nowrap">{item.waktu}</td>
                <td className="px-3 py-2 text-slate-800 font-medium">{item.klien}</td>
                <td className="px-3 py-2 text-slate-600">{item.event}</td>
                <td className="px-3 py-2 text-slate-600">{item.deskripsi}</td>
                <td className="px-3 py-2 text-center">
                  <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing 1 to {Math.min(filtered.length, showEntries)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 text-sm text-slate-400">Previous</button>
          <button className="w-8 h-8 bg-blue-600 text-white rounded text-sm font-medium">1</button>
          <button className="px-3 py-1 text-sm text-slate-400">Next</button>
        </div>
      </div>
    </div>
  );
}
