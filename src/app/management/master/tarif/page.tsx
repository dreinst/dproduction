"use client";

import { useCallback, useEffect, useState } from "react";
import { jsonInit, useApiRequest } from "@/hooks/useCrud";
import Modal from "@/components/management/Modal";
import {
  dangerButton,
  errorMessage,
  hintClass,
  inputClass,
  labelClass,
  primaryButton,
  rupiah,
  secondaryButton,
  useAction,
} from "@/app/management/workspace/shared";

type JobDesc = { id: number; name: string };
type Grade = { id: number; grade: string };
type TarifData = {
  jobdescs: JobDesc[];
  grades: Grade[];
  tarif: { jobDescId: number; gradeEventId: number; amount: number }[];
};
type Cell = { jobDesc: JobDesc; grade: Grade; amount: number | null };

const LOAD_FALLBACK = "Data tarif gagal dimuat. Coba muat ulang halaman.";
const cellKey = (jobDescId: number, gradeEventId: number) => `${jobDescId}:${gradeEventId}`;

export default function MasterTarifPage() {
  const request = useApiRequest();
  const [data, setData] = useState<TarifData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [target, setTarget] = useState<Cell | null>(null);
  const [amount, setAmount] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await request("/api/tarif", LOAD_FALLBACK));
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err, LOAD_FALLBACK));
    }
  }, [request]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const action = useAction(load);
  const amounts = new Map(data?.tarif.map((t) => [cellKey(t.jobDescId, t.gradeEventId), t.amount]));

  const openCell = (cell: Cell) => {
    action.clearError();
    setAmount(cell.amount === null ? "" : String(cell.amount));
    setTarget(cell);
  };

  const save = async (value: number | null) => {
    if (!target) return;
    const ok = await action.run(
      "/api/tarif",
      jsonInit("PUT", { jobDescId: target.jobDesc.id, gradeEventId: target.grade.id, amount: value }),
      value === null ? "Gagal menghapus tarif." : "Gagal menyimpan tarif.",
    );
    if (ok) setTarget(null);
  };

  const errorBox = action.error && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {action.error}
    </div>
  );

  const th = "px-3 py-3 text-left font-semibold";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Tarif</h1>
        <p className="mt-2 text-sm text-slate-700">
          Tarif honor per JobDesc untuk setiap Grade Event. Honor penugasan baru diisi otomatis dari tabel ini.
        </p>
      </div>

      {!target && errorBox}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loadError ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {loadError}
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-slate-600">Memuat data tarif...</div>
        ) : !data.jobdescs.length || !data.grades.length ? (
          <p className="p-8 text-center text-sm text-slate-600">
            Tarif bisa diisi setelah ada minimal satu JobDesc di Master JobDesc dan satu grade di Master Grade Event.
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Tarif honor, baris JobDesc dan kolom Grade Event</caption>
            <thead>
              <tr className="bg-slate-800 text-white">
                <th scope="col" className={`${th} sticky left-0 bg-slate-800`}>
                  JobDesc
                </th>
                {data.grades.map((g) => (
                  <th key={g.id} scope="col" className={`${th} whitespace-nowrap`}>
                    {g.grade}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.jobdescs.map((j) => (
                <tr key={j.id} className="border-b border-slate-100">
                  <th
                    scope="row"
                    className="sticky left-0 bg-white px-3 py-2 text-left font-medium text-slate-800 wrap-anywhere shadow-[6px_0_6px_-6px_rgba(15,23,42,0.35)]"
                  >
                    {j.name}
                  </th>
                  {data.grades.map((g) => {
                    const value = amounts.get(cellKey(j.id, g.id)) ?? null;
                    return (
                      <td key={g.id} className="px-1 py-1">
                        <button
                          type="button"
                          onClick={() => openCell({ jobDesc: j, grade: g, amount: value })}
                          className={`w-full min-w-[8rem] rounded-lg px-2 py-2 text-left transition-colors hover:bg-blue-50 ${
                            value === null ? "text-slate-600" : "font-medium text-slate-800"
                          }`}
                          aria-label={`Tarif ${j.name}, grade ${g.grade}: ${value === null ? "belum diatur" : rupiah(value)}. Ubah`}
                        >
                          {value === null ? "Belum diatur" : rupiah(value)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!target}
        title="Tarif (Rp)"
        onClose={() => setTarget(null)}
        onSubmit={() => save(Number(amount))}
        busy={action.busy}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setTarget(null)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            {target?.amount !== null && (
              <button type="button" onClick={() => save(null)} disabled={action.busy} className={dangerButton}>
                Hapus tarif
              </button>
            )}
            <button type="submit" disabled={action.busy} className={primaryButton}>
              {action.busy ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {errorBox}
        <label htmlFor="tarif-amount" className={labelClass}>
          Tarif (Rp)
        </label>
        <input
          id="tarif-amount"
          type="number"
          inputMode="numeric"
          min={0}
          max={2000000000}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          disabled={action.busy}
          required
          aria-describedby="tarif-amount-hint"
        />
        <p id="tarif-amount-hint" className={hintClass}>
          {target?.jobDesc.name}, grade {target?.grade.grade}. Isi angka rupiah tanpa titik, misalnya 500000.
        </p>
      </Modal>
    </div>
  );
}
