"use client";

import { useState } from "react";
import { Eye, MessageCircle, Search, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { useAdminUser } from "@/components/management/AdminShell";
import { EVENT_OPTIONS, WHATSAPP_PATTERN, eventLabel, normalizeWhatsapp } from "@/lib/site";

interface Lead {
  id: number;
  name: string;
  whatsapp: string;
  eventType: string;
  message: string;
  createdAt: string;
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});
const formatDate = (iso: string) => `${dateFormat.format(new Date(iso))} WIB`;

function waLink(whatsapp: string) {
  const number = normalizeWhatsapp(whatsapp);
  return WHATSAPP_PATTERN.test(number) ? `https://wa.me/62${number.slice(1)}` : null;
}

const controlClass =
  "border border-slate-300 rounded-lg text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30";
const iconButton = "inline-flex p-1.5 rounded transition-colors";

export default function LeadsPage() {
  const { can } = useAdminUser();
  const canDelete = can("leads", "write");
  const { data, loading, error, saveError, clearSaveError, deleteItem, fetchAll } = useCrud<Lead>({
    endpoint: "/api/clients",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [detail, setDetail] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const waQuery = normalizeWhatsapp(q);
  const filtered = data.filter(
    (lead) =>
      (!eventFilter || lead.eventType === eventFilter) &&
      (!q ||
        lead.name.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q) ||
        lead.whatsapp.includes(q) ||
        (/\d{4}/.test(waQuery) && normalizeWhatsapp(lead.whatsapp).includes(waQuery))),
  );
  const pagination = usePagination(filtered, `${eventFilter}|${q}`);

  const openDelete = (lead: Lead) => {
    clearSaveError();
    setDetail(null);
    setDeleteTarget(lead);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const ok = await deleteItem(deleteTarget.id);
    setIsDeleting(false);
    if (ok) setDeleteTarget(null);
    else fetchAll();
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
            ? "inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lead Masuk</h1>
        <p className="mt-1 text-sm text-slate-600">Pesan dari form kontak website, yang terbaru di atas.</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
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
            <option value="">Semua jenis acara</option>
            {EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-full sm:w-80">
          <label htmlFor="lead-search" className="sr-only">
            Cari nama, WhatsApp, atau pesan
          </label>
          <input
            id="lead-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, WhatsApp, atau pesan"
            className={`${controlClass} w-full pl-8 pr-3 py-2`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden />
        </div>
      </div>

      <PageSizeSelect pagination={pagination} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat lead...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Nama</th>
                <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Jenis Acara</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold">Pesan</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold">Masuk</th>
                <th className="px-3 sm:px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                  <td className="px-3 sm:px-4 py-3 text-sm">
                    <p className="font-medium text-slate-800 break-words">{lead.name}</p>
                    <p className="text-slate-600 break-all">{lead.whatsapp}</p>
                    <p className="md:hidden mt-1 text-xs text-slate-500">{eventLabel(lead.eventType)}</p>
                    <p className="sm:hidden text-xs text-slate-500">{formatDate(lead.createdAt)}</p>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600">{eventLabel(lead.eventType)}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-slate-600 max-w-md">
                    <p className="line-clamp-2 break-words">{lead.message}</p>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetail(lead)}
                        className={`${iconButton} text-blue-700 hover:bg-blue-50`}
                        aria-label={`Lihat detail lead ${lead.name}`}
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" aria-hidden />
                      </button>
                      {waButton(lead)}
                      {canDelete && (
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
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {data.length ? "Tidak ada lead yang cocok dengan pencarian atau filter." : "Belum ada lead masuk."}
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
        size="lg"
        footer={
          detail && (
            <>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => openDelete(detail)}
                  className="mr-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Tutup
              </button>
              {waButton(detail, true)}
            </>
          )
        }
      >
        {detail && (
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-slate-500">Nama</dt>
              <dd className="font-medium text-slate-800 break-words">{detail.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">WhatsApp</dt>
              <dd className="font-medium text-slate-800 break-all">
                {detail.whatsapp}
                {!waLink(detail.whatsapp) && (
                  <span className="block text-xs font-normal text-amber-700">Format nomor tidak dikenali.</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Jenis acara</dt>
              <dd className="font-medium text-slate-800">{eventLabel(detail.eventType)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Masuk</dt>
              <dd className="font-medium text-slate-800">{formatDate(detail.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Pesan</dt>
              <dd className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800 whitespace-pre-wrap break-words">
                {detail.message}
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus lead?"
        onClose={() => setDeleteTarget(null)}
        busy={isDeleting}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </>
        }
      >
        {saveError && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {saveError}
          </div>
        )}
        <p className="text-sm text-slate-700">
          Lead dari <span className="font-semibold text-slate-900">{deleteTarget?.name}</span> akan dihapus dari daftar.
          Pastikan lead ini memang tidak perlu ditindaklanjuti.
        </p>
      </Modal>
    </div>
  );
}
