"use client";

import { useState } from "react";
import { CheckSquare, Pencil, Plus, Search, Square, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import AdminThumb from "@/components/management/AdminThumb";
import { useAdminUser } from "@/components/management/AdminShell";

interface EventItem {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  year: number | null;
  active: boolean;
}

const EMPTY_FORM = { name: "", year: "", description: "", photo: "", active: true };
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const th = "px-3 py-3 text-left font-semibold";
const td = "px-3 py-3 align-top";
const stickyTh = "sticky right-0 bg-slate-800 px-3 py-3 text-center font-semibold";
const stickyTd =
  "sticky right-0 bg-white px-2 py-2 align-top shadow-[-6px_0_6px_-6px_rgba(15,23,42,0.35)] group-hover:bg-slate-50";

export default function MasterEventPage() {
  const canWrite = useAdminUser().can("events", "write");
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<EventItem>({
    endpoint: "/api/events",
  });
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (e) =>
      (statusFilter === "semua" || e.active) &&
      (!q || `${e.name} ${e.description ?? ""} ${e.year ?? ""}`.toLowerCase().includes(q)),
  );
  const pagination = usePagination(filtered, `${statusFilter}|${q}`);

  const openForm = (item?: EventItem) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            name: item.name,
            year: item.year?.toString() ?? "",
            description: item.description ?? "",
            photo: item.photo ?? "",
            active: item.active,
          }
        : EMPTY_FORM,
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      year: form.year ? Number(form.year) : null,
      description: form.description.trim() || null,
      photo: form.photo.trim() || null,
      active: form.active,
    };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: EventItem) => {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Master Event</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="event-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="event-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className="px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
          >
            <option value="aktif">Hanya yang aktif</option>
            <option value="semua">Semua</option>
          </select>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Tambah Event
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="event-search" className="sr-only">
            Cari event
          </label>
          <input
            id="event-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, deskripsi, atau tahun"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data event...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className={th}>No</th>
                <th className={`${th} min-w-40`}>Nama</th>
                <th className={th}>Tahun</th>
                <th className={`${th} min-w-56`}>Deskripsi</th>
                <th className={`${th} text-center`}>Foto</th>
                <th className={`${th} text-center`}>Aktif</th>
                {canWrite && <th className={stickyTh}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, idx) => (
                <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} text-slate-600`}>{pagination.from + idx}.</td>
                  <td className={`${td} font-medium text-slate-800`}>{item.name}</td>
                  <td className={`${td} ${item.year ? "text-slate-700" : "text-slate-500 italic"}`}>
                    {item.year ?? "Belum diisi"}
                  </td>
                  <td className={`${td} text-slate-600`}>
                    <p className="line-clamp-2">{item.description}</p>
                  </td>
                  <td className={td}>
                    <div className="flex justify-center">
                      <AdminThumb src={item.photo} alt={item.name} />
                    </div>
                  </td>
                  <td className={`${td} text-center`}>
                    {item.active ? (
                      <CheckSquare className="w-5 h-5 text-green-600 mx-auto" aria-label="Aktif" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 mx-auto" aria-label="Nonaktif" />
                    )}
                  </td>
                  {canWrite && (
                    <td className={stickyTd}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openForm(item)}
                          className="p-2 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                          aria-label={`Edit event ${item.name}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Hapus event ${item.name}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 7 : 6} className="px-4 py-8 text-center text-slate-600">
                    Tidak ada event yang cocok.
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
        title={editing ? "Edit Event" : "Tambah Event"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
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
            <label htmlFor="event-name" className="block text-sm font-medium text-slate-700 mb-1">
              Nama event
            </label>
            <input
              id="event-name"
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
            <label htmlFor="event-year" className="block text-sm font-medium text-slate-700 mb-1">
              Tahun (opsional)
            </label>
            <input
              id="event-year"
              type="number"
              inputMode="numeric"
              min={2000}
              max={2100}
              step={1}
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi (opsional)
            </label>
            <textarea
              id="event-description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
          <div>
            <label htmlFor="event-photo" className="block text-sm font-medium text-slate-700 mb-1">
              URL foto (opsional)
            </label>
            <input
              id="event-photo"
              type="text"
              inputMode="url"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={2000}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="event-photo-hint"
            />
            <p id="event-photo-hint" className="mt-1 text-xs text-slate-500">
              Diawali https:// atau / untuk file di situs ini, misalnya /assets/portfolio/nama-foto.jpg.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="event-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="event-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus event?"
        onClose={() => setDeleteTarget(null)}
        busy={isSubmitting}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
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
          Event <span className="font-semibold text-slate-900">{deleteTarget?.name}</span> akan hilang dari daftar ini
          dan tidak bisa dikembalikan lewat dashboard. Datanya tetap tersimpan di database.
        </p>
      </Modal>
    </div>
  );
}
