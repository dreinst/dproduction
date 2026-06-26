"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Award,
} from "lucide-react";

// Team/Crew data from the reference screenshots
const teamData = [
  { name: "Donny", phone: "081938938800", completed: 18, running: 0, hasPhoto: true },
  { name: "Daus", phone: "6281917779222", completed: 17, running: 0, hasPhoto: true },
  { name: "Nadia", phone: "6282132370811", completed: 16, running: 0, hasPhoto: true },
  { name: "Rama", phone: "6281249867900", completed: 12, running: 0, hasPhoto: true },
  { name: "Elly", phone: "6282330459849", completed: 12, running: 0, hasPhoto: true },
  { name: "Maria", phone: "6287701769670", completed: 12, running: 0, hasPhoto: true },
  { name: "Aldiano", phone: "6282123337000", completed: 12, running: 0, hasPhoto: true },
  { name: "Fajar", phone: "6282142553700", completed: 11, running: 0, hasPhoto: false },
  { name: "Dimas", phone: "6283170560764", completed: 10, running: 0, hasPhoto: true },
  { name: "Awan", phone: "6281259807412", completed: 9, running: 0, hasPhoto: false },
  { name: "Vano", phone: "6285934488440", completed: 8, running: 0, hasPhoto: true },
  { name: "Rura", phone: "6281252545296", completed: 7, running: 0, hasPhoto: true },
  { name: "Amel", phone: "6281196988808", completed: 6, running: 0, hasPhoto: true },
  { name: "Patty", phone: "6281357912234", completed: 5, running: 0, hasPhoto: true },
  { name: "Tanti", phone: "6281259757479", completed: 4, running: 0, hasPhoto: true },
  { name: "Vanes", phone: "6281336667686", completed: 4, running: 0, hasPhoto: true },
  { name: "Nesa", phone: "6281216681226", completed: 3, running: 0, hasPhoto: false },
  { name: "Aneng", phone: "6282293253361", completed: 3, running: 0, hasPhoto: true },
  { name: "Joel", phone: "6281278997409", completed: 3, running: 0, hasPhoto: false },
  { name: "Ivana", phone: "6282244066011", completed: 2, running: 0, hasPhoto: true },
  { name: "Icha", phone: "6281392795160", completed: 2, running: 0, hasPhoto: true },
  { name: "Semmy", phone: "6282232882936", completed: 2, running: 0, hasPhoto: false },
  { name: "Jeffry", phone: "62818380630", completed: 1, running: 0, hasPhoto: false },
  { name: "Andrew", phone: "6282228555254", completed: 1, running: 0, hasPhoto: false },
  { name: "Richie", phone: "6282336661980", completed: 1, running: 0, hasPhoto: false },
  { name: "Eartha", phone: "6287739626013", completed: 1, running: 0, hasPhoto: false },
  { name: "Marcel", phone: "6289516094160", completed: 1, running: 0, hasPhoto: false },
  { name: "Hendra", phone: "6285785113322", completed: 1, running: 0, hasPhoto: true },
  { name: "Cathrine", phone: "6285736464911", completed: 1, running: 0, hasPhoto: true },
  { name: "Cosmas", phone: "6281249582001", completed: 1, running: 0, hasPhoto: false },
  { name: "Rehu", phone: "6289693809538", completed: 1, running: 0, hasPhoto: true },
  { name: "Hesty", phone: "628970317902", completed: 1, running: 0, hasPhoto: true },
  { name: "Laura", phone: "6285230415500", completed: 0, running: 2, hasPhoto: false },
  { name: "Ravy", phone: "6282132245979", completed: 0, running: 2, hasPhoto: false },
  { name: "Rambo", phone: "6283850560177", completed: 0, running: 1, hasPhoto: false },
  { name: "Adam (alazhar)", phone: "628155133924", completed: 0, running: 1, hasPhoto: false },
];

// Monthly event data for chart
const monthlyData = [
  { month: "JAN", selesai: 0, berjalan: 0 },
  { month: "FEB", selesai: 0, berjalan: 0 },
  { month: "MAR", selesai: 2, berjalan: 0 },
  { month: "APR", selesai: 4, berjalan: 2 },
  { month: "MAY", selesai: 3, berjalan: 0 },
  { month: "JUN", selesai: 45, berjalan: 0 },
  { month: "JUL", selesai: 3, berjalan: 0 },
  { month: "AUG", selesai: 2, berjalan: 0 },
  { month: "SEP", selesai: 4, berjalan: 0 },
  { month: "OCT", selesai: 3, berjalan: 0 },
  { month: "NOV", selesai: 5, berjalan: 0 },
  { month: "DEC", selesai: 3, berjalan: 0 },
];

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const [year, setYear] = useState("2025");
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(teamData.length / ITEMS_PER_PAGE);
  const paginatedTeam = teamData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalSelesai = 47;
  const totalBerjalan = 2;
  const maxChartValue = Math.max(...monthlyData.map((d) => Math.max(d.selesai, d.berjalan)), 1);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">DASHBOARD</h1>
        <div className="flex items-center gap-3 mt-3">
          <label className="text-sm text-slate-500">Tahun</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <Search className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Selesai */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">
                Event Selesai
              </p>
              <p className="text-5xl font-extrabold mt-2">{totalSelesai}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-300/50" />
          </div>
        </div>

        {/* Event Berjalan */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium uppercase tracking-wider">
                Event Berjalan
              </p>
              <p className="text-5xl font-extrabold mt-2">{totalBerjalan}</p>
            </div>
            <Clock className="w-12 h-12 text-amber-300/50" />
          </div>
        </div>
      </div>

      {/* Chart: Event Per Bulan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Event Per Bulan</h2>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            <span className="text-sm text-slate-500">EVENT SELESAI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-sm" />
            <span className="text-sm text-slate-500">EVENT BERJALAN</span>
          </div>
        </div>

        {/* Simple bar chart */}
        <div className="flex items-end gap-2 h-48 px-2">
          {monthlyData.map((data) => (
            <div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full flex gap-0.5 items-end justify-center h-40">
                {data.selesai > 0 && (
                  <div
                    className="w-5 bg-blue-600 rounded-t-sm transition-all"
                    style={{
                      height: `${(data.selesai / maxChartValue) * 100}%`,
                      minHeight: data.selesai > 0 ? "4px" : "0",
                    }}
                    title={`Selesai: ${data.selesai}`}
                  />
                )}
                {data.berjalan > 0 && (
                  <div
                    className="w-5 bg-amber-500 rounded-t-sm transition-all"
                    style={{
                      height: `${(data.berjalan / maxChartValue) * 100}%`,
                      minHeight: data.berjalan > 0 ? "4px" : "0",
                    }}
                    title={`Berjalan: ${data.berjalan}`}
                  />
                )}
              </div>
              <span className="text-xs text-slate-400 mt-1">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Total Event Per Team/Crew
        </h2>

        <div className="space-y-0">
          {paginatedTeam.map((member, idx) => (
            <div
              key={member.name}
              className={`flex items-center justify-between py-4 ${
                idx !== paginatedTeam.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    member.hasPhoto
                      ? "bg-gradient-to-br from-blue-500 to-blue-700"
                      : "bg-slate-300"
                  }`}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {member.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-700">
                    {member.completed}
                  </span>
                  <span className="text-slate-400">selesai</span>
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {member.running > 0 ? (
                    <>
                      <span className="font-bold text-slate-700">
                        {member.running}
                      </span>
                      <span className="text-slate-400">berjalan</span>
                    </>
                  ) : (
                    <span className="text-slate-400">- berjalan</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-400">
            {(page - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(page * ITEMS_PER_PAGE, teamData.length)} dari{" "}
            {teamData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
