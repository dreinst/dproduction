"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Award,
} from "lucide-react";

interface TeamMember {
  name: string;
  phone: string;
  completed: number;
  running: number;
  hasPhoto: boolean;
}

interface MonthlyData {
  month: string;
  selesai: number;
  berjalan: number;
}

const ITEMS_PER_PAGE = 10;

const maskPhone = (phone: string): string => {
  if (phone.length <= 8) return phone;
  return phone.slice(0, 4) + "****" + phone.slice(-5);
};

export default function AdminDashboard() {
  const [year, setYear] = useState("2026");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalSelesai: number;
    totalBerjalan: number;
    monthlyData: MonthlyData[];
    teamData: TeamMember[];
  }>({
    totalSelesai: 0,
    totalBerjalan: 0,
    monthlyData: [],
    teamData: []
  });

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && data.monthlyData) {
          setDashboardData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const { teamData, monthlyData, totalSelesai, totalBerjalan } = dashboardData;
  const totalPages = Math.ceil(teamData.length / ITEMS_PER_PAGE);
  const paginatedTeam = teamData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
          <button 
            onClick={() => alert(`Menampilkan data tahun ${year}`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
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
                    {maskPhone(member.phone)}
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
