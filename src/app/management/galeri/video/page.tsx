"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, CheckSquare, Square } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";

interface Video {
  id: number;
  url: string;
  active: boolean;
}

const EMPTY_FORM = { url: "", active: true };
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/i;
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";

export default function GaleriVideoPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<Video>({
    endpoint: "/api/galeri-video",
  });
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (video) => (statusFilter === "semua" || video.active) && (!q || video.url.toLowerCase().includes(q)),
  );
  const pagination = usePagination(filtered, `${statusFilter}|${q}`);

  const openForm = (video?: Video) => {
    clearSaveError();
    setEditing(video ?? null);
    setForm(video ? { url: video.url, active: video.active } : EMPTY_FORM);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = { url: form.url.trim(), active: form.active };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (video: Video) => {
    clearSaveError();
    setDeleteTarget(video);
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
      <h1 className="text-2xl font-bold text-slate-800">Galeri Video</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="video-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="video-status"
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
          Tambah Video
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="video-search" className="sr-only">
            Cari URL video
          </label>
          <input
            id="video-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari URL video"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data video...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold w-12">No</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Video</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aktif</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((video, i) => (
                <tr key={video.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{pagination.from + i}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm break-all">
                    {SAFE_HREF.test(video.url) ? (
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {video.url}
                      </a>
                    ) : (
                      <span className="text-slate-600">{video.url}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {video.active ? (
                      <CheckSquare className="w-5 h-5 text-green-600 mx-auto" aria-label="Aktif" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 mx-auto" aria-label="Nonaktif" />
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openForm(video)}
                        className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                        aria-label={`Edit video ${pagination.from + i}`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(video)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Hapus video ${pagination.from + i}`}
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
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {data.length ? "Tidak ada video yang cocok dengan filter." : "Belum ada video."}
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
        title={editing ? "Edit Video" : "Tambah Video"}
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
            <label htmlFor="video-url" className="block text-sm font-medium text-slate-700 mb-1">
              URL video
            </label>
            <input
              id="video-url"
              type="text"
              inputMode="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              maxLength={2000}
              placeholder="https://www.youtube.com/watch?v=kodevideo"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="video-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="video-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus video?"
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
              {isSubmitting ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="text-sm text-slate-700">
          Video <span className="font-semibold text-slate-900 break-all">{deleteTarget?.url}</span> akan dihapus permanen
          dan tidak bisa dikembalikan. Kalau hanya ingin menyembunyikannya, batalkan lalu hapus centang Aktif lewat tombol
          Edit.
        </p>
      </Modal>
    </div>
  );
}
