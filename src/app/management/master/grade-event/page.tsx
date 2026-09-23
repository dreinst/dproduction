"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";

interface GradeItem {
  id: number;
  grade: string;
}

const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const th = "px-3 py-3 text-left font-semibold";
const td = "px-3 py-3 align-top";
const stickyTh = "sticky right-0 bg-slate-800 px-3 py-3 text-center font-semibold";
const stickyTd =
  "sticky right-0 bg-white px-2 py-2 align-top shadow-[-6px_0_6px_-6px_rgba(15,23,42,0.35)] group-hover:bg-slate-50";

export default function MasterGradeEventPage() {
  const canWrite = useAdminUser().can("gradeEvents", "write");
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<GradeItem>({
    endpoint: "/api/grade-events",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GradeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GradeItem | null>(null);
  const [grade, setGrade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter((g) => !q || g.grade.toLowerCase().includes(q));
  const pagination = usePagination(filtered, q);

  const openForm = (item?: GradeItem) => {
    clearSaveError();
    setEditing(item ?? null);
    setGrade(item?.grade ?? "");
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = { grade: grade.trim() };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: GradeItem) => {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Master Grade Event</h1>
        {canWrite && (
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Tambah Grade
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="grade-search" className="sr-only">
            Cari grade
          </label>
          <input
            id="grade-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari grade"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data grade...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className={`${th} w-16`}>No</th>
                <th className={th}>Grade</th>
                {canWrite && <th className={`${stickyTh} w-28`}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, idx) => (
                <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} text-slate-600`}>{pagination.from + idx}.</td>
                  <td className={`${td} font-medium text-slate-800 wrap-anywhere`}>{item.grade}</td>
                  {canWrite && (
                    <td className={stickyTd}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openForm(item)}
                          className="p-2 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                          aria-label={`Edit grade ${item.grade}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Hapus grade ${item.grade}`}
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
                  <td colSpan={canWrite ? 3 : 2} className="px-4 py-8 text-center text-slate-600">
                    Tidak ada grade yang cocok.
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
        title={editing ? "Edit Grade" : "Tambah Grade"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        size="sm"
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
        <label htmlFor="grade-name" className="block text-sm font-medium text-slate-700 mb-1">
          Nama grade
        </label>
        <input
          id="grade-name"
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className={inputClass}
          disabled={isSubmitting}
          required
          maxLength={200}
          aria-describedby="grade-name-hint"
        />
        <p id="grade-name-hint" className="mt-1 text-xs text-slate-500">
          Misalnya Level A. Nama grade tidak boleh sama dengan grade lain.
        </p>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus grade?"
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
          Grade <span className="font-semibold text-slate-900">{deleteTarget?.grade}</span> akan dihapus permanen dan
          tidak bisa dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
