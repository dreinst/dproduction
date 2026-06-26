"use client";

import { useState } from "react";

// Event report cards data from reference screenshot
const reportEvents = [
  { id: 1, title: "EVENT BI KALBAR", date: 26, month: "JUN '25", time: "06:00", client: "Bank Indonesia" },
  { id: 2, title: "LOADING SOUND SAVANA", date: 26, month: "JUN '25", time: "17:00", client: "Kemendagri" },
  { id: 3, title: "D'PRO BROMO BI KALBAR", date: 28, month: "JUN '25", time: "12:00", client: "Bank Indonesia" },
  { id: 4, title: "TEMU RESPONDEN - BI MALANG", date: 15, month: "JUL '25", time: "08:00", client: "Bank Indonesia" },
  { id: 5, title: "CUDDLEME - EMPLOYEE GATHERING 2025", date: 18, month: "JUL '25", time: "15:30", client: "Cuddle Me" },
  { id: 6, title: "STARLINK BRI BROMO", date: 19, month: "JUL '25", time: "13:15", client: "BRI" },
  { id: 7, title: "LOADING BI", date: 21, month: "JUL '25", time: "08:00", client: "Bank Indonesia" },
  { id: 8, title: "LOADING SOUND NGAJUM SAE", date: 27, month: "JUL '25", time: "08:00", client: "Renta" },
  { id: 9, title: "LAUNCHING ALBUM SALSA - THE GROVE", date: 28, month: "JUL '25", time: "22:00", client: "Salsa Nadhif" },
];

export default function WorkspaceReportPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "selesai" | "performance">("admin");
  const [statusFilter, setStatusFilter] = useState("--- semua ---");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-3 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("admin")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "admin" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Administrasi
        </button>
        <button
          onClick={() => setActiveTab("selesai")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "selesai" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Administrasi Selesai
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "performance" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Team Performance
        </button>
      </div>

      {/* Status filter */}
      <div>
        <label className="block text-sm text-slate-500 mb-1">Status Event</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
        >
          <option>--- semua ---</option>
          <option>Berjalan</option>
          <option>Selesai</option>
        </select>
      </div>

      {/* Event cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportEvents.map((event) => (
          <div
            key={event.id}
            className="relative bg-slate-600 rounded-xl overflow-hidden h-48 flex flex-col justify-between p-4 cursor-pointer hover:shadow-lg transition-shadow group"
          >
            {/* Event title */}
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">
              {event.title}
            </h3>

            {/* No Image placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs mt-1">NO IMAGE AVAILABLE</p>
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-end justify-between relative z-10">
              {/* Date badge */}
              <div className="bg-green-600 rounded-lg px-3 py-2 text-center">
                <p className="text-white text-xl font-extrabold leading-none">{event.date}</p>
                <p className="text-green-200 text-[10px] uppercase">{event.month}</p>
                <p className="text-green-200 text-[10px]">⏱ {event.time}</p>
              </div>

              {/* Client */}
              <p className="text-white/80 text-xs">{event.client}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
