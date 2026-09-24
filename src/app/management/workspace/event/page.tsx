"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { jsonInit, useApiRequest, useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";
import { WORKSPACE_EVENT_STATUS, WORKSPACE_EVENT_STATUS_LABELS, type WorkspaceEventStatus } from "@/lib/rbac";
import {
  addButton,
  dangerButton,
  errorMessage,
  formatWib,
  formatWibDate,
  fromWibInput,
  hintClass,
  inputClass,
  labelClass,
  orNull,
  parseRupiah,
  primaryButton,
  rupiah,
  rupiahInputProps,
  rupiahPreview,
  secondaryButton,
  stickyTd,
  stickyTh,
  tabClass,
  toWibInput,
  useAction,
} from "../shared";

type Named = { id: number; name: string };
type Grade = { id: number; grade: string };
type Crew = Named & { active: boolean };

interface Assignment {
  id: number;
  crew: Named;
  jobDesc: Named;
  // Hanya dikirim API untuk Pemilik dan Super Admin.
  honor?: number;
  paid?: boolean;
  paidAt?: string | null;
}

interface WorkspaceEvent {
  id: number;
  name: string;
  client: string;
  location: string | null;
  startAt: string;
  endAt: string | null;
  status: WorkspaceEventStatus;
  photoUrl: string | null;
  videoUrl: string | null;
  notes: string | null;
  gradeEvent: Grade | null;
  assignments: Assignment[];
}

type Tab = "semua" | WorkspaceEventStatus;
const TABS: Tab[] = ["semua", ...WORKSPACE_EVENT_STATUS];
const tabName = (tab: Tab) => (tab === "semua" ? "Semua" : WORKSPACE_EVENT_STATUS_LABELS[tab]);

const STATUS_BADGE: Record<WorkspaceEventStatus, string> = {
  berjalan: "bg-amber-100 text-amber-900",
  selesai: "bg-blue-100 text-blue-800",
  batal: "bg-red-100 text-red-800",
  ditunda: "bg-slate-200 text-slate-800",
};

const EMPTY_FORM = {
  name: "",
  client: "",
  location: "",
  startAt: "",
  endAt: "",
  gradeEventId: "",
  status: "berjalan" as WorkspaceEventStatus,
  photoUrl: "",
  videoUrl: "",
  notes: "",
};
type FormState = typeof EMPTY_FORM;
const EMPTY_ASSIGN = { crewId: "", jobDescId: "", honor: "" };

const byName = <T,>(list: T[], key: (item: T) => string) => [...list].sort((a, b) => key(a).localeCompare(key(b), "id"));

// Tanggal dan jam boleh pindah baris di antara keduanya, supaya tabel muat di layar laptop 1280 px.
function Jadwal({ iso }: { iso: string }) {
  const [date, time] = formatWib(iso).split(", ");
  if (!time) return formatWib(iso);
  return (
    <>
      <span className="whitespace-nowrap">{date},</span> <span className="whitespace-nowrap">{time}</span>
    </>
  );
}

export default function WorkspaceEventPage() {
  const { can } = useAdminUser();
  const canWrite = can("workspaceEvents", "write");
  const canSeeHonor = can("salary", "read");
  const canSetHonor = can("salary", "write");
  const request = useApiRequest();
  const { data, loading, error, fetchAll } = useCrud<WorkspaceEvent>({ endpoint: "/api/workspace-events" });
  const action = useAction(fetchAll);

  const [activeTab, setActiveTab] = useState<Tab>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceEvent | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceEvent | null>(null);
  const [crewEventId, setCrewEventId] = useState<number | null>(null);
  const [assign, setAssign] = useState(EMPTY_ASSIGN);
  const [options, setOptions] = useState<{ crews: Crew[]; jobdescs: Named[]; grades: Grade[] } | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Staff dan tester hanya melihat, jadi daftar pilihan hanya dimuat untuk yang boleh menulis.
  useEffect(() => {
    if (!canWrite) return;
    let cancelled = false;
    const fallback = "Daftar crew, JobDesc, atau level gagal dimuat. Coba muat ulang halaman.";
    Promise.all([
      request("/api/crews", fallback),
      request("/api/jobdescs", fallback),
      request("/api/grade-events", fallback),
    ]).then(
      ([crews, jobdescs, grades]: [Crew[], Named[], Grade[]]) => {
        if (cancelled) return;
        setOptions({
          crews: crews.filter((c) => c.active),
          jobdescs: byName(jobdescs, (j) => j.name),
          grades: byName(grades, (g) => g.grade),
        });
      },
      (err) => !cancelled && setOptionsError(errorMessage(err, fallback)),
    );
    return () => {
      cancelled = true;
    };
  }, [canWrite, request]);

  const q = searchQuery.trim().toLowerCase();
  const matches = data.filter((e) => !q || [e.name, e.client, e.location].some((v) => (v ?? "").toLowerCase().includes(q)));
  const counts = Object.fromEntries(
    TABS.map((tab) => [tab, tab === "semua" ? matches.length : matches.filter((e) => e.status === tab).length]),
  ) as Record<Tab, number>;
  const rows = activeTab === "semua" ? matches : matches.filter((e) => e.status === activeTab);
  const pagination = usePagination(rows, `${activeTab}|${q}`);
  const crewEvent = data.find((e) => e.id === crewEventId) ?? null;
  const anyModal = formOpen || !!deleteTarget || !!crewEvent;

  const grades = options?.grades ?? [];
  const gradeOptions =
    editing?.gradeEvent && !grades.some((g) => g.id === editing.gradeEvent?.id) ? [...grades, editing.gradeEvent] : grades;

  const openForm = (item?: WorkspaceEvent) => {
    action.clearError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            name: item.name,
            client: item.client,
            location: item.location ?? "",
            startAt: toWibInput(item.startAt),
            endAt: item.endAt ? toWibInput(item.endAt) : "",
            gradeEventId: item.gradeEvent ? String(item.gradeEvent.id) : "",
            status: item.status,
            photoUrl: item.photoUrl ?? "",
            videoUrl: item.videoUrl ?? "",
            notes: item.notes ?? "",
          }
        : { ...EMPTY_FORM, status: activeTab === "semua" ? "berjalan" : activeTab },
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      client: form.client,
      location: orNull(form.location),
      startAt: fromWibInput(form.startAt),
      endAt: form.endAt ? fromWibInput(form.endAt) : null,
      gradeEventId: form.gradeEventId ? Number(form.gradeEventId) : null,
      status: form.status,
      photoUrl: orNull(form.photoUrl),
      videoUrl: orNull(form.videoUrl),
      notes: orNull(form.notes),
    };
    const ok = editing
      ? await action.run(`/api/workspace-events/${editing.id}`, jsonInit("PUT", payload), "Gagal menyimpan perubahan event.")
      : await action.run("/api/workspace-events", jsonInit("POST", payload), "Gagal menyimpan event.");
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: WorkspaceEvent) => {
    action.clearError();
    setDeleteTarget(item);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await action.run(`/api/workspace-events/${deleteTarget.id}`, { method: "DELETE" }, "Gagal menghapus event.");
    if (ok) setDeleteTarget(null);
  };

  const openCrew = (item: WorkspaceEvent) => {
    action.clearError();
    setAssign(EMPTY_ASSIGN);
    setCrewEventId(item.id);
  };

  const handleAssign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!crewEvent || action.busy) return;
    const payload = {
      crewId: Number(assign.crewId),
      jobDescId: Number(assign.jobDescId),
      ...(canSetHonor && assign.honor ? { honor: parseRupiah(assign.honor) } : {}),
    };
    const ok = await action.run(
      `/api/workspace-events/${crewEvent.id}/assignments`,
      jsonInit("POST", payload),
      "Gagal menugaskan crew.",
    );
    if (ok) setAssign(EMPTY_ASSIGN);
  };

  const handleRelease = async (assignment: Assignment) => {
    if (action.busy) return;
    const ok = await action.run(`/api/assignments/${assignment.id}`, { method: "DELETE" }, "Gagal melepas crew.");
    // Baris yang dilepas hilang, jadi fokus dipindah ke tabel crew supaya tidak jatuh ke body.
    if (ok) document.getElementById("crew-bertugas")?.focus();
  };

  const errorBox = (message: string | null) =>
    message && (
      <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {message}
      </div>
    );

  const link = (href: string | null, label: string, eventName: string) =>
    href && (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
        {label}
        <span className="sr-only"> {eventName} (tab baru)</span>
      </a>
    );

  const field = (key: keyof FormState, label: string, props: Record<string, unknown> = {}) => (
    <div>
      <label htmlFor={`event-${key}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`event-${key}`}
        type="text"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputClass}
        disabled={action.busy}
        maxLength={200}
        {...props}
      />
    </div>
  );

  const th = "px-3 py-3 text-left font-semibold";
  const td = "px-3 py-3 align-top text-sm";
  const emptyText = q
    ? "Tidak ada event yang cocok dengan pencarian."
    : activeTab === "semua"
      ? "Belum ada event."
      : `Belum ada event berstatus ${tabName(activeTab).toLowerCase()}.`;
  const crewColumns = 2 + (canSeeHonor ? 2 : 0) + (canWrite ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Workspace Event</h1>
        {canWrite && (
          <button type="button" onClick={() => openForm()} className={addButton}>
            <Plus className="w-4 h-4" aria-hidden />
            Tambah Event
          </button>
        )}
      </div>

      <div className="flex flex-wrap border border-slate-200 rounded-xl overflow-hidden" role="group" aria-label="Filter status event">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={tabClass(activeTab === tab)}
          >
            {tabName(tab)} ({counts[tab]})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <div className="relative w-full sm:w-80">
          <label htmlFor="event-search" className="sr-only">
            Cari nama acara, klien, atau lokasi
          </label>
          <input
            id="event-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama acara, klien, atau lokasi"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-base pointer-fine:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      {!anyModal && errorBox(action.error)}
      {canWrite && errorBox(optionsError)}

      {/* relative supaya teks sr-only di sel tabel ikut terpotong di sini dan tidak melebarkan halaman. */}
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data event...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={th}>Nama Acara</th>
                <th className={th}>Klien</th>
                <th className={th}>Lokasi</th>
                <th className={th}>Jadwal (WIB)</th>
                <th className={th}>Level</th>
                <th className={th}>Status</th>
                <th className={th}>Crew</th>
                <th className={th}>Link</th>
                <th className={stickyTh}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item) => (
                <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} font-medium text-slate-800 break-words`}>{item.name}</td>
                  <td className={`${td} text-slate-700 break-words`}>{item.client}</td>
                  <td className={`${td} text-slate-700 break-words`}>{item.location}</td>
                  <td className={`${td} text-slate-700`}>
                    <Jadwal iso={item.startAt} />
                    {item.endAt && (
                      <span className="block text-slate-600">
                        sampai <Jadwal iso={item.endAt} />
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-slate-700`}>
                    {item.gradeEvent?.grade ?? <span className="text-slate-600">Belum ditentukan</span>}
                  </td>
                  <td className={td}>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[item.status]}`}>
                      {WORKSPACE_EVENT_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className={`${td} text-slate-700`}>
                    {item.assignments.length > 0 && (
                      <ul className="space-y-0.5">
                        {item.assignments.map((a) => (
                          <li key={a.id}>{a.crew.name}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <div className="flex flex-col gap-1">
                      {link(item.photoUrl, "Foto", item.name)}
                      {link(item.videoUrl, "Video", item.name)}
                    </div>
                  </td>
                  <td className={stickyTd}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openCrew(item)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors text-xs font-medium"
                        aria-label={`Crew bertugas di ${item.name}`}
                      >
                        <Users className="w-4 h-4" aria-hidden />
                        Crew
                      </button>
                      {canWrite && (
                        <>
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-600 text-sm">
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
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        busy={action.busy}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setFormOpen(false)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" disabled={action.busy} className={primaryButton}>
              {action.busy ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {errorBox(action.error)}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("name", "Nama acara", { required: true })}</div>
          {field("client", "Klien", { required: true })}
          {field("location", "Lokasi", { maxLength: 300 })}
          {field("startAt", "Tanggal dan jam mulai (WIB)", { type: "datetime-local", required: true, maxLength: undefined })}
          {field("endAt", "Tanggal dan jam selesai (WIB)", {
            type: "datetime-local",
            min: form.startAt || undefined,
            maxLength: undefined,
          })}
          <div>
            <label htmlFor="event-gradeEventId" className={labelClass}>
              Level (Grade Event)
            </label>
            <select
              id="event-gradeEventId"
              value={form.gradeEventId}
              onChange={(e) => setForm({ ...form, gradeEventId: e.target.value })}
              className={`${inputClass} bg-white`}
              disabled={action.busy}
            >
              <option value="">Belum ditentukan</option>
              {gradeOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grade}
                </option>
              ))}
            </select>
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
              disabled={action.busy}
            >
              {WORKSPACE_EVENT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {WORKSPACE_EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          {field("photoUrl", "Link foto", { inputMode: "url", placeholder: "https://", maxLength: 2000 })}
          {field("videoUrl", "Link video", { inputMode: "url", placeholder: "https://", maxLength: 2000 })}
          <div className="sm:col-span-2">
            <label htmlFor="event-notes" className={labelClass}>
              Catatan
            </label>
            <textarea
              id="event-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} min-h-[80px]`}
              disabled={action.busy}
              maxLength={2000}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!crewEvent}
        title="Crew Bertugas"
        onClose={() => setCrewEventId(null)}
        busy={action.busy}
        size="lg"
        footer={
          <button type="button" onClick={() => setCrewEventId(null)} disabled={action.busy} className={secondaryButton}>
            Tutup
          </button>
        }
      >
        {crewEvent && (
          <div className="space-y-5">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{crewEvent.name}</span>, {formatWib(crewEvent.startAt)}
              {crewEvent.gradeEvent ? `, level ${crewEvent.gradeEvent.grade}` : ", level belum ditentukan"}
            </p>
            {errorBox(action.error)}
            {canWrite && (
              <form onSubmit={handleAssign} className="space-y-4 rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-800">Tugaskan crew</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="assign-crew" className={labelClass}>
                      Crew
                    </label>
                    <select
                      id="assign-crew"
                      value={assign.crewId}
                      onChange={(e) => setAssign({ ...assign, crewId: e.target.value })}
                      className={`${inputClass} bg-white`}
                      disabled={action.busy}
                      required
                      aria-describedby={options && !options.crews.length ? "assign-crew-hint" : undefined}
                    >
                      <option value="">Pilih crew</option>
                      {options?.crews.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {options && !options.crews.length && (
                      <p id="assign-crew-hint" className={hintClass}>
                        Belum ada crew aktif. Tambahkan dulu di menu Workspace Crew.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="assign-jobdesc" className={labelClass}>
                      JobDesc
                    </label>
                    <select
                      id="assign-jobdesc"
                      value={assign.jobDescId}
                      onChange={(e) => setAssign({ ...assign, jobDescId: e.target.value })}
                      className={`${inputClass} bg-white`}
                      disabled={action.busy}
                      required
                    >
                      <option value="">Pilih JobDesc</option>
                      {options?.jobdescs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {canSetHonor && (
                    <div className="sm:col-span-2">
                      <label htmlFor="assign-honor" className={labelClass}>
                        Honor (Rp)
                      </label>
                      <input
                        id="assign-honor"
                        {...rupiahInputProps}
                        value={assign.honor}
                        onChange={(e) => setAssign({ ...assign, honor: e.target.value })}
                        className={inputClass}
                        disabled={action.busy}
                        aria-describedby="assign-honor-hint"
                      />
                      <p id="assign-honor-hint" className={hintClass}>
                        Kosongkan untuk memakai tarif JobDesc sesuai level event. {rupiahPreview(assign.honor)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={action.busy} className={primaryButton}>
                    {action.busy ? "Menyimpan..." : "Tugaskan"}
                  </button>
                </div>
              </form>
            )}
            <div
              id="crew-bertugas"
              role="region"
              aria-label="Daftar crew bertugas"
              tabIndex={0}
              className="overflow-x-auto rounded-lg border border-slate-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className={th}>Crew</th>
                    <th className={th}>JobDesc</th>
                    {canSeeHonor && <th className={`${th} text-right`}>Honor</th>}
                    {canSeeHonor && <th className={th}>Status bayar</th>}
                    {canWrite && <th className={`${th} sticky right-0 bg-slate-100 text-center`}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {crewEvent.assignments.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className={`${td} text-slate-800`}>{a.crew.name}</td>
                      <td className={`${td} text-slate-700`}>{a.jobDesc.name}</td>
                      {canSeeHonor && <td className={`${td} text-right text-slate-700`}>{rupiah(a.honor ?? 0)}</td>}
                      {canSeeHonor && (
                        <td className={`${td} text-slate-700`}>
                          {a.paid && a.paidAt ? `Sudah dibayar ${formatWibDate(a.paidAt)}` : "Belum dibayar"}
                        </td>
                      )}
                      {canWrite && (
                        <td className={`${stickyTd} text-center`}>
                          <button
                            type="button"
                            onClick={() => handleRelease(a)}
                            aria-disabled={action.busy}
                            className="px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition-colors aria-disabled:opacity-50"
                            aria-label={`Lepas ${a.crew.name} sebagai ${a.jobDesc.name}`}
                          >
                            Lepas
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {crewEvent.assignments.length === 0 && (
                    <tr>
                      <td colSpan={crewColumns} className="px-3 py-6 text-center text-slate-600">
                        Belum ada crew yang ditugaskan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus event?"
        onClose={() => setDeleteTarget(null)}
        busy={action.busy}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            <button type="button" onClick={handleDelete} disabled={action.busy} className={dangerButton}>
              {action.busy ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox(action.error)}
        <p className="text-sm text-slate-700">
          Event <span className="font-semibold text-slate-900">{deleteTarget?.name}</span> akan dihapus permanen dan tidak
          bisa dikembalikan. Event yang masih punya crew bertugas tidak bisa dihapus.
          {!can("reports", "write") &&
            " Event yang sudah punya status administrasi atau catatan di Report hanya bisa dihapus Pemilik atau Super Admin."}
        </p>
      </Modal>
    </div>
  );
}
