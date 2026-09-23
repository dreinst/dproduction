"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, CheckSquare, Square, ArrowUp, ArrowDown } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import AdminThumb from "@/components/management/AdminThumb";

interface Album {
  id: number;
  album: string;
  keterangan: string | null;
  tanggal: string | null;
  image: string | null;
  active: boolean;
  sortIndex: number;
}

type FormState = { album: string; keterangan: string; tanggal: string; image: string; active: boolean };

const ALBUMS = ["Event Organizer", "Wedding"];
const EMPTY_FORM: FormState = { album: ALBUMS[0], keterangan: "", tanggal: "", image: "", active: true };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const filterClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white";
const moveClass =
  "w-8 h-8 rounded flex items-center justify-center text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300";

// next/image di mode dev melempar error untuk URL yang belum bisa diurai (misalnya "https://" yang baru diketik).
const thumbSrc = (value?: string | null) => {
  const url = value?.trim() ?? "";
  return [...url].every((c) => c > " ") && (url.startsWith("/") || URL.canParse(url)) ? url : null;
};

function isIsoDate(value: string) {
  const time = Date.parse(`${value}T00:00:00Z`);
  return ISO_DATE.test(value) && !isNaN(time) && new Date(time).toISOString().startsWith(value);
}

// Tanggal disimpan TTTT-BB-HH tanpa jam, jadi ditampilkan dalam UTC supaya tidak bergeser sehari di zona waktu lain.
function formatTanggal(value: string | null) {
  if (!value || !isIsoDate(value)) return value ?? "";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GaleriFotoPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<Album>({
    endpoint: "/api/galeri-foto-albums",
  });
  const [albumFilter, setAlbumFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moving, setMoving] = useState(false);

  const albums = [...new Set([...ALBUMS, ...data.map((item) => item.album)])];
  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (item) =>
      (!albumFilter || item.album === albumFilter) &&
      (statusFilter === "semua" || item.active) &&
      (!q || item.album.toLowerCase().includes(q) || (item.keterangan ?? "").toLowerCase().includes(q)),
  );
  const pagination = usePagination(filtered, `${albumFilter}|${statusFilter}|${q}`);
  const legacyTanggal = editing?.tanggal && !isIsoDate(editing.tanggal) ? editing.tanggal : null;

  const openForm = (item?: Album) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            album: item.album,
            keterangan: item.keterangan ?? "",
            tanggal: item.tanggal && isIsoDate(item.tanggal) ? item.tanggal : "",
            image: item.image ?? "",
            active: item.active,
          }
        : EMPTY_FORM,
    );
    setFormOpen(true);
  };

  const closeModals = () => {
    setFormOpen(false);
    setDeleteTarget(null);
    clearSaveError();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      album: form.album,
      keterangan: form.keterangan.trim() || null,
      image: form.image.trim() || null,
      active: form.active,
      // Tanggal lama yang tidak dikenali tidak dikirim ulang, jadi tetap tersimpan kalau field dibiarkan kosong.
      ...(form.tanggal || !legacyTanggal ? { tanggal: form.tanggal || null } : {}),
    };
    // sortIndex album baru ditentukan server (urutan terakhir + 1).
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload as Album);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: Album) => {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Galeri Foto</h1>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Tambah Foto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="album-filter" className="block text-sm text-slate-600 mb-1">
            Album
          </label>
          <select id="album-filter" value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)} className={filterClass}>
            <option value="">Semua</option>
            {albums.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="album-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="album-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className={filterClass}
          >
            <option value="aktif">Hanya yang aktif</option>
            <option value="semua">Semua</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="album-search" className="sr-only">
            Cari album atau keterangan
          </label>
          <input
            id="album-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari album atau keterangan"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      {!formOpen && !deleteTarget && errorBox}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat galeri foto...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold w-12">No</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Album</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Foto</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Keterangan</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Urutan</th>
                <th className="hidden sm:table-cell px-4 py-3 text-center font-semibold">Aktif</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, i) => {
                const no = pagination.from + i;
                const index = no - 1;
                const name = item.keterangan || item.album;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600">{no}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm">
                      <span className="font-medium text-slate-800">{item.album}</span>
                      <span className="md:hidden block text-xs text-slate-600 break-words">{item.keterangan}</span>
                      {!item.active && <span className="sm:hidden block text-xs text-slate-500">Nonaktif</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <AdminThumb src={thumbSrc(item.image)} alt={name} />
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600 max-w-[240px] break-words">
                      {item.keterangan}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatTanggal(item.tanggal)}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => move(index, index - 1)}
                          disabled={moving || index === 0}
                          className={`${moveClass} bg-green-600 hover:bg-green-700`}
                          aria-label={`Naikkan urutan foto ${no}, ${name}`}
                          title="Naikkan"
                        >
                          <ArrowUp className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, index + 1)}
                          disabled={moving || index === filtered.length - 1}
                          className={`${moveClass} bg-red-600 hover:bg-red-700`}
                          aria-label={`Turunkan urutan foto ${no}, ${name}`}
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
                          aria-label={`Edit foto ${no}, ${name}`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Hapus foto ${no}, ${name}`}
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
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {data.length ? "Tidak ada foto yang cocok dengan filter." : "Belum ada foto di galeri."}
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
        title={editing ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
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
            <label htmlFor="album-name" className="block text-sm font-medium text-slate-700 mb-1">
              Album
            </label>
            <select
              id="album-name"
              value={form.album}
              onChange={(e) => setForm({ ...form, album: e.target.value })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
            >
              {[...new Set([...albums, form.album])].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="album-keterangan" className="block text-sm font-medium text-slate-700 mb-1">
              Keterangan
            </label>
            <input
              id="album-keterangan"
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={500}
              placeholder="Contoh: Gala dinner Bank Indonesia"
            />
          </div>
          <div>
            <label htmlFor="album-tanggal" className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal
            </label>
            <input
              id="album-tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              aria-describedby={legacyTanggal ? "album-tanggal-hint" : undefined}
            />
            {legacyTanggal && (
              <p id="album-tanggal-hint" className="mt-1 text-xs text-amber-800">
                Tanggal tersimpan &quot;{legacyTanggal}&quot; tidak dikenali. Pilih tanggal baru, atau biarkan kosong
                supaya tanggal lama tetap tersimpan.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="album-image" className="block text-sm font-medium text-slate-700 mb-1">
              URL foto (opsional)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="album-image"
                type="text"
                inputMode="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={inputClass}
                disabled={isSubmitting}
                maxLength={2000}
                placeholder="/assets/portfolio/temres-magelang-gala-malam.jpg"
                aria-describedby="album-image-hint"
              />
              <AdminThumb src={thumbSrc(form.image)} alt="Pratinjau foto" />
            </div>
            <p id="album-image-hint" className="mt-1 text-xs text-slate-500">
              Path file di situs ini (diawali /, spasi ditulis %20) atau alamat lengkap yang diawali https://.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="album-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              disabled={isSubmitting}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="album-active" className="text-sm font-medium text-slate-700">
              Aktif
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus foto galeri?"
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
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900 break-words">
            {deleteTarget?.keterangan || deleteTarget?.album}
          </span>{" "}
          akan dihapus permanen dari galeri dan tidak bisa dikembalikan. Kalau hanya ingin menyembunyikannya, batalkan
          lalu hapus centang Aktif lewat tombol Edit.
        </p>
      </Modal>
    </div>
  );
}
