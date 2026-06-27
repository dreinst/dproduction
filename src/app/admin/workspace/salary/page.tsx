"use client";

import { useState } from "react";
import { Search, Pencil, X } from "lucide-react";

interface SalaryEntry {
  id: number;
  waktu: string;
  klien: string;
  event: string;
  deskripsi: string;
  active: boolean;
}

// Salary data from reference screenshot (with active flag added)
const initialSalaryData: SalaryEntry[] = [
  { id: 1, waktu: "30 Agt 2025 17:00", klien: "Universitas Ma Chung", event: "Loading Jalan Sehat Machung", deskripsi: "Loading Sound Jalan Sehat di Machung", active: true },
  { id: 2, waktu: "5 Agt 2025 07:00", klien: "UNAIR", event: "Loading UNAIR", deskripsi: "Loading UNAIR", active: true },
  { id: 3, waktu: "28 Mar 2026 09:00", klien: "Smara WO", event: "Wedding Devrian dan Silvia #Level C", deskripsi: "Wedding di Ijen Suites", active: true },
  { id: 4, waktu: "30 Nov 2025 09:00", klien: "Smara WO", event: "Loading Dwita #Level C", deskripsi: "Done", active: true },
  { id: 5, waktu: "28 Jul 2025 22:00", klien: "Salsa Nadhif", event: "Launching Album Salsa - The Grove", deskripsi: "Loading Sound Launching Album Salsa", active: true },
  { id: 6, waktu: "27 Jul 2025 08:00", klien: "Renta", event: "Loading Sound Ngajum Sae", deskripsi: "Loading Sound Ngajum Sae", active: true },
  { id: 7, waktu: "24 Agt 2025 08:00", klien: "Pasbata Prabowo", event: "Pasbata Prabowo", deskripsi: "Cancel", active: false },
  { id: 8, waktu: "1 Okt 2025 07:00", klien: "Kemenpolhukam", event: "Polhukam #Level B", deskripsi: "Forum Koordinasi Polhukam", active: true },
  { id: 9, waktu: "26 Jun 2025 17:00", klien: "Kemendagri", event: "Loading Sound Savana", deskripsi: "Orderan Mas Supret", active: true },
  { id: 10, waktu: "20 Sep 2025 18:30", klien: "Gereja Katolik Paroki", event: "HUT Paroki BWI", deskripsi: "-", active: true },
  { id: 11, waktu: "25 Okt 2025 08:00", klien: "D Production", event: "DKT #Level C", deskripsi: "DKT", active: true },
  { id: 12, waktu: "28 Nov 2025 17:00", klien: "D Production", event: "Birthday Arabian #Level C", deskripsi: "78th Rien Sahoor Birthday", active: true },
  { id: 13, waktu: "21 Sep 2025 04:00", klien: "D Production", event: "Double Tree #Level C", deskripsi: "-", active: true },
  { id: 14, waktu: "21 Sep 2025 05:00", klien: "D Production", event: "Double Tree #Level C", deskripsi: "-", active: true },
  { id: 15, waktu: "18 Jan 2026 04:00", klien: "D Production", event: "EMBA JETBUS RUN #Level C", deskripsi: "EMBA JETBUS RUN MALANG 10K", active: true },
  { id: 16, waktu: "30 Nov 2025 08:00", klien: "D Production", event: "Loading SanMar #Level C", deskripsi: "-", active: true },
  { id: 17, waktu: "9 Sep 2025 09:00", klien: "D Production", event: "Kerja PR #Level A", deskripsi: "-", active: true },
  { id: 18, waktu: "31 Des 2025 18:00", klien: "D Production", event: "New Year - eL Hotel", deskripsi: "New Year Eve eL Hotel", active: true },
  { id: 19, waktu: "16 Nov 2025 08:00", klien: "D Production", event: "Dempo OMK #Level C", deskripsi: "OMK DEMAKO YUBILEUM", active: true },
  { id: 20, waktu: "12 Okt 2025 06:00", klien: "D Production", event: "HUT SSK #Level C", deskripsi: "SSK 20TH", active: true },
  { id: 21, waktu: "15 Nov 2025 09:00", klien: "D Production", event: "Loading KDS #Level C", deskripsi: "Loading KDS", active: true },
  { id: 22, waktu: "5 Okt 2025 05:30", klien: "D Production", event: "Loading Dragon King #Level C", deskripsi: "-", active: true },
  { id: 23, waktu: "8 Agt 2025 21:00", klien: "D Production", event: "Loading Tunjungsekar", deskripsi: "Loading Sound Tunjungsekar", active: true },
  { id: 24, waktu: "5 Des 2025 08:00", klien: "D Production", event: "Reuni Teratai #Level C", deskripsi: "Reuni Teratai", active: true },
  { id: 25, waktu: "28 Des 2025 08:00", klien: "D Production", event: "Loading Ijen Suites #Level C", deskripsi: "-", active: true },
  { id: 26, waktu: "27 Des 2025 10:30", klien: "D Production", event: "Beres-beres kantor #Level C", deskripsi: "-", active: true },
  { id: 27, waktu: "31 Des 2025 09:00", klien: "D Production", event: "Loading Ibis #Level C", deskripsi: "-", active: true },
  { id: 28, waktu: "18 Jul 2025 15:30", klien: "Cuddle Me", event: "Cuddleme - Employee Gathering 2025", deskripsi: "Gathering Karyawan Cuddle Me", active: true },
  { id: 29, waktu: "19 Jul 2025 13:15", klien: "BRI", event: "Starlink BRI Bromo", deskripsi: "Starlink BRI Bromo", active: true },
  { id: 30, waktu: "1 Jul 2025 18:00", klien: "Bentoel Group", event: "Meeting Online", deskripsi: "Meeting Online", active: true },
  { id: 31, waktu: "21 Agt 2025 08:00", klien: "Bank Indonesia Institute", event: "BINS", deskripsi: "BINS Goes To Campus", active: true },
  { id: 32, waktu: "11 Nov 2025 08:00", klien: "BI Sulteng", event: "BI Sulteng #Level B", deskripsi: "Capacity Building Petani Cabai & Bawang Merah", active: true },
  { id: 33, waktu: "14 Nov 2025 09:00", klien: "BI Kalbar", event: "BI Kalbar Bogor #Level B", deskripsi: "Bi Kalbar Bogor One Big Family", active: true },
  { id: 34, waktu: "8 Nov 2025 09:00", klien: "Bank Indonesia", event: "CB BI Kalbar #Level B", deskripsi: "Capacity Building Kopi & Hebitren BI Kalbar", active: true },
  { id: 35, waktu: "11 Nov 2025 08:00", klien: "Bank Indonesia", event: "BI JKT PonPes #Level B", deskripsi: "Bi Jakarta CB PonPes", active: true },
  { id: 36, waktu: "29 Nov 2025 08:00", klien: "Bank Indonesia", event: "BI DSPK #Level B", deskripsi: "Capacity Building DSPK", active: true },
  { id: 37, waktu: "29 Sep 2025 08:00", klien: "Bank Indonesia", event: "Kuliah Kebangsaan #Level B", deskripsi: "Kuliah Kebangsaan BI UM bersama Sandiaga Uno &", active: true },
  { id: 38, waktu: "6 Agt 2025 19:00", klien: "Bank Indonesia", event: "BI PQN QJI 2025", deskripsi: "Bank Indonesia Malang - Pekan QRIS Nasional &", active: true },
  { id: 39, waktu: "21 Jul 2025 08:00", klien: "Bank Indonesia", event: "Loading BI", deskripsi: "Loading Sound BI", active: true },
  { id: 40, waktu: "15 Jul 2025 08:00", klien: "Bank Indonesia", event: "Temu Responden - BI Malang", deskripsi: "Temu Responden Bank Indonesia Malang", active: true },
  { id: 41, waktu: "26 Jun 2025 06:00", klien: "Bank Indonesia", event: "Event BI Kalbar", deskripsi: "Bank Indonesia Kalimantan Barat", active: true },
  { id: 42, waktu: "28 Jan 2026 09:00", klien: "Bank Indonesia", event: "Pasar Santri #Level B", deskripsi: "BI Pasar Santri Sidogin", active: true },
  { id: 43, waktu: "14 Mar 2026 08:00", klien: "Bank Indonesia", event: "Serambi BI #Level C", deskripsi: "Event Serambi 2026 Malang & Pasuruan 14-15 Maret", active: true },
  { id: 44, waktu: "28 Jun 2025 12:00", klien: "Bank Indonesia", event: "D'Pro Bromo BI Kalbar", deskripsi: "Crew D'Pro", active: true },
  { id: 45, waktu: "25 Apr 2026 15:00", klien: "Bank Indonesia", event: "QrisMa #Level B", deskripsi: "Qris Malang BI (17-22 April 2026) di Kayutangan", active: true },
  { id: 46, waktu: "27 Jun 2025 08:00", klien: "Bank Indonesia", event: "Gathering BI Kalbar", deskripsi: "Bank Indonesia Prov Kalimantan Barat", active: true },
  { id: 47, waktu: "26 Apr 2026 04:00", klien: "MS GLOW", event: "Ms. Glow Run #Level A", deskripsi: "Event Running Ms Glow for men", active: true },
  { id: 48, waktu: "14 Mar 2026 08:00", klien: "Bank Indonesia", event: "Event BI Kalbar", deskripsi: "Bank Indonesia Kalimantan Barat", active: true },
  { id: 49, waktu: "15 Mar 2026 09:00", klien: "Aice", event: "Gathering Aice Malang #Level C", deskripsi: "10th years Aice Malang di Atria", active: true },
];

export default function WorkspaceSalaryPage() {
  const [salaryData, setSalaryData] = useState<SalaryEntry[]>(initialSalaryData);
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<SalaryEntry | null>(null);
  const [formData, setFormData] = useState({
    waktu: "",
    klien: "",
    event: "",
    deskripsi: "",
    active: true,
  });

  const filtered = salaryData.filter((s) => {
    if (statusFilter === "Aktif" && !s.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.klien.toLowerCase().includes(q) || s.event.toLowerCase().includes(q) || s.deskripsi.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / showEntries) || 1;
  const paginatedSalary = filtered.slice((page - 1) * showEntries, page * showEntries);

  const handleOpenEdit = (entry: SalaryEntry) => {
    setCurrentEditing(entry);
    setFormData({
      waktu: entry.waktu,
      klien: entry.klien,
      event: entry.event,
      deskripsi: entry.deskripsi,
      active: entry.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (currentEditing) {
      setSalaryData((prev) =>
        prev.map((s) => (s.id === currentEditing.id ? { ...s, ...formData } : s))
      );
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">SALARY EVENT</h1>

      <div>
        <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
        <select 
          value={statusFilter} 
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }} 
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]"
        >
          <option value="Aktif">Aktif</option>
          <option value="Semua">Semua</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input 
            type="number" 
            value={showEntries} 
            onChange={(e) => {
              setShowEntries(Number(e.target.value) || 1);
              setPage(1);
            }} 
            className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
          />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }} 
            className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
          />
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
            {paginatedSalary.map((item, idx) => (
              <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs ${!item.active ? 'opacity-50' : ''}`}>
                <td className="px-3 py-2 text-slate-600">{(page - 1) * showEntries + idx + 1}.</td>
                <td className="px-3 py-2 text-blue-600 whitespace-nowrap">{item.waktu}</td>
                <td className="px-3 py-2 text-slate-800 font-medium">{item.klien}</td>
                <td className="px-3 py-2 text-slate-600">{item.event}</td>
                <td className="px-3 py-2 text-slate-600">{item.deskripsi}</td>
                <td className="px-3 py-2 text-center">
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedSalary.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing {paginatedSalary.length > 0 ? (page - 1) * showEntries + 1 : 0} to{" "}
          {Math.min(page * showEntries, filtered.length)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            Previous
          </button>
          <button className="w-8 h-8 bg-blue-600 text-white rounded text-sm font-medium">
            {page}
          </button>
          <button 
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Salary Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Waktu</label>
                <input
                  type="text"
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Klien</label>
                <input
                  type="text"
                  value={formData.klien}
                  onChange={(e) => setFormData({ ...formData, klien: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Event</label>
                <input
                  type="text"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  rows={3}
                ></textarea>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Aktif</span>
              </label>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
