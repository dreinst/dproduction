"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import AdminThumb from "@/components/management/AdminThumb";
import ImageField from "@/components/management/ImageField";
import { useAdminUser } from "@/components/management/AdminShell";

interface Album {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  sortIndex: number;
}

interface Foto {
  id: number;
  albumId: number;
  image: string;
  caption: string | null;
  active: boolean;
  sortIndex: number;
  album: { id: number; name: string };
}

type Crud<T extends { id: number }> = ReturnType<typeof useCrud<T>>;

const EMPTY_ALBUM = { name: "", description: "", sortIndex: "0", active: true };
const EMPTY_FOTO = { albumId: "", image: "", caption: "", sortIndex: "0", active: true };
const SORT_HINT = "Angka kecil tampil lebih dulu.";
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const filterClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white";
const addClass =
  "inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors";
const th = "px-3 py-3 text-left font-semibold";
const td = "px-3 py-3 align-top text-sm";
// Kolom pelengkap disembunyikan di layar sempit; keterangan pindah ke bawah nama.
const smCell = "hidden sm:table-cell";
const mdCell = "hidden md:table-cell";
const hintClass = "mt-1 text-xs text-slate-600";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

const toSortIndex = (value: string) => (value === "" ? 0 : Number(value));

function ErrorBox({ message }: { message: string | null }) {
  return message ? (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {message}
    </div>
  ) : null;
}

function Status({ active }: { active: boolean }) {
  return active ? (
    <span className="font-medium text-green-700">Tampil</span>
  ) : (
    <span className="text-slate-600">Tidak tampil</span>
  );
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="p-2 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
        aria-label={`Edit ${label}`}
        title="Edit"
      >
        <Pencil className="w-4 h-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label={`Hapus ${label}`}
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}

// Tanpa onDelete tombol utama menjadi submit form (Simpan); dengan onDelete menjadi tombol Hapus permanen.
function ModalFooter({ onCancel, onDelete, busy }: { onCancel: () => void; onDelete?: () => void; busy: boolean }) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
      >
        Batal
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          {busy ? "Menghapus..." : "Hapus permanen"}
        </button>
      ) : (
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          {busy ? "Menyimpan..." : "Simpan"}
        </button>
      )}
    </>
  );
}

function SortField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        Urutan
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={2147483647}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        disabled={disabled}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className={hintClass}>
        {SORT_HINT}
      </p>
    </div>
  );
}

function ActiveField({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        Tampil di website
      </label>
    </div>
  );
}

export default function GaleriFotoPage() {
  const canWrite = useAdminUser().can("galeriFoto", "write");
  const albums = useCrud<Album>({ endpoint: "/api/galeri-albums" });
  const photos = useCrud<Foto>({ endpoint: "/api/galeri-foto" });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-slate-800">Galeri Foto</h1>
      <AlbumSection albums={albums} photos={photos.data} canWrite={canWrite} onSaved={photos.fetchAll} />
      <FotoSection photos={photos} albums={albums.data} canWrite={canWrite} />
    </div>
  );
}

function AlbumSection({
  albums,
  photos,
  canWrite,
  onSaved,
}: {
  albums: Crud<Album>;
  photos: Foto[];
  canWrite: boolean;
  onSaved: () => Promise<void>;
}) {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = albums;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [form, setForm] = useState(EMPTY_ALBUM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openForm = (item?: Album) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            name: item.name,
            description: item.description ?? "",
            sortIndex: String(item.sortIndex),
            active: item.active,
          }
        : EMPTY_ALBUM,
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      sortIndex: toSortIndex(form.sortIndex),
      active: form.active,
    };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    // Nama album ikut tampil di daftar foto, jadi daftar foto dimuat ulang setelah album diubah.
    if (ok && editing) await onSaved();
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

  return (
    <section aria-labelledby="album-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="album-heading" className="text-xl font-semibold text-slate-800">
          Album
        </h2>
        {canWrite && (
          <button type="button" onClick={() => openForm()} className={addClass}>
            <Plus className="w-4 h-4" aria-hidden />
            Tambah Album
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat album...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={`${th} ${smCell} w-12`}>No</th>
                <th className={`${th} md:min-w-40`}>Nama album</th>
                <th className={`${th} ${mdCell} min-w-56`}>Keterangan</th>
                <th className={`${th} ${smCell} text-center`}>Jumlah foto</th>
                <th className={`${th} text-center`}>Urutan</th>
                <th className={th}>Status</th>
                {canWrite && <th className={`${th} text-center`}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} ${smCell} text-slate-600`}>{i + 1}.</td>
                  <td className={`${td} break-words`}>
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <span className="md:hidden block text-xs text-slate-600">{item.description}</span>
                  </td>
                  <td className={`${td} ${mdCell} text-slate-600 break-words`}>{item.description}</td>
                  <td className={`${td} ${smCell} text-center text-slate-700`}>
                    {photos.filter((foto) => foto.albumId === item.id).length}
                  </td>
                  <td className={`${td} text-center text-slate-700`}>{item.sortIndex}</td>
                  <td className={td}>
                    <Status active={item.active} />
                  </td>
                  {canWrite && (
                    <td className="px-2 py-2 align-top">
                      <RowActions
                        label={`album ${item.name}`}
                        onEdit={() => openForm(item)}
                        onDelete={() => openDelete(item)}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 7 : 6} className="px-4 py-8 text-center text-slate-600 text-sm">
                    Belum ada album.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? "Edit Album" : "Tambah Album"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        footer={<ModalFooter onCancel={() => setFormOpen(false)} busy={isSubmitting} />}
      >
        <ErrorBox message={saveError} />
        <div className="space-y-4">
          <div>
            <label htmlFor="album-name" className={labelClass}>
              Nama album
            </label>
            <input
              id="album-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
              maxLength={200}
              placeholder="Contoh: Hebitren BI Bandung"
            />
          </div>
          <div>
            <label htmlFor="album-description" className={labelClass}>
              Keterangan (opsional)
            </label>
            <textarea
              id="album-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>
          <SortField
            id="album-sort"
            value={form.sortIndex}
            onChange={(sortIndex) => setForm({ ...form, sortIndex })}
            disabled={isSubmitting}
          />
          <ActiveField
            id="album-active"
            checked={form.active}
            onChange={(active) => setForm({ ...form, active })}
            disabled={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus album?"
        onClose={() => setDeleteTarget(null)}
        busy={isSubmitting}
        size="sm"
        footer={<ModalFooter onCancel={() => setDeleteTarget(null)} onDelete={handleDelete} busy={isSubmitting} />}
      >
        <ErrorBox message={saveError} />
        <p className="text-sm text-slate-700">
          Album <span className="font-semibold text-slate-900 break-words">{deleteTarget?.name}</span> dihapus permanen
          dan tidak tampil lagi di website. Album yang masih berisi foto tidak bisa dihapus.
        </p>
      </Modal>
    </section>
  );
}

function FotoSection({ photos, albums, canWrite }: { photos: Crud<Foto>; albums: Album[]; canWrite: boolean }) {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = photos;
  const [albumFilter, setAlbumFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"aktif" | "semua">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Foto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Foto | null>(null);
  const [form, setForm] = useState(EMPTY_FOTO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.filter(
    (foto) =>
      (!albumFilter || foto.albumId === Number(albumFilter)) &&
      (statusFilter === "semua" || foto.active) &&
      (!q || `${foto.album.name} ${foto.caption ?? ""}`.toLowerCase().includes(q)),
  );
  const pagination = usePagination(filtered, `${albumFilter}|${statusFilter}|${q}`);

  const openForm = (item?: Foto) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            albumId: String(item.albumId),
            image: item.image,
            caption: item.caption ?? "",
            sortIndex: String(item.sortIndex),
            active: item.active,
          }
        : { ...EMPTY_FOTO, albumId: albumFilter },
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      albumId: Number(form.albumId),
      image: form.image.trim(),
      caption: form.caption.trim() || null,
      sortIndex: toSortIndex(form.sortIndex),
      active: form.active,
    };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload as Omit<Foto, "id">);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: Foto) => {
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

  return (
    <section aria-labelledby="foto-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="foto-heading" className="text-xl font-semibold text-slate-800">
          Foto
        </h2>
        {canWrite && (
          <button type="button" onClick={() => openForm()} disabled={!albums.length} className={addClass}>
            <Plus className="w-4 h-4" aria-hidden />
            Tambah Foto
          </button>
        )}
      </div>
      {canWrite && !albums.length && <p className="text-sm text-slate-600">Buat album dulu sebelum menambah foto.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="foto-album-filter" className="block text-sm text-slate-600 mb-1">
            Album
          </label>
          <select
            id="foto-album-filter"
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            className={filterClass}
          >
            <option value="">Semua album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="foto-status-filter" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="foto-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "aktif" | "semua")}
            className={filterClass}
          >
            <option value="semua">Semua</option>
            <option value="aktif">Hanya yang tampil</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-72">
          <label htmlFor="foto-search" className="sr-only">
            Cari album atau keterangan foto
          </label>
          <input
            id="foto-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari album atau keterangan"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat foto...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={`${th} ${smCell} w-12`}>No</th>
                <th className={th}>Pratinjau</th>
                <th className={`${th} md:min-w-40`}>Album</th>
                <th className={`${th} ${mdCell} min-w-56`}>Keterangan</th>
                <th className={`${th} ${smCell} text-center`}>Urutan</th>
                <th className={th}>Status</th>
                {canWrite && <th className={`${th} text-center`}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, i) => {
                const no = pagination.from + i;
                const name = item.caption || item.album.name;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className={`${td} ${smCell} text-slate-600`}>{no}.</td>
                    <td className={td}>
                      <AdminThumb src={item.image} alt={name} />
                    </td>
                    <td className={`${td} break-words`}>
                      <span className="font-medium text-slate-800">{item.album.name}</span>
                      <span className="md:hidden block text-xs text-slate-600">{item.caption}</span>
                    </td>
                    <td className={`${td} ${mdCell} text-slate-600 break-words`}>{item.caption}</td>
                    <td className={`${td} ${smCell} text-center text-slate-700`}>{item.sortIndex}</td>
                    <td className={td}>
                      <Status active={item.active} />
                    </td>
                    {canWrite && (
                      <td className="px-2 py-2 align-top">
                        <RowActions
                          label={`foto ${no}, ${name}`}
                          onEdit={() => openForm(item)}
                          onDelete={() => openDelete(item)}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 7 : 6} className="px-4 py-8 text-center text-slate-600 text-sm">
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
        title={editing ? "Edit Foto" : "Tambah Foto"}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={isSubmitting}
        size="lg"
        footer={<ModalFooter onCancel={() => setFormOpen(false)} busy={isSubmitting} />}
      >
        <ErrorBox message={saveError} />
        <div className="space-y-4">
          <div>
            <label htmlFor="foto-album" className={labelClass}>
              Album
            </label>
            <select
              id="foto-album"
              value={form.albumId}
              onChange={(e) => setForm({ ...form, albumId: e.target.value })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
              required
            >
              <option value="">Pilih album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
          <ImageField
            id="foto-image"
            label="Gambar"
            value={form.image}
            onChange={(image) => setForm((f) => ({ ...f, image }))}
            disabled={isSubmitting}
            required
          />
          <div>
            <label htmlFor="foto-caption" className={labelClass}>
              Keterangan foto (opsional)
            </label>
            <input
              id="foto-caption"
              type="text"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>
          <SortField
            id="foto-sort"
            value={form.sortIndex}
            onChange={(sortIndex) => setForm({ ...form, sortIndex })}
            disabled={isSubmitting}
          />
          <ActiveField
            id="foto-active"
            checked={form.active}
            onChange={(active) => setForm({ ...form, active })}
            disabled={isSubmitting}
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus foto?"
        onClose={() => setDeleteTarget(null)}
        busy={isSubmitting}
        size="sm"
        footer={<ModalFooter onCancel={() => setDeleteTarget(null)} onDelete={handleDelete} busy={isSubmitting} />}
      >
        <ErrorBox message={saveError} />
        <p className="text-sm text-slate-700">
          Foto{" "}
          <span className="font-semibold text-slate-900 break-words">
            {deleteTarget && (deleteTarget.caption || deleteTarget.album.name)}
          </span>{" "}
          dihapus permanen dan tidak tampil lagi di website.
        </p>
      </Modal>
    </section>
  );
}
