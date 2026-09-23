"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";
import { WORKSPACE_EVENT_STATUS_LABELS as LABELS, type WorkspaceEventStatus } from "@/lib/rbac";

type Counts = Record<WorkspaceEventStatus, number>;
type Dashboard = { year: number; totals: Counts; monthly: ({ month: string } & Counts)[] };
type Result = { year: number; data?: Dashboard; error?: string };

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const SERIES: { key: WorkspaceEventStatus; bar: string }[] = [
  { key: "selesai", bar: "bg-blue-600" },
  { key: "running", bar: "bg-amber-500" },
];

const isValidYear = (value: string) => /^\d{4}$/.test(value) && +value >= MIN_YEAR && +value <= MAX_YEAR;

export default function AdminDashboard() {
  const router = useRouter();
  const [year, setYear] = useState(() => new Date(Date.now() + WIB_OFFSET_MS).getUTCFullYear());
  const [input, setInput] = useState(() => String(year));
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let message = "Data dashboard gagal dimuat. Coba muat ulang halaman.";
      try {
        const res = await fetch(`/api/dashboard?year=${year}`);
        if (cancelled) return;
        if (res.status === 401) {
          const here = window.location.pathname + window.location.search;
          router.replace(`/management/login?next=${encodeURIComponent(here)}&expired=1`);
          return;
        }
        const body = await res.json().catch(() => null);
        if (res.ok && body?.monthly) {
          if (!cancelled) setResult({ year, data: body });
          return;
        }
        if (typeof body?.message === "string") message = body.message;
      } catch {
        message = "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.";
      }
      if (!cancelled) setResult({ year, error: message });
    })();
    return () => {
      cancelled = true;
    };
  }, [year, router]);

  const onYearChange = (raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, 4);
    setInput(value);
    if (isValidYear(value)) setYear(Number(value));
  };

  const loading = result?.year !== year;
  const data = result?.data;
  const totals = data?.totals ?? { running: 0, selesai: 0 };
  const monthly = data?.monthly ?? [];
  const maxChartValue = Math.max(1, ...monthly.map((m) => Math.max(m.selesai, m.running)));
  const yearError = input.length === 4 && !isValidYear(input) ? `Tahun harus antara ${MIN_YEAR} dan ${MAX_YEAR}.` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <label htmlFor="dashboard-year" className="text-sm text-slate-600">
            Tahun
          </label>
          <input
            id="dashboard-year"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={input}
            onChange={(e) => onYearChange(e.target.value)}
            aria-invalid={!!yearError}
            aria-describedby="dashboard-year-hint"
            className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <p id="dashboard-year-hint" className={`text-sm ${yearError ? "text-red-700" : "text-slate-600"}`} aria-live="polite">
            {yearError ?? (loading ? `Memuat data tahun ${year}...` : `Menampilkan data tahun ${year}.`)}
          </p>
        </div>
      </div>

      {result?.error && !loading && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {result.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy={loading}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium uppercase tracking-wider">Event {LABELS.selesai}</p>
              <p className="text-5xl font-extrabold mt-2">{totals.selesai}</p>
            </div>
            <CheckCircle className="w-12 h-12 shrink-0 text-blue-300/50" aria-hidden />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-amber-950 shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-wider">Event {LABELS.running}</p>
              <p className="text-5xl font-extrabold mt-2">{totals.running}</p>
            </div>
            <Clock className="w-12 h-12 shrink-0 text-amber-900/30" aria-hidden />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Event Per Bulan, {year}</h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${s.bar}`} aria-hidden />
              <span className="text-sm text-slate-600">Event {LABELS[s.key]}</span>
            </div>
          ))}
        </div>

        {!loading && data && totals.selesai + totals.running === 0 && (
          <p className="mb-4 text-sm text-slate-600">Belum ada event di tahun {year}.</p>
        )}

        <div className="overflow-x-auto">
          <div className="flex items-end gap-2 h-48 px-2 min-w-[560px]" aria-hidden>
            {monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end justify-center h-40">
                  {SERIES.map(
                    (s) =>
                      m[s.key] > 0 && (
                        <div
                          key={s.key}
                          className={`w-5 rounded-t-sm transition-all ${s.bar}`}
                          style={{ height: `${(m[s.key] / maxChartValue) * 100}%`, minHeight: "4px" }}
                          title={`${m.month}, ${LABELS[s.key]}: ${m[s.key]}`}
                        />
                      ),
                  )}
                </div>
                <span className="text-xs text-slate-600 mt-1">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {monthly.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-blue-700">Lihat angka per bulan</summary>
            <div className="overflow-x-auto">
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-1 pr-4 font-semibold">Bulan</th>
                    {SERIES.map((s) => (
                      <th key={s.key} className="py-1 pr-4 font-semibold text-right">
                        {LABELS[s.key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month} className="border-t border-slate-100 text-slate-700">
                      <td className="py-1 pr-4">{m.month}</td>
                      {SERIES.map((s) => (
                        <td key={s.key} className="py-1 pr-4 text-right">
                          {m[s.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
