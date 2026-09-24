"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { jsonInit, useApiRequest } from "@/hooks/useCrud";
import Modal from "@/components/management/Modal";
import { WORKSPACE_EVENT_STATUS_LABELS, type WorkspaceEventStatus } from "@/lib/rbac";
import {
  currentWibMonth,
  errorMessage,
  formatWib,
  formatWibDate,
  hintClass,
  inputClass,
  labelClass,
  parseRupiah,
  primaryButton,
  rupiah,
  rupiahInputProps,
  rupiahPreview,
  secondaryButton,
  stickyTd,
  stickyTh,
  useAction,
} from "../shared";

type Named = { id: number; name: string };

interface SalaryAssignment {
  id: number;
  honor: number;
  paid: boolean;
  paidAt: string | null;
  crew: Named;
  jobDesc: Named;
  workspaceEvent: { id: number; name: string; startAt: string; status: WorkspaceEventStatus };
}

interface Recap {
  crewId: number;
  crewName: string;
  count: number;
  total: number;
  paidTotal: number;
  unpaidTotal: number;
}

type SalaryData = { month: string; assignments: SalaryAssignment[]; recap: Recap[] };

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const LOAD_FALLBACK = "Data salary gagal dimuat. Coba muat ulang halaman.";
const th = "px-3 py-3 text-left font-semibold";
const thRight = "px-3 py-3 text-right font-semibold";
const td = "px-3 py-3 align-top text-sm";
const tdRight = "px-3 py-3 align-top text-sm text-right whitespace-nowrap";

export default function WorkspaceSalaryPage() {
  const request = useApiRequest();
  const [month, setMonth] = useState(currentWibMonth);
  const [monthInput, setMonthInput] = useState(month);
  const [result, setResult] = useState<{ month: string; data?: SalaryData; error?: string } | null>(null);
  const [honorTarget, setHonorTarget] = useState<SalaryAssignment | null>(null);
  const [honorInput, setHonorInput] = useState("");
  const [payTarget, setPayTarget] = useState<Recap | null>(null);

  const fetchMonth = useCallback(
    (m: string) =>
      request(`/api/salary?month=${m}`, LOAD_FALLBACK).then(
        (data: SalaryData) => ({ month: m, data }),
        (err) => ({ month: m, error: errorMessage(err, LOAD_FALLBACK) }),
      ),
    [request],
  );

  useEffect(() => {
    let cancelled = false;
    fetchMonth(month).then((r) => !cancelled && setResult(r));
    return () => {
      cancelled = true;
    };
  }, [month, fetchMonth]);

  // Aksi menunggu data baru sebelum tombol aktif lagi. Input bulan dikunci selama aksi, jadi month tetap bulan yang tampil.
  const action = useAction(async () => setResult(await fetchMonth(month)));
  // Tombol tabel memakai aria-disabled, bukan disabled, supaya fokus keyboard tidak lepas ke body selama aksi berjalan.
  const idle = (run: () => unknown) => () => {
    if (!action.busy) run();
  };
  const pageErrorRef = useRef<HTMLDivElement>(null);
  const modalOpen = !!honorTarget || !!payTarget;

  // Pesan gagal dari tombol di tabel dirender di atas halaman; tarik ke layar supaya terlihat.
  useEffect(() => {
    if (action.error && !modalOpen) pageErrorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [action.error, modalOpen]);

  const loading = result?.month !== month;
  const data = loading ? undefined : result?.data;
  const monthError = monthInput && !MONTH_PATTERN.test(monthInput) ? "Isi bulan dengan format TTTT-BB, misalnya 2026-09." : null;

  const onMonthChange = (value: string) => {
    setMonthInput(value);
    if (MONTH_PATTERN.test(value)) setMonth(value);
  };

  const openHonor = (item: SalaryAssignment) => {
    action.clearError();
    setHonorInput(String(item.honor));
    setHonorTarget(item);
  };

  const saveHonor = async () => {
    if (!honorTarget) return;
    const ok = await action.run(
      `/api/salary/${honorTarget.id}`,
      jsonInit("PATCH", { honor: parseRupiah(honorInput) }),
      "Gagal menyimpan honor.",
    );
    if (ok) setHonorTarget(null);
  };

  const togglePaid = (item: SalaryAssignment) =>
    action.run(`/api/salary/${item.id}`, jsonInit("PATCH", { paid: !item.paid }), "Gagal mengubah status bayar.");

  const openPay = (row: Recap) => {
    action.clearError();
    setPayTarget(row);
  };

  const payAll = async () => {
    if (!payTarget) return;
    const ok = await action.run(
      "/api/salary/pay",
      jsonInit("POST", { crewId: payTarget.crewId, month }),
      "Gagal menandai semua penugasan dibayar.",
    );
    if (ok) setPayTarget(null);
  };

  // Penugasan dari event Batal atau Ditunda tetap dihitung, tetapi ditandai supaya tidak ikut dibayar tanpa sengaja.
  const flagged = (item: SalaryAssignment) => item.workspaceEvent.status === "batal" || item.workspaceEvent.status === "ditunda";
  const payFlagged = payTarget
    ? (data?.assignments ?? []).filter((a) => a.crew.id === payTarget.crewId && !a.paid && flagged(a))
    : [];

  const errorBox = action.error && (
    <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {action.error}
    </div>
  );

  const [year, monthNumber] = month.split("-").map(Number);
  const monthLabel = new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Salary</h1>
        <div className="mt-3 max-w-xs">
          <label htmlFor="salary-month" className={labelClass}>
            Bulan (menurut tanggal mulai event)
          </label>
          <input
            id="salary-month"
            type="month"
            value={monthInput}
            onChange={(e) => onMonthChange(e.target.value)}
            className={inputClass}
            disabled={action.busy}
            aria-invalid={!!monthError}
            aria-describedby="salary-month-hint"
          />
          <p id="salary-month-hint" className={`${hintClass} ${monthError ? "text-red-700" : ""}`} aria-live="polite">
            {monthError ?? (loading ? `Memuat data ${monthLabel}...` : `Menampilkan data ${monthLabel}.`)}
          </p>
        </div>
      </div>

      {!modalOpen && action.error && (
        <div ref={pageErrorRef} role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {action.error}
        </div>
      )}

      {!loading && result?.error ? (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {result.error}
        </div>
      ) : (
        <>
          <section aria-labelledby="salary-recap" aria-busy={loading} className="space-y-3">
            <h2 id="salary-recap" className="text-lg font-bold text-slate-800">
              Rekap per Crew
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-slate-800 text-white text-sm">
                    <th className={th}>Crew</th>
                    <th className={thRight}>Jumlah Tugas</th>
                    <th className={thRight}>Total Honor</th>
                    <th className={thRight}>Sudah Dibayar</th>
                    <th className={thRight}>Belum Dibayar</th>
                    <th className={stickyTh}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recap.map((row) => (
                    <tr key={row.crewId} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className={`${td} font-medium text-slate-800`}>{row.crewName}</td>
                      <td className={`${tdRight} text-slate-700`}>{row.count}</td>
                      <td className={`${tdRight} text-slate-800`}>{rupiah(row.total)}</td>
                      <td className={`${tdRight} text-slate-700`}>{rupiah(row.paidTotal)}</td>
                      <td className={`${tdRight} text-slate-700`}>{rupiah(row.unpaidTotal)}</td>
                      <td className={`${stickyTd} text-center`}>
                        {data.assignments.some((a) => a.crew.id === row.crewId && !a.paid) ? (
                          <button
                            type="button"
                            onClick={idle(() => openPay(row))}
                            aria-disabled={action.busy}
                            className="px-2.5 py-1.5 text-xs font-medium text-green-800 hover:bg-green-50 rounded transition-colors aria-disabled:opacity-50"
                            aria-label={`Tandai semua dibayar: ${row.crewName}, ${monthLabel}`}
                          >
                            Tandai semua dibayar
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">Semua sudah dibayar</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data && data.recap.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">
                        Belum ada penugasan crew di {monthLabel}.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">
                        Memuat data salary...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="salary-list" aria-busy={loading} className="space-y-3">
            <h2 id="salary-list" className="text-lg font-bold text-slate-800">
              Daftar Penugasan
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="bg-slate-800 text-white text-sm">
                    <th className={th}>Tanggal</th>
                    <th className={`${th} min-w-44`}>Acara</th>
                    <th className={th}>Crew</th>
                    <th className={th}>JobDesc</th>
                    <th className={thRight}>Honor</th>
                    <th className={th}>Status</th>
                    <th className={stickyTh}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.assignments.map((item) => (
                    <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className={`${td} text-slate-700 whitespace-nowrap`}>{formatWib(item.workspaceEvent.startAt)}</td>
                      <td className={`${td} font-medium text-slate-800 break-words`}>
                        {item.workspaceEvent.name}
                        {flagged(item) && (
                          <span className="mt-1 block w-fit whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                            Event {WORKSPACE_EVENT_STATUS_LABELS[item.workspaceEvent.status]}
                          </span>
                        )}
                      </td>
                      <td className={`${td} text-slate-700`}>{item.crew.name}</td>
                      <td className={`${td} text-slate-700`}>{item.jobDesc.name}</td>
                      <td className={`${tdRight} text-slate-800`}>{rupiah(item.honor)}</td>
                      <td className={`${td} whitespace-nowrap ${item.paid ? "text-green-800" : "text-slate-700"}`}>
                        {item.paid && item.paidAt ? `Sudah dibayar ${formatWibDate(item.paidAt)}` : "Belum dibayar"}
                      </td>
                      <td className={stickyTd}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={idle(() => openHonor(item))}
                            aria-disabled={action.busy}
                            className="px-2.5 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-50 rounded transition-colors aria-disabled:opacity-50 whitespace-nowrap"
                            aria-label={`Ubah honor ${item.crew.name} di ${item.workspaceEvent.name}`}
                          >
                            Ubah honor
                          </button>
                          <button
                            type="button"
                            onClick={idle(() => togglePaid(item))}
                            aria-disabled={action.busy}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors aria-disabled:opacity-50 whitespace-nowrap ${
                              item.paid ? "text-slate-700 hover:bg-slate-100" : "text-green-800 hover:bg-green-50"
                            }`}
                            aria-label={`${item.paid ? "Batalkan tanda bayar" : "Tandai dibayar"} ${item.crew.name} di ${item.workspaceEvent.name}`}
                          >
                            {item.paid ? "Batalkan tanda bayar" : "Tandai dibayar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data && data.assignments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-sm">
                        Belum ada penugasan crew di {monthLabel}.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-sm">
                        Memuat data salary...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <Modal
        open={!!honorTarget}
        title="Ubah Honor"
        onClose={() => setHonorTarget(null)}
        onSubmit={saveHonor}
        busy={action.busy}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setHonorTarget(null)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" disabled={action.busy} className={primaryButton}>
              {action.busy ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {errorBox}
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{honorTarget?.crew.name}</span> sebagai{" "}
            {honorTarget?.jobDesc.name} di {honorTarget?.workspaceEvent.name}
          </p>
          <div>
            <label htmlFor="salary-honor" className={labelClass}>
              Honor (Rp)
            </label>
            <input
              id="salary-honor"
              {...rupiahInputProps}
              value={honorInput}
              onChange={(e) => setHonorInput(e.target.value)}
              className={inputClass}
              disabled={action.busy}
              required
              aria-describedby="salary-honor-hint"
            />
            <p id="salary-honor-hint" className={hintClass}>
              Isi angka rupiah, misalnya 500000 atau 500.000. {rupiahPreview(honorInput)}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!payTarget}
        title="Tandai semua dibayar?"
        onClose={() => setPayTarget(null)}
        busy={action.busy}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setPayTarget(null)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            <button type="button" onClick={payAll} disabled={action.busy} className={primaryButton}>
              {action.busy ? "Menyimpan..." : "Tandai semua dibayar"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {errorBox}
          <p className="text-sm text-slate-700">
            Semua penugasan <span className="font-semibold text-slate-900">{payTarget?.crewName}</span> di {monthLabel} yang
            belum dibayar ({payTarget && rupiah(payTarget.unpaidTotal)}) akan ditandai sudah dibayar hari ini.
          </p>
          {payFlagged.length > 0 && (
            <p className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm">
              Termasuk {payFlagged.length} penugasan dari event berstatus Batal atau Ditunda (
              {rupiah(payFlagged.reduce((sum, a) => sum + a.honor, 0))}). Kalau honor itu tidak dibayar, batalkan lalu tandai
              dibayar satu per satu di Daftar Penugasan.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
