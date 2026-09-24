"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { waNumber } from "@/lib/site";
import {
  addButton,
  dangerButton,
  hintClass,
  inputClass,
  labelClass,
  orNull,
  primaryButton,
  secondaryButton,
  stickyTd,
  stickyTh,
} from "../shared";

interface Crew {
  id: number;
  name: string;
  whatsapp: string | null;
  notes: string | null;
  active: boolean;
}

const EMPTY_FORM = { name: "", whatsapp: "", notes: "", active: true };
const th = "px-3 py-3 text-left font-semibold";
const td = "px-3 py-3 align-top text-sm";

export default function WorkspaceCrewPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<Crew>({
    endpoint: "/api/crews",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Crew | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Crew | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter((c) => !q || [c.name, c.whatsapp, c.notes].some((v) => (v ?? "").toLowerCase().includes(q)));
  const pagination = usePagination(filtered, q);

  const openForm = (item?: Crew) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(item ? { name: item.name, whatsapp: item.whatsapp ?? "", notes: item.notes ?? "", active: item.active } : EMPTY_FORM);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = { name: form.name, whatsapp: orNull(form.whatsapp), notes: orNull(form.notes), active: form.active };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: Crew) => {
    clearSaveError();
    setDeleteTarget(item);
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

  const waLink = (value: string | null) => {
    const number = waNumber(value);
    if (!number) return value;
    return (
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 underline hover:text-blue-900 whitespace-nowrap"
      >
        {value}
        <span className="sr-only"> (WhatsApp, tab baru)</span>
      </a>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Workspace Crew</h1>
        <button type="button" onClick={() => openForm()} className={addButton}>
          <Plus className="w-4 h-4" aria-hidden />
          Tambah Crew
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="crew-search" className="sr-only">
            Cari nama, nomor WhatsApp, atau catatan crew
          </label>
          <input
            id="crew-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, WhatsApp, atau catatan"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      {!formOpen && !deleteTarget && errorBox}

      {/* relative supaya teks sr-only di sel tabel ikut terpotong di sini dan tidak melebarkan halaman. */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data crew...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full sm:min-w-[640px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={th}>Nama</th>
                <th className={th}>WhatsApp</th>
                <th className={`${th} hidden sm:table-cell`}>Catatan</th>
                <th className={`${th} hidden sm:table-cell`}>Status</th>
                <th className={stickyTh}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item) => (
                <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} font-medium text-slate-800 break-words`}>
                    {item.name}
                    {/* Di layar sempit catatan dan status pindah ke bawah nama, supaya tabel muat tanpa digeser. */}
                    {item.notes && (
                      <span className="sm:hidden mt-1 block text-xs font-normal text-slate-600 whitespace-pre-line">{item.notes}</span>
                    )}
                    {!item.active && (
                      <span className="sm:hidden mt-1 inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-slate-700`}>{waLink(item.whatsapp)}</td>
                  <td className={`${td} hidden sm:table-cell text-slate-700 whitespace-pre-line break-words`}>{item.notes}</td>
                  <td className={`${td} hidden sm:table-cell`}>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.active ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {item.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className={stickyTd}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openForm(item)}
                        className="p-2 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                        aria-label={`Edit crew ${item.name}`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Hapus crew ${item.name}`}
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
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {q ? "Tidak ada crew yang cocok dengan pencarian." : "Belum ada crew."}
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
        title={editing ? "Edit Crew" : "Tambah Crew"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setFormOpen(false)} disabled={isSubmitting} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className={primaryButton}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {errorBox}
        <div className="space-y-4">
          <div>
            <label htmlFor="crew-name" className={labelClass}>
              Nama
            </label>
            <input
              id="crew-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="crew-whatsapp" className={labelClass}>
              Nomor WhatsApp
            </label>
            <input
              id="crew-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={30}
              placeholder="08123456789"
              aria-describedby="crew-whatsapp-hint"
            />
            <p id="crew-whatsapp-hint" className={hintClass}>
              Contoh 08123456789. Boleh dikosongkan.
            </p>
          </div>
          <div>
            <label htmlFor="crew-notes" className={labelClass}>
              Catatan
            </label>
            <textarea
              id="crew-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} min-h-[80px]`}
              disabled={isSubmitting}
              maxLength={1000}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="crew-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-describedby="crew-active-hint"
            />
            <label htmlFor="crew-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
          <p id="crew-active-hint" className={hintClass}>
            Crew nonaktif tidak muncul di pilihan saat menugaskan crew ke event.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus crew?"
        onClose={() => setDeleteTarget(null)}
        busy={isSubmitting}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={isSubmitting} className={secondaryButton}>
              Batal
            </button>
            <button type="button" onClick={handleDelete} disabled={isSubmitting} className={dangerButton}>
              {isSubmitting ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="text-sm text-slate-700">
          Crew <span className="font-semibold text-slate-900">{deleteTarget?.name}</span> akan dihapus permanen. Crew yang
          punya riwayat penugasan tidak bisa dihapus, nonaktifkan saja.
        </p>
      </Modal>
    </div>
  );
}
