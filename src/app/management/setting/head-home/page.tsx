"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, CheckSquare, Square, ArrowUp, ArrowDown } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import AdminThumb from "@/components/management/AdminThumb";

interface HeadImage {
  id: number;
  image: string;
  active: boolean;
  sortIndex: number;
}

const EMPTY_FORM = { image: "", active: true };
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const moveClass =
  "w-8 h-8 rounded flex items-center justify-center text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300";

export default function HeadHomePage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<HeadImage>({
    endpoint: "/api/head-home",
  });
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HeadImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeadImage | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moving, setMoving] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (item) => (statusFilter === "semua" || item.active) && (!q || item.image.toLowerCase().includes(q)),
  );
  const pagination = usePagination(filtered, `${statusFilter}|${q}`);

  const openForm = (item?: HeadImage) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(item ? { image: item.image, active: item.active } : EMPTY_FORM);
    setFormOpen(true);
  };

  const closeModals = () => {
    setFormOpen(false);
    setDeleteTarget(null);
    clearSaveError();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = { image: form.image.trim(), active: form.active };
    // sortIndex baru ditentukan server (urutan terakhir + 1).
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload as HeadImage);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: HeadImage) => {
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

  const move = async (index: number, to: number) => {
    setMoving(true);
    await updateItem(filtered[index].id, { sortIndex: filtered[to].sortIndex });
    setMoving(false);
  };

  const errorBox = saveError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {saveError}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Head Home</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="head-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="head-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className="px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
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
          Tambah Gambar
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="head-search" className="sr-only">
            Cari URL gambar
          </label>
          <input
            id="head-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari URL gambar"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      {!formOpen && !deleteTarget && errorBox}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data gambar...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold w-12">No</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Gambar</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Urutan</th>
                <th className="hidden sm:table-cell px-4 py-3 text-center font-semibold">Aktif</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, i) => {
                const no = pagination.from + i;
                const index = no - 1;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{no}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AdminThumb src={item.image} alt={`Gambar ${no}`} />
                        <span className="hidden sm:inline text-xs text-slate-600 break-all">{item.image}</span>
                        {!item.active && <span className="sm:hidden text-xs text-slate-500">Nonaktif</span>}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => move(index, index - 1)}
                          disabled={moving || index === 0}
                          className={`${moveClass} bg-green-600 hover:bg-green-700`}
                          aria-label={`Naikkan urutan gambar ${no}`}
                          title="Naikkan"
                        >
                          <ArrowUp className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, index + 1)}
                          disabled={moving || index === filtered.length - 1}
                          className={`${moveClass} bg-red-600 hover:bg-red-700`}
                          aria-label={`Turunkan urutan gambar ${no}`}
                          title="Turunkan"
                        >
                          <ArrowDown className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-center">
                      {item.active ? (
                        <CheckSquare className="w-5 h-5 text-green-600 mx-auto" aria-label="Aktif" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 mx-auto" aria-label="Nonaktif" />
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openForm(item)}
                          className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                          aria-label={`Edit gambar ${no}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Hapus gambar ${no}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {data.length ? "Tidak ada gambar yang cocok dengan filter." : "Belum ada gambar."}
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
        title={editing ? "Edit Gambar" : "Tambah Gambar"}
        onClose={closeModals}
        onSubmit={handleSave}
        busy={isSubmitting}
        footer={
          <>
            <button
              type="button"
              onClick={closeModals}
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
            <label htmlFor="head-image" className="block text-sm font-medium text-slate-700 mb-1">
              URL gambar
            </label>
            <div className="flex items-center gap-3">
              <input
                id="head-image"
                type="text"
                inputMode="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={inputClass}
                disabled={isSubmitting}
                required
                maxLength={2000}
                placeholder="/assets/portfolio/tentang-kami-dekorasi-ustegra.jpg"
                aria-describedby="head-image-hint"
              />
              <AdminThumb src={form.image} alt="Pratinjau gambar" />
            </div>
            <p id="head-image-hint" className="mt-1 text-xs text-slate-500">
              Path file di situs ini (diawali /, spasi ditulis %20) atau alamat lengkap yang diawali https://.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="head-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="head-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus gambar?"
        onClose={closeModals}
        busy={isSubmitting}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={closeModals}
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
              {isSubmitting ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox}
        <div className="flex items-center gap-3">
          <AdminThumb src={deleteTarget?.image} alt="Gambar yang akan dihapus" />
          <p className="text-sm text-slate-700">
            Gambar <span className="font-semibold text-slate-900 break-all">{deleteTarget?.image}</span> akan dihapus
            permanen dan tidak bisa dikembalikan. Kalau hanya ingin menyembunyikannya, batalkan lalu hapus centang Aktif
            lewat tombol Edit.
          </p>
        </div>
      </Modal>
    </div>
  );
}
