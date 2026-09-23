"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import AdminThumb from "@/components/management/AdminThumb";

interface Foto {
  id: number;
  image: string;
  link: string | null;
}

const EMPTY_FORM = { image: "", link: "" };
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/i;
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";

// next/image di mode dev melempar error untuk URL yang belum bisa diurai (misalnya "https://" yang baru diketik).
const thumbSrc = (value?: string | null) => {
  const url = value?.trim() ?? "";
  return [...url].every((c) => c > " ") && (url.startsWith("/") || URL.canParse(url)) ? url : null;
};

export default function MasterFotoPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<Foto>({
    endpoint: "/api/galeri-foto",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Foto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Foto | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (foto) => !q || foto.image.toLowerCase().includes(q) || (foto.link ?? "").toLowerCase().includes(q),
  );
  const pagination = usePagination(filtered, q);

  const openForm = (foto?: Foto) => {
    clearSaveError();
    setEditing(foto ?? null);
    setForm(foto ? { image: foto.image, link: foto.link ?? "" } : EMPTY_FORM);
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = { image: form.image.trim(), link: form.link.trim() || null };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (foto: Foto) => {
    clearSaveError();
    setDeleteTarget(foto);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Master Foto</h1>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Tambah Foto
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="foto-search" className="sr-only">
            Cari URL gambar atau link
          </label>
          <input
            id="foto-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari URL gambar atau link"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data foto...</div>
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
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Link</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((foto, i) => (
                <tr key={foto.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{pagination.from + i}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AdminThumb src={thumbSrc(foto.image)} alt={`Foto ${pagination.from + i}`} />
                      <span className="hidden sm:inline text-xs text-slate-600 break-all">{foto.image}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm break-all">
                    {foto.link &&
                      (SAFE_HREF.test(foto.link) ? (
                        <a href={foto.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {foto.link}
                        </a>
                      ) : (
                        <span className="text-slate-600">{foto.link}</span>
                      ))}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openForm(foto)}
                        className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                        aria-label={`Edit foto ${pagination.from + i}`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(foto)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Hapus foto ${pagination.from + i}`}
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
                    {data.length ? "Tidak ada foto yang cocok dengan pencarian." : "Belum ada foto."}
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
        title={editing ? "Edit Foto" : "Tambah Foto"}
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
            <label htmlFor="foto-image" className="block text-sm font-medium text-slate-700 mb-1">
              URL gambar
            </label>
            <div className="flex items-center gap-3">
              <input
                id="foto-image"
                type="text"
                inputMode="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={inputClass}
                disabled={isSubmitting}
                required
                maxLength={2000}
                placeholder="/assets/portfolio/hebitren-bandung-masjid.jpg"
                aria-describedby="foto-image-hint"
              />
              <AdminThumb src={thumbSrc(form.image)} alt="Pratinjau gambar" />
            </div>
            <p id="foto-image-hint" className="mt-1 text-xs text-slate-500">
              Path file di situs ini (diawali /, spasi ditulis %20) atau alamat lengkap yang diawali https://.
            </p>
          </div>
          <div>
            <label htmlFor="foto-link" className="block text-sm font-medium text-slate-700 mb-1">
              Link (opsional)
            </label>
            <input
              id="foto-link"
              type="text"
              inputMode="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={2000}
              placeholder="https://www.instagram.com/dpro.duction"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus foto?"
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
        <div className="flex items-center gap-3">
          <AdminThumb src={thumbSrc(deleteTarget?.image)} alt="Foto yang akan dihapus" />
          <p className="text-sm text-slate-700">
            Foto <span className="font-semibold text-slate-900 break-all">{deleteTarget?.image}</span> akan dihapus permanen dan
            tidak bisa dikembalikan.
          </p>
        </div>
      </Modal>
    </div>
  );
}
