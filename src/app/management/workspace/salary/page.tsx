"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";

interface SalaryEntry {
  id: number;
  waktu: string;
  klien: string;
  event: string;
  deskripsi: string | null;
  active: boolean;
}

type FormState = Omit<SalaryEntry, "id" | "deskripsi"> & { deskripsi: string };

const EMPTY_FORM: FormState = { waktu: "", klien: "", event: "", deskripsi: "", active: true };
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function WorkspaceSalaryPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<SalaryEntry>({
    endpoint: "/api/workspace-salary",
  });
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalaryEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (s) =>
      (statusFilter === "semua" || s.active) &&
      (!q || [s.klien, s.event, s.deskripsi].some((v) => (v ?? "").toLowerCase().includes(q))),
  );
  const pagination = usePagination(filtered, `${statusFilter}|${q}`);

  const openForm = (entry?: SalaryEntry) => {
    clearSaveError();
    setEditing(entry ?? null);
    setForm(entry ? { ...entry, deskripsi: entry.deskripsi ?? "" } : EMPTY_FORM);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    clearSaveError();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      waktu: form.waktu,
      klien: form.klien,
      event: form.event,
      deskripsi: form.deskripsi.trim() || null,
      active: form.active,
    };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (entry: SalaryEntry) => {
    clearSaveError();
    setDeleteTarget(entry);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    clearSaveError();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const ok = await deleteItem(deleteTarget.id);
    setIsSubmitting(false);
    if (ok) setDeleteTarget(null);
  };

  const errorBox = saveError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {saveError}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Salary</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="salary-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="salary-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className="px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
          >
            <option value="aktif">Hanya yang aktif</option>
            <option value="semua">Semua</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Tambah Salary
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="salary-search" className="sr-only">
            Cari klien, event, atau deskripsi
          </label>
          <input
            id="salary-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari klien, event, atau deskripsi"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data salary...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-4 py-3 text-left font-semibold w-12">No</th>
                <th className="px-4 py-3 text-left font-semibold w-48">Waktu</th>
                <th className="px-4 py-3 text-left font-semibold">Klien</th>
                <th className="px-4 py-3 text-left font-semibold">Event</th>
                <th className="px-4 py-3 text-left font-semibold">Deskripsi</th>
                <th className="px-4 py-3 text-center font-semibold w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">{pagination.from + idx}.</td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{entry.waktu}</td>
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">{entry.klien}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{entry.event}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{entry.deskripsi}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openForm(entry)}
                        className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                        aria-label={`Edit salary ${entry.event}`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(entry)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Hapus salary ${entry.event}`}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {q ? "Tidak ada data salary yang cocok dengan pencarian." : "Belum ada data salary."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} />

      <Modal
        open={formOpen}
        title={editing ? "Edit Salary" : "Tambah Salary"}
        onClose={closeForm}
        onSubmit={handleSave}
        busy={isSubmitting}
        footer={
          <>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {errorBox}
        <div className="space-y-4">
          <div>
            <label htmlFor="salary-waktu" className={labelClass}>
              Waktu
            </label>
            <input
              id="salary-waktu"
              type="text"
              value={form.waktu}
              onChange={(e) => setForm({ ...form, waktu: e.target.value })}
              className={inputClass}
              placeholder="Contoh: 30 Agt 2025 17:00"
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="salary-klien" className={labelClass}>
              Klien
            </label>
            <input
              id="salary-klien"
              type="text"
              value={form.klien}
              onChange={(e) => setForm({ ...form, klien: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="salary-event" className={labelClass}>
              Event
            </label>
            <input
              id="salary-event"
              type="text"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="salary-desc" className={labelClass}>
              Deskripsi (opsional)
            </label>
            <textarea
              id="salary-desc"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className={`${inputClass} min-h-[80px]`}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="salary-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="salary-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus data salary?"
        onClose={closeDelete}
        busy={isSubmitting}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={closeDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? "Menghapus..." : "Hapus"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="text-sm text-slate-700">
          Data salary <span className="font-semibold text-slate-900">{deleteTarget?.event}</span> akan dihapus dari
          daftar dan tidak bisa dikembalikan lewat dashboard.
        </p>
      </Modal>
    </div>
  );
}
