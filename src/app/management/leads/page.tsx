"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, MessageCircle, Search, Trash2 } from "lucide-react";
import { RequestError, jsonInit, useApiRequest } from "@/hooks/useCrud";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";
import { LEAD_STATUS, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/rbac";
import { EVENT_OPTIONS, WHATSAPP_PATTERN, eventLabel, normalizeWhatsapp } from "@/lib/site";

interface Lead {
  id: number;
  name: string;
  whatsapp: string;
  eventType: string;
  message: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceEventId: number | null;
  pic: { id: number; alias: string | null; username: string } | null;
}

type LeadPage = { items: Lead[]; total: number; page: number; pageSize: number };
type Option = { id: number; label: string };
type Grade = { id: number; grade: string };

const WORKSPACE_EVENT_HREF = "/management/workspace/event";
const LOAD_ERROR = "Gagal memuat lead. Coba muat ulang halaman.";

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});
const formatDate = (iso: string) => `${dateFormat.format(new Date(iso))} WIB`;

const messageOf = (err: unknown, fallback: string) => (err instanceof RequestError ? err.message : fallback);
const picLabel = (pic: Lead["pic"]) => (pic ? pic.alias?.trim() || pic.username : "Belum ada");

function waLink(whatsapp: string) {
  const number = normalizeWhatsapp(whatsapp);
  return WHATSAPP_PATTERN.test(number) ? `https://wa.me/62${number.slice(1)}` : null;
}

const STATUS_BADGE: Record<LeadStatus, string> = {
  baru: "bg-blue-100 text-blue-800",
  dihubungi: "bg-amber-100 text-amber-900",
  penawaran: "bg-violet-100 text-violet-800",
  deal: "bg-green-100 text-green-800",
  batal: "bg-slate-200 text-slate-700",
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

const controlClass =
  "border border-slate-300 rounded-lg text-base pointer-fine:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600";
const fieldClass = `${controlClass} w-full px-3 py-2 text-slate-800 disabled:bg-slate-100`;
const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const iconButton = "inline-flex p-1.5 rounded transition-colors";
const primaryButton =
  "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors";
const secondaryButton =
  "px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-medium rounded-lg transition-colors";
const linkClass = "font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800";

export default function LeadsPage() {
  const { can } = useAdminUser();
  const canWrite = can("leads", "write");
  const canConvert = canWrite && can("workspaceEvents", "write");
  const request = useApiRequest();

  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [reload, setReload] = useState(0);

  // Halaman kembali ke 1 setiap kali filter, pencarian, atau jumlah baris berubah (pola sama dengan usePagination).
  const filterKey = `${statusFilter}|${eventFilter}|${search}|${pageSize}`;
  const [pageState, setPageState] = useState({ page: 1, key: filterKey });
  if (pageState.key !== filterKey) setPageState({ page: 1, key: filterKey });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (statusFilter) params.set("status", statusFilter);
  if (eventFilter) params.set("eventType", eventFilter);
  if (search) params.set("q", search);
  const queryString = params.toString();
  const requestKey = `${queryString}#${reload}`;

  const [data, setData] = useState<LeadPage | null>(null);
  const [loaded, setLoaded] = useState<{ key: string; error: string | null } | null>(null);
  const loading = loaded?.key !== requestKey;
  const loadError = loaded?.key === requestKey ? loaded.error : null;

  // null selama dimuat atau kalau gagal dimuat.
  const [picOptions, setPicOptions] = useState<Option[] | null>(null);
  const [picError, setPicError] = useState(false);

  const [detail, setDetail] = useState<Lead | null>(null);
  const [follow, setFollow] = useState({ status: "baru" as LeadStatus, picId: "", notes: "" });
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [followSaved, setFollowSaved] = useState("");

  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState({ name: "", client: "", location: "", startAt: "", gradeEventId: "" });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradesError, setGradesError] = useState(false);
  const [convertBusy, setConvertBusy] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertDone, setConvertDone] = useState(false);
  const doneLinkRef = useRef<HTMLAnchorElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Pencarian dikirim setelah pengguna berhenti mengetik sebentar.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const key = `${queryString}#${reload}`;
    request(`/api/clients?${queryString}`, LOAD_ERROR)
      .then((body: LeadPage) => {
        if (cancelled) return;
        setData(body);
        setLoaded({ key, error: null });
        // Halaman terakhir bisa kosong setelah lead dihapus; pindah ke halaman terakhir yang masih berisi.
        if (!body.items.length && body.total > 0 && body.page > 1) {
          setPageState((s) => ({ ...s, page: Math.ceil(body.total / body.pageSize) }));
        }
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ key, error: messageOf(err, LOAD_ERROR) });
      });
    return () => {
      cancelled = true;
    };
  }, [queryString, reload, request]);

  useEffect(() => {
    let cancelled = false;
    request("/api/clients/pic-options", "Gagal memuat daftar penanggung jawab.")
      .then((options: Option[]) => {
        if (!cancelled) setPicOptions(options);
      })
      .catch(() => {
        if (!cancelled) setPicError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  useEffect(() => {
    if (convertDone) doneLinkRef.current?.focus();
  }, [convertDone]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = items.length && data ? (data.page - 1) * data.pageSize + 1 : 0;
  const pagination = {
    page,
    pageSize,
    total,
    totalPages,
    from,
    to: items.length ? from + items.length - 1 : 0,
    setPage: (next: number) => setPageState({ page: Math.min(Math.max(1, next), totalPages), key: filterKey }),
    setPageSize,
  };
  const filtered = !!(statusFilter || eventFilter || search);

  const refresh = () => setReload((n) => n + 1);

  const openDetail = (lead: Lead) => {
    setDetail(lead);
    setFollow({ status: lead.status, picId: lead.pic ? String(lead.pic.id) : "", notes: lead.notes ?? "" });
    setFollowError(null);
    setFollowSaved("");
  };

  const editFollow = (patch: Partial<typeof follow>) => {
    setFollow((f) => ({ ...f, ...patch }));
    setFollowSaved("");
  };

  const saveFollowUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!detail || followBusy) return;
    setFollowBusy(true);
    setFollowError(null);
    setFollowSaved("");
    try {
      const lead: Lead = await request(
        `/api/clients/${detail.id}`,
        "Gagal menyimpan tindak lanjut. Coba lagi.",
        jsonInit("PATCH", {
          status: follow.status,
          picId: follow.picId ? Number(follow.picId) : null,
          notes: follow.notes.trim() || null,
        }),
      );
      openDetail(lead);
      setFollowSaved("Tindak lanjut disimpan.");
      refresh();
    } catch (err) {
      setFollowError(messageOf(err, "Gagal menyimpan tindak lanjut. Coba lagi."));
    } finally {
      setFollowBusy(false);
    }
  };

  const openConvert = (lead: Lead) => {
    setDetail(null);
    setConvertTarget(lead);
    setConvertForm({
      name: `${eventLabel(lead.eventType)} ${lead.name}`,
      client: lead.name,
      location: "",
      startAt: "",
      gradeEventId: "",
    });
    setConvertError(null);
    setConvertDone(false);
    setGradesError(false);
    request("/api/grade-events", "Gagal memuat daftar level event.")
      .then((list: Grade[]) => setGrades(list))
      .catch(() => setGradesError(true));
  };

  // Batal atau selesai: kembali ke Detail Lead dengan data terbaru.
  const closeConvert = () => {
    const lead = convertTarget;
    setConvertTarget(null);
    if (lead) openDetail(lead);
  };

  const submitConvert = async () => {
    if (!convertTarget || convertDone) return;
    setConvertBusy(true);
    setConvertError(null);
    try {
      const { workspaceEventId } = await request(
        `/api/clients/${convertTarget.id}/workspace-event`,
        "Gagal membuat Workspace Event. Coba lagi.",
        jsonInit("POST", {
          name: convertForm.name,
          client: convertForm.client,
          location: convertForm.location.trim() || null,
          // datetime-local tidak membawa zona waktu; isian dibaca sebagai jam WIB.
          startAt: convertForm.startAt ? `${convertForm.startAt.slice(0, 16)}:00+07:00` : undefined,
          gradeEventId: convertForm.gradeEventId ? Number(convertForm.gradeEventId) : null,
        }),
      );
      setConvertTarget({ ...convertTarget, status: "deal", workspaceEventId });
      setConvertDone(true);
      refresh();
    } catch (err) {
      setConvertError(messageOf(err, "Gagal membuat Workspace Event. Coba lagi."));
    } finally {
      setConvertBusy(false);
    }
  };

  const openDelete = (lead: Lead) => {
    setDetail(null);
    setDeleteError(null);
    setDeleteTarget(lead);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await request(`/api/clients/${deleteTarget.id}`, "Gagal menghapus lead. Coba lagi.", { method: "DELETE" });
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(messageOf(err, "Gagal menghapus lead. Coba lagi."));
    } finally {
      setDeleteBusy(false);
      refresh();
    }
  };

  const waButton = (lead: Lead, withText = false) => {
    const href = waLink(lead.whatsapp);
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={
          withText
            ? "inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            : `${iconButton} text-green-700 hover:bg-green-50`
        }
        aria-label={`Chat WhatsApp dengan ${lead.name} (tab baru)`}
        title="Chat WhatsApp"
      >
        <MessageCircle className="w-4 h-4" aria-hidden />
        {withText && "Chat WhatsApp"}
      </a>
    );
  };

  // Penanggung jawab yang sudah nonaktif (atau pilihan belum termuat) tetap ditampilkan supaya tidak hilang diam-diam.
  const missingPic = detail?.pic && !picOptions?.some((option) => option.id === detail.pic?.id) ? detail.pic : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lead Masuk</h1>
        <p className="mt-1 text-sm text-slate-600">Pesan dari form kontak website, yang terbaru di atas.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="lead-status" className="block text-sm text-slate-600 mb-1">
            Status
          </label>
          <select
            id="lead-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${controlClass} w-full sm:min-w-[160px] px-4 py-2`}
          >
            <option value="">Semua</option>
            {LEAD_STATUS.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="lead-event" className="block text-sm text-slate-600 mb-1">
            Jenis acara
          </label>
          <select
            id="lead-event"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className={`${controlClass} w-full sm:min-w-[220px] px-4 py-2`}
          >
            <option value="">Semua</option>
            {EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-full sm:w-80 sm:ml-auto">
          <label htmlFor="lead-search" className="sr-only">
            Cari nama, WhatsApp, atau pesan
          </label>
          <input
            id="lead-search"
            type="search"
            value={searchInput}
            maxLength={100}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama, WhatsApp, atau pesan"
            className={`${controlClass} w-full pl-8 pr-3 py-2`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <PageSizeSelect pagination={pagination} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm" aria-busy={loading}>
        {loadError ? (
          <div role="alert" className="p-8 text-center text-red-700">
            {loadError}
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-slate-600">Memuat lead...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Nama</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">WhatsApp</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold">Jenis Acara</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold">Status</th>
                <th className="hidden xl:table-cell px-4 py-3 text-left font-semibold">Penanggung Jawab</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="sm:min-w-40 px-3 sm:px-4 py-3 text-sm">
                    <p className="font-medium text-slate-800 wrap-anywhere">{lead.name}</p>
                    <p className="sm:hidden my-1">
                      <StatusBadge status={lead.status} />
                    </p>
                    <p className="md:hidden text-slate-600 break-all">{lead.whatsapp}</p>
                    <p className="lg:hidden mt-1 text-xs text-slate-600">{eventLabel(lead.eventType)}</p>
                    <p className="sm:hidden text-xs text-slate-600">{formatDate(lead.createdAt)}</p>
                    <p className="xl:hidden text-xs text-slate-600">Penanggung jawab: {picLabel(lead.pic)}</p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600 break-all">{lead.whatsapp}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-slate-600">{eventLabel(lead.eventType)}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden xl:table-cell px-4 py-3 text-sm text-slate-600 wrap-anywhere">
                    {picLabel(lead.pic)}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDetail(lead)}
                        className={`${iconButton} text-blue-700 hover:bg-blue-50`}
                        aria-label={`Lihat detail lead ${lead.name}`}
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" aria-hidden />
                      </button>
                      {waButton(lead)}
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => openDelete(lead)}
                          className={`${iconButton} text-red-600 hover:bg-red-50`}
                          aria-label={`Hapus lead ${lead.name}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {filtered ? "Tidak ada lead yang cocok dengan pencarian atau filter." : "Belum ada lead masuk."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} />

      <Modal
        open={!!detail}
        title="Detail Lead"
        onClose={() => setDetail(null)}
        busy={followBusy}
        size="lg"
        footer={
          detail && (
            <>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => openDelete(detail)}
                  disabled={followBusy}
                  className="mr-auto px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              )}
              <button type="button" onClick={() => setDetail(null)} disabled={followBusy} className={secondaryButton}>
                Tutup
              </button>
              {waButton(detail, true)}
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-600">Nama</dt>
                <dd className="font-medium text-slate-800 wrap-anywhere">{detail.name}</dd>
              </div>
              <div>
                <dt className="text-slate-600">WhatsApp</dt>
                <dd className="font-medium text-slate-800 break-all">
                  {detail.whatsapp}
                  {!waLink(detail.whatsapp) && (
                    <span className="block text-xs font-normal text-amber-800">Format nomor tidak dikenali.</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-600">Jenis acara</dt>
                <dd className="font-medium text-slate-800">{eventLabel(detail.eventType)}</dd>
              </div>
              <div>
                <dt className="text-slate-600">Waktu masuk</dt>
                <dd className="font-medium text-slate-800">{formatDate(detail.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-600">Pesan asli (tidak bisa diubah)</dt>
                <dd className="mt-1">
                  {/* Bisa difokus supaya pesan panjang bisa digulir dengan keyboard; juga fokus awal modal ini. */}
                  <div
                    role="region"
                    aria-label="Pesan asli"
                    tabIndex={0}
                    className="max-h-60 overflow-y-auto rounded-lg bg-slate-50 p-3 text-slate-800 whitespace-pre-wrap wrap-anywhere focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {detail.message}
                  </div>
                </dd>
              </div>
            </dl>

            <section aria-labelledby="lead-follow-title" className="border-t border-slate-100 pt-5">
              <h3 id="lead-follow-title" className="text-base font-semibold text-slate-800">
                Tindak lanjut
              </h3>
              <form onSubmit={saveFollowUp} className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead-follow-status" className={labelClass}>
                    Status
                  </label>
                  <select
                    id="lead-follow-status"
                    value={follow.status}
                    onChange={(e) => editFollow({ status: e.target.value as LeadStatus })}
                    disabled={!canWrite || followBusy}
                    className={fieldClass}
                  >
                    {LEAD_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {LEAD_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lead-follow-pic" className={labelClass}>
                    Penanggung jawab
                  </label>
                  <select
                    id="lead-follow-pic"
                    value={follow.picId}
                    onChange={(e) => editFollow({ picId: e.target.value })}
                    disabled={!canWrite || followBusy}
                    aria-describedby={picError ? "lead-follow-pic-error" : undefined}
                    className={fieldClass}
                  >
                    <option value="">Belum ada</option>
                    {missingPic && (
                      <option value={missingPic.id}>
                        {picLabel(missingPic)}
                        {picOptions ? " (nonaktif)" : ""}
                      </option>
                    )}
                    {picOptions?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {picError && (
                    <p id="lead-follow-pic-error" className="mt-1 text-xs text-red-700">
                      Daftar penanggung jawab gagal dimuat. Muat ulang halaman untuk mencoba lagi.
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="lead-follow-notes" className={labelClass}>
                    Catatan tindak lanjut
                  </label>
                  <textarea
                    id="lead-follow-notes"
                    value={follow.notes}
                    onChange={(e) => editFollow({ notes: e.target.value })}
                    disabled={!canWrite || followBusy}
                    maxLength={2000}
                    rows={4}
                    className={fieldClass}
                  />
                </div>
                {followError && (
                  <div role="alert" className="sm:col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {followError}
                  </div>
                )}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  {canWrite && (
                    <button type="submit" disabled={followBusy} className={primaryButton}>
                      {followBusy ? "Menyimpan..." : "Simpan tindak lanjut"}
                    </button>
                  )}
                  <p role="status" className="text-sm font-medium text-green-800">
                    {followSaved}
                  </p>
                </div>
              </form>
            </section>

            <section aria-labelledby="lead-ws-title" className="border-t border-slate-100 pt-5">
              <h3 id="lead-ws-title" className="text-base font-semibold text-slate-800">
                Workspace Event
              </h3>
              {detail.workspaceEventId ? (
                <p className="mt-2 text-sm text-slate-700">
                  Sudah dijadikan Workspace Event.{" "}
                  <Link href={WORKSPACE_EVENT_HREF} className={linkClass}>
                    Buka Workspace Event
                  </Link>
                </p>
              ) : canConvert ? (
                <div className="mt-2">
                  <p className="text-sm text-slate-600">Buat acara di Workspace dari lead ini. Status lead otomatis menjadi Deal.</p>
                  <button
                    type="button"
                    onClick={() => openConvert(detail)}
                    disabled={followBusy}
                    className={`mt-3 ${secondaryButton} border border-slate-300`}
                  >
                    Jadikan Workspace Event
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Belum dijadikan Workspace Event.</p>
              )}
            </section>
          </div>
        )}
      </Modal>

      <Modal
        open={!!convertTarget}
        title="Jadikan Workspace Event"
        onClose={closeConvert}
        onSubmit={submitConvert}
        busy={convertBusy}
        footer={
          convertDone ? (
            <button type="button" onClick={closeConvert} className={secondaryButton}>
              Tutup
            </button>
          ) : (
            <>
              <button type="button" onClick={closeConvert} disabled={convertBusy} className={secondaryButton}>
                Batal
              </button>
              <button type="submit" disabled={convertBusy} className={primaryButton}>
                {convertBusy ? "Menyimpan..." : "Buat Workspace Event"}
              </button>
            </>
          )
        }
      >
        <p
          role="status"
          className={convertDone ? "mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800" : ""}
        >
          {convertDone ? "Workspace Event dibuat dan lead ditandai Deal." : ""}
        </p>
        {convertDone ? (
          <Link ref={doneLinkRef} href={WORKSPACE_EVENT_HREF} className={`text-sm ${linkClass}`}>
            Buka Workspace Event
          </Link>
        ) : (
          <div className="space-y-4">
            {convertError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {convertError}
              </div>
            )}
            <div>
              <label htmlFor="lead-ws-name" className={labelClass}>
                Nama acara
              </label>
              <input
                id="lead-ws-name"
                value={convertForm.name}
                onChange={(e) => setConvertForm((f) => ({ ...f, name: e.target.value }))}
                required
                maxLength={200}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="lead-ws-client" className={labelClass}>
                Klien
              </label>
              <input
                id="lead-ws-client"
                value={convertForm.client}
                onChange={(e) => setConvertForm((f) => ({ ...f, client: e.target.value }))}
                required
                maxLength={200}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="lead-ws-location" className={labelClass}>
                Lokasi
              </label>
              <input
                id="lead-ws-location"
                value={convertForm.location}
                onChange={(e) => setConvertForm((f) => ({ ...f, location: e.target.value }))}
                maxLength={300}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="lead-ws-start" className={labelClass}>
                Tanggal dan jam mulai (WIB)
              </label>
              <input
                id="lead-ws-start"
                type="datetime-local"
                value={convertForm.startAt}
                onChange={(e) => setConvertForm((f) => ({ ...f, startAt: e.target.value }))}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="lead-ws-grade" className={labelClass}>
                Level (Grade Event)
              </label>
              <select
                id="lead-ws-grade"
                value={convertForm.gradeEventId}
                onChange={(e) => setConvertForm((f) => ({ ...f, gradeEventId: e.target.value }))}
                aria-describedby="lead-ws-grade-hint"
                className={fieldClass}
              >
                <option value="">Tanpa level</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.grade}
                  </option>
                ))}
              </select>
              <p id="lead-ws-grade-hint" className={`mt-1 text-xs ${gradesError ? "text-red-700" : "text-slate-600"}`}>
                {gradesError
                  ? "Daftar level gagal dimuat. Level bisa diisi nanti di Workspace Event."
                  : "Opsional. Level menentukan tarif honor crew."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus lead?"
        onClose={() => setDeleteTarget(null)}
        busy={deleteBusy}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleteBusy} className={secondaryButton}>
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteBusy}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {deleteBusy ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {deleteError && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {deleteError}
          </div>
        )}
        <p className="text-sm text-slate-700 wrap-anywhere">
          Lead dari <span className="font-semibold text-slate-900">{deleteTarget?.name}</span> akan dihapus permanen dan
          tidak bisa dikembalikan.
          {deleteTarget?.workspaceEventId ? " Workspace Event yang dibuat dari lead ini tetap ada." : ""}
        </p>
      </Modal>
    </div>
  );
}
