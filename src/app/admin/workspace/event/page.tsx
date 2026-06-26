"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Calendar, ArrowRight, ArrowLeft, Search } from "lucide-react";

// Event data from the reference screenshots
const eventsRunning = [
  { id: 1, jobDesc: "QrisMa #Level B", date: "Sabtu, 25 Apr 2026 15:00", client: "Bank Indonesia", status: "running" },
  { id: 2, jobDesc: "Ms. Glow Run #Level A", date: "Minggu, 26 Apr 2026 04:00", client: "MS GLOW", status: "running" },
];

const eventsCompleted = [
  { id: 1, no: 1, waktu: "30 Agt 2025 17:00", klien: "Universitas Ma Chung", event: "Loading Jalan Sehat Machung", deskripsi: "Loading Sound Jalan Sehat di Machung" },
  { id: 2, no: 2, waktu: "5 Agt 2025 07:00", klien: "UNAIR", event: "Loading UNAIR", deskripsi: "Loading UNAIR" },
  { id: 3, no: 3, waktu: "28 Mar 2026 09:00", klien: "Smara WO", event: "Wedding Devrian dan Silvia #Level C", deskripsi: "Wedding di Ijen Suites" },
  { id: 4, no: 4, waktu: "30 Nov 2025 09:00", klien: "Smara WO", event: "Loading Dwita #Level C", deskripsi: "Done" },
  { id: 5, no: 5, waktu: "28 Jul 2025 22:00", klien: "Salsa Nadhif", event: "Launching Album Salsa - The Grove", deskripsi: "Loading Sound Launching Album Salsa" },
  { id: 6, no: 6, waktu: "27 Jul 2025 08:00", klien: "Renta", event: "Loading Sound Ngajum Sae", deskripsi: "Loading Sound Ngajum Sae" },
  { id: 7, no: 7, waktu: "24 Agt 2025 08:00", klien: "Pasbata Prabowo", event: "Pasbata Prabowo", deskripsi: "Cancel" },
  { id: 8, no: 8, waktu: "1 Okt 2025 07:00", klien: "Kemenpolhukam", event: "Polhukam #Level B", deskripsi: "Forum Koordinasi Polhukam" },
  { id: 9, no: 9, waktu: "26 Jun 2025 17:00", klien: "Kemendagri", event: "Loading Sound Savana", deskripsi: "Orderan Mas Supret" },
  { id: 10, no: 10, waktu: "20 Sep 2025 18:30", klien: "Gereja Katolik Paroki Maria Ratu Damai, Banyuwangi", event: "HUT Paroki BWI", deskripsi: "-" },
];

export default function WorkspaceEventPage() {
  const [activeTab, setActiveTab] = useState<"berjalan" | "selesai">("berjalan");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("berjalan")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "berjalan" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Event Berjalan
        </button>
        <button
          onClick={() => setActiveTab("selesai")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "selesai" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Event Selesai
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">
        {activeTab === "berjalan" ? "EVENT BERJALAN" : "EVENT SELESAI"}
      </h1>

      {activeTab === "berjalan" && (
        <>
          <button className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <Plus className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Show</span>
              <input type="number" value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm" />
              <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="px-4 py-3 text-left font-semibold">Job Description</th>
                  <th className="px-4 py-3 text-center font-semibold" colSpan={2}>Jadwal</th>
                  <th className="px-4 py-3 text-left font-semibold">Team Event</th>
                  <th className="px-4 py-3 text-center font-semibold w-28"></th>
                </tr>
                <tr className="bg-slate-700 text-white text-xs">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 text-center">Awal</th>
                  <th className="px-4 py-2 text-center">Akhir</th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {eventsRunning.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="text-slate-800 font-medium">{event.jobDesc}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {event.date}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        <Users className="w-3 h-3 inline mr-1" />
                        {event.client}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">-</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">-</td>
                    <td className="px-4 py-3 text-sm text-slate-600">-</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                          <Users className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-blue-600">
            Showing 1 to {eventsRunning.length} of 82 entries
          </p>
        </>
      )}

      {activeTab === "selesai" && (
        <>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]">
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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="px-3 py-3 text-left font-semibold w-10">No</th>
                  <th className="px-3 py-3 text-left font-semibold">Waktu</th>
                  <th className="px-3 py-3 text-left font-semibold">Klien</th>
                  <th className="px-3 py-3 text-left font-semibold">Event</th>
                  <th className="px-3 py-3 text-left font-semibold">Deskripsi</th>
                  <th className="px-3 py-3 text-left font-semibold">Link Foto</th>
                  <th className="px-3 py-3 text-left font-semibold">Link Video</th>
                  <th className="px-3 py-3 text-center font-semibold">Foto</th>
                  <th className="px-3 py-3 text-center font-semibold">Aktif</th>
                  <th className="px-3 py-3 text-center font-semibold w-16"></th>
                </tr>
              </thead>
              <tbody>
                {eventsCompleted.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs">
                    <td className="px-3 py-2 text-slate-600">{event.no}.</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{event.waktu}</td>
                    <td className="px-3 py-2 text-slate-800 font-medium">{event.klien}</td>
                    <td className="px-3 py-2 text-slate-600">{event.event}</td>
                    <td className="px-3 py-2 text-slate-600">{event.deskripsi}</td>
                    <td className="px-3 py-2 text-blue-500">-</td>
                    <td className="px-3 py-2 text-blue-500">-</td>
                    <td className="px-3 py-2 text-center">-</td>
                    <td className="px-3 py-2 text-center">-</td>
                    <td className="px-3 py-2">
                      <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-blue-600">
            Showing 1 to {eventsCompleted.length} of 45 entries
          </p>
        </>
      )}

      <div className="flex items-center justify-end gap-1">
        <button className="px-3 py-1 text-sm text-slate-400">Previous</button>
        <button className="w-8 h-8 bg-blue-600 text-white rounded text-sm font-medium">1</button>
        <button className="w-8 h-8 text-slate-500 hover:bg-slate-100 rounded text-sm font-medium">2</button>
        <button className="px-3 py-1 text-sm text-slate-400">Next</button>
      </div>
    </div>
  );
}
