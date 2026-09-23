"use client";

import { useState } from "react";
import { Clock, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import { REPORT_STATUS, REPORT_STATUS_LABELS, type ReportStatus } from "@/lib/rbac";
import { MONTHS } from "@/app/api/workspace-reports/months";

interface WorkspaceReport {
  id: number;
  title: string;
  date: number;
  month: string;
  time: string;
  client: string;
  status: string;
}

type FormState = Omit<WorkspaceReport, "id" | "status"> & { status: ReportStatus };

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const isReportStatus = (value: string): value is ReportStatus => (REPORT_STATUS as readonly string[]).includes(value);
const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function WorkspaceReportPage() {
  const { data, loading, error, saveError, clearSaveError, createItem, updateItem, deleteItem } = useCrud<WorkspaceReport>({
    endpoint: "/api/workspace-reports",
  });
  const [activeTab, setActiveTab] = useState<ReportStatus>("admin");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({ title: "", date: 1, month: "", time: "", client: "", status: "admin" });

  const pagination = usePagination(
    data.filter((r) => r.status === activeTab),
    activeTab,
  );

  const openForm = (item?: WorkspaceReport) => {
    clearSaveError();
    setEditing(item ?? null);
    setForm(
      item
        ? {
            title: item.title,
            date: item.date >= 1 && item.date <= 31 ? item.date : 1,
            month: (MONTHS as readonly string[]).includes(item.month) ? item.month : "",
            time: /^\d{2}:\d{2}$/.test(item.time) ? item.time : "",
            client: item.client,
            status: isReportStatus(item.status) ? item.status : activeTab,
          }
        : { title: "", date: 1, month: "", time: "", client: "", status: activeTab },
    );
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    clearSaveError();
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const ok = editing ? await updateItem(editing.id, form) : await createItem(form);
    setIsSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const openDelete = (item: WorkspaceReport) => {
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

  const errorBox = saveError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {saveError}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Workspace Report</h1>

      <div className="grid grid-cols-3 border border-slate-200 rounded-xl overflow-hidden">
        {REPORT_STATUS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            aria-pressed={activeTab === status}
            className={`px-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === status ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50"
            }`}
          >
            {REPORT_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect pagination={pagination} />
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Tambah Report
        </button>
      </div>

      {loading && !data.length ? (
        <div className="p-8 text-center text-slate-600">Memuat data report...</div>
      ) : error ? (
        <div role="alert" className="p-8 text-center text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagination.pageItems.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-600">
              Belum ada report {REPORT_STATUS_LABELS[activeTab].toLowerCase()}.
            </div>
          ) : (
            pagination.pageItems.map((report) => (
              <div
                key={report.id}
                className="relative bg-slate-600 rounded-xl overflow-hidden h-48 flex flex-col justify-between p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="flex justify-between items-start gap-2 z-10 relative">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide break-words min-w-0">{report.title}</h3>
                  <div className="flex flex-col gap-1 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => openForm(report)}
                      className="p-2 bg-white/20 hover:bg-white/40 rounded text-white"
                      aria-label={`Edit report ${report.title}`}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(report)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                      aria-label={`Hapus report ${report.title}`}
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-20 z-0 text-white" aria-hidden>
                  <div className="text-center">
                    <ImageOff className="w-16 h-16 mx-auto" strokeWidth={1} />
                    <p className="text-xs mt-1">Belum ada gambar</p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2 relative z-10">
                  <div className="bg-green-700 rounded-lg px-3 py-2 text-center shadow-lg">
                    <p className="text-white text-xl font-extrabold leading-none">{report.date}</p>
                    <p className="text-green-50 text-[10px] uppercase">{report.month}</p>
                    <p className="text-green-50 text-[10px] inline-flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" aria-hidden />
                      {report.time}
                    </p>
                  </div>
                  <p className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded text-right break-words min-w-0">
                    {report.client}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination pagination={pagination} />

      <Modal
        open={formOpen}
        title={editing ? "Edit Report" : "Tambah Report"}
        onClose={closeForm}
        onSubmit={handleSave}
        busy={isSubmitting}
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
        {errorBox}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="report-title" className={labelClass}>
              Judul
            </label>
            <input
              id="report-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Event BI Kalbar"
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="report-date" className={labelClass}>
              Tanggal
            </label>
            <select
              id="report-date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: Number(e.target.value) })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-month" className={labelClass}>
              Bulan
            </label>
            <select
              id="report-month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
              required
            >
              <option value="" disabled>
                Pilih bulan
              </option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-time" className={labelClass}>
              Jam
            </label>
            <input
              id="report-time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value.slice(0, 5) })}
              className={inputClass}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="report-status" className={labelClass}>
              Status
            </label>
            <select
              id="report-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ReportStatus })}
              className={`${inputClass} bg-white`}
              disabled={isSubmitting}
            >
              {REPORT_STATUS.map((status) => (
                <option key={status} value={status}>
                  {REPORT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="report-client" className={labelClass}>
              Klien
            </label>
            <input
              id="report-client"
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
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus report?"
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
              {isSubmitting ? "Menghapus..." : "Hapus permanen"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="text-sm text-slate-700">
          Report <span className="font-semibold text-slate-900">{deleteTarget?.title}</span> akan dihapus permanen dan
          tidak bisa dikembalikan.
        </p>
      </Modal>
    </div>
  );
}
