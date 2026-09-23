"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";
import { WORKSPACE_EVENT_STATUS, WORKSPACE_EVENT_STATUS_LABELS, type WorkspaceEventStatus } from "@/lib/rbac";

interface WorkspaceEvent {
  id: number;
  jobDesc: string;
  date: string;
  client: string;
  status: string;
  event: string | null;
  deskripsi: string | null;
  linkFoto: string | null;
  linkVideo: string | null;
  active?: boolean;
}

type FormState = {
  jobDesc: string;
  date: string;
  client: string;
  status: WorkspaceEventStatus;
  event: string;
  deskripsi: string;
  linkFoto: string;
  linkVideo: string;
};

// WIB selalu UTC+7, jadi isi input datetime-local dihitung dari WIB, apa pun zona waktu browser.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const toWibInput = (iso: string) => new Date(new Date(iso).getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
const formatWib = (iso: string) =>
  `${new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB`;
const orNull = (value: string) => value.trim() || null;

const emptyForm = (status: WorkspaceEventStatus): FormState => ({
  jobDesc: "",
  date: "",
  client: "",
  status,
  event: "",
  deskripsi: "",
  linkFoto: "",
  linkVideo: "",
});

const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function WorkspaceEventPage() {
  const { can } = useAdminUser();
  const canWrite = can("workspaceEvents", "write");
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<WorkspaceEvent>({
    endpoint: "/api/workspace-events",
  });
  const [activeTab, setActiveTab] = useState<WorkspaceEventStatus>("running");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceEvent | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm("running"));

  const q = searchQuery.trim().toLowerCase();
  const rows = data.filter(
    (e) =>
      e.status === activeTab && (!q || [e.jobDesc, e.client, e.event].some((v) => (v ?? "").toLowerCase().includes(q))),
  );
  const pagination = usePagination(rows, `${activeTab}|${q}`);
  const tabLabel = WORKSPACE_EVENT_STATUS_LABELS[activeTab];
  const showActive = rows.some((e) => e.active === false);
  const actionCols = canWrite ? 1 : 0;

  const openForm = (item?: WorkspaceEvent) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            jobDesc: item.jobDesc,
            date: toWibInput(item.date),
            client: item.client,
            status: item.status === "selesai" ? "selesai" : "running",
            event: item.event ?? "",
            deskripsi: item.deskripsi ?? "",
            linkFoto: item.linkFoto ?? "",
            linkVideo: item.linkVideo ?? "",
          }
        : emptyForm(activeTab),
    );
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    clearSaveError();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = {
      jobDesc: form.jobDesc,
      date: `${form.date.slice(0, 16)}:00+07:00`,
      client: form.client,
      status: form.status,
      event: orNull(form.event),
      deskripsi: orNull(form.deskripsi),
      linkFoto: orNull(form.linkFoto),
      linkVideo: orNull(form.linkVideo),
    };
    const ok = editing ? await updateItem(editing.id, payload) : await createItem(payload);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const markDone = async (item: WorkspaceEvent) => {
    clearSaveError();
    setMarkingId(item.id);
    await updateItem(item.id, { status: "selesai" });
    setMarkingId(null);
  };

  const openDelete = (item: WorkspaceEvent) => {
    clearSaveError();
    setDeleteTarget(item);
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

  const errorBox = (message: string | null) =>
    message && (
      <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {message}
      </div>
    );

  const editButtons = (item: WorkspaceEvent) => (
    <>
      <button
        type="button"
        onClick={() => openForm(item)}
        className="p-1.5 text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
        aria-label={`Edit event ${item.jobDesc}`}
        title="Edit"
      >
        <Pencil className="w-4 h-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => openDelete(item)}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label={`Hapus event ${item.jobDesc}`}
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" aria-hidden />
      </button>
    </>
  );

  const link = (href: string | null, label: string) =>
    href && (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
        {label}
      </a>
    );

  const emptyText = q ? "Tidak ada event yang cocok dengan pencarian." : `Belum ada event ${tabLabel.toLowerCase()}.`;
  const th = "px-3 sm:px-4 py-3 text-left font-semibold";
  const thCenter = "px-3 sm:px-4 py-3 text-center font-semibold";
  const td = "px-3 sm:px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        {WORKSPACE_EVENT_STATUS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            aria-pressed={activeTab === status}
            className={`py-3 text-sm font-semibold transition-colors ${
              activeTab === status ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50"
            }`}
          >
            Event {WORKSPACE_EVENT_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Event {tabLabel}</h1>
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
            Cari JobDesc, klien, atau nama event
          </label>
          <input
            id="event-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari JobDesc, klien, atau event"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      {!formOpen && !deleteTarget && errorBox(saveError)}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data event...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : activeTab === "running" ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={th}>JobDesc</th>
                <th className={`hidden sm:table-cell ${th}`}>Klien</th>
                <th className={`hidden sm:table-cell ${th}`}>Jadwal</th>
                {canWrite && <th className={thCenter}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={td}>
                    <span className="font-medium text-slate-800 break-words">{item.jobDesc}</span>
                    <span className="block text-xs text-slate-600 sm:hidden">{item.client}</span>
                    <span className="block text-xs text-slate-600 sm:hidden">{formatWib(item.date)}</span>
                  </td>
                  <td className={`hidden sm:table-cell ${td} text-slate-700`}>{item.client}</td>
                  <td className={`hidden sm:table-cell ${td} text-slate-700 whitespace-nowrap`}>{formatWib(item.date)}</td>
                  {canWrite && (
                    <td className={td}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => markDone(item)}
                          disabled={markingId !== null}
                          className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          aria-label={`Tandai selesai: ${item.jobDesc}`}
                          title="Tandai selesai"
                        >
                          <CheckCircle2 className="w-4 h-4" aria-hidden />
                          <span className="hidden sm:inline text-xs font-medium">
                            {markingId === item.id ? "Menyimpan..." : "Tandai selesai"}
                          </span>
                        </button>
                        {editButtons(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={3 + actionCols} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {emptyText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={`${th} w-12`}>No</th>
                <th className={th}>Waktu</th>
                <th className={th}>JobDesc</th>
                <th className={th}>Klien</th>
                <th className={th}>Event</th>
                <th className={th}>Deskripsi</th>
                <th className={th}>Link Foto</th>
                <th className={th}>Link Video</th>
                {showActive && <th className={thCenter}>Aktif</th>}
                {canWrite && <th className={thCenter}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} text-slate-600`}>{pagination.from + idx}.</td>
                  <td className={`${td} text-slate-700 whitespace-nowrap`}>{formatWib(item.date)}</td>
                  <td className={`${td} font-medium text-slate-800`}>{item.jobDesc}</td>
                  <td className={`${td} text-slate-700`}>{item.client}</td>
                  <td className={`${td} text-slate-700`}>{item.event}</td>
                  <td className={`${td} text-slate-700`}>{item.deskripsi}</td>
                  <td className={`${td} whitespace-nowrap`}>{link(item.linkFoto, "Buka foto")}</td>
                  <td className={`${td} whitespace-nowrap`}>{link(item.linkVideo, "Buka video")}</td>
                  {showActive && (
                    <td className={`${td} text-center text-slate-700`}>{item.active === false ? "Tidak" : "Ya"}</td>
                  )}
                  {canWrite && (
                    <td className={td}>
                      <div className="flex items-center justify-center gap-1.5">{editButtons(item)}</div>
                    </td>
                  )}
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={8 + actionCols} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {emptyText}
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
        onClose={closeForm}
        onSubmit={handleSave}
        busy={isSubmitting}
        size="lg"
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
        {errorBox(saveError)}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="event-jobdesc" className={labelClass}>
              JobDesc
            </label>
            <input
              id="event-jobdesc"
              type="text"
              value={form.jobDesc}
              onChange={(e) => setForm({ ...form, jobDesc: e.target.value })}
              className={inputClass}
              placeholder="Contoh: QrisMa Level B"
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="event-date" className={labelClass}>
              Tanggal dan jam (WIB)
            </label>
            <input
              id="event-date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="event-client" className={labelClass}>
              Klien
            </label>
            <input
              id="event-client"
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Bank Indonesia"
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="event-name" className={labelClass}>
              Nama event (opsional)
            </label>
            <input
              id="event-name"
              type="text"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="event-status" className={labelClass}>
              Status
            </label>
            <select
              id="event-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as WorkspaceEventStatus })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
            >
              {WORKSPACE_EVENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {WORKSPACE_EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="event-desc" className={labelClass}>
              Deskripsi (opsional)
            </label>
            <textarea
              id="event-desc"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className={`${inputClass} min-h-[80px]`}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
          <div>
            <label htmlFor="event-foto" className={labelClass}>
              Link foto (opsional)
            </label>
            <input
              id="event-foto"
              type="text"
              inputMode="url"
              value={form.linkFoto}
              onChange={(e) => setForm({ ...form, linkFoto: e.target.value })}
              className={inputClass}
              placeholder="https://"
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
          <div>
            <label htmlFor="event-video" className={labelClass}>
              Link video (opsional)
            </label>
            <input
              id="event-video"
              type="text"
              inputMode="url"
              value={form.linkVideo}
              onChange={(e) => setForm({ ...form, linkVideo: e.target.value })}
              className={inputClass}
              placeholder="https://"
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus event?"
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
        {errorBox(saveError)}
        <p className="text-sm text-slate-700">
          Event <span className="font-semibold text-slate-900">{deleteTarget?.jobDesc}</span> akan dihapus dari daftar
          dan tidak bisa dikembalikan lewat dashboard.
        </p>
      </Modal>
    </div>
  );
}
