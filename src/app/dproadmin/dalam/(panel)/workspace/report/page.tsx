"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { jsonInit, useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import Modal from "@/components/management/Modal";
import Pagination, { PageSizeSelect } from "@/components/management/Pagination";
import {
  ADMIN_STATUS,
  ADMIN_STATUS_LABELS,
  WORKSPACE_EVENT_STATUS_LABELS,
  type AdminStatus,
  type WorkspaceEventStatus,
} from "@/lib/rbac";
import {
  formatWib,
  inputClass,
  labelClass,
  orNull,
  primaryButton,
  secondaryButton,
  stickyTd,
  stickyTh,
  tabClass,
  useAction,
} from "../shared";

interface ReportRow {
  id: number;
  name: string;
  client: string;
  startAt: string;
  status: WorkspaceEventStatus;
  adminStatus: AdminStatus;
  adminNote: string | null;
}

type Tab = "semua" | AdminStatus;
const TABS: Tab[] = ["semua", ...ADMIN_STATUS];
const tabName = (tab: Tab) => (tab === "semua" ? "Semua" : ADMIN_STATUS_LABELS[tab]);
const th = "px-3 py-3 text-left font-semibold";
const td = "px-3 py-3 align-top text-sm";

export default function WorkspaceReportPage() {
  const { data, loading, error, fetchAll } = useCrud<ReportRow>({ endpoint: "/api/reports" });
  const action = useAction(fetchAll);
  const [activeTab, setActiveTab] = useState<Tab>("semua");
  const [editing, setEditing] = useState<ReportRow | null>(null);
  const [form, setForm] = useState<{ adminStatus: AdminStatus; adminNote: string }>({ adminStatus: "belum", adminNote: "" });

  const rows = activeTab === "semua" ? data : data.filter((r) => r.adminStatus === activeTab);
  const pagination = usePagination(rows, activeTab);

  const openForm = (item: ReportRow) => {
    action.clearError();
    setEditing(item);
    setForm({ adminStatus: item.adminStatus, adminNote: item.adminNote ?? "" });
  };

  const handleSave = async () => {
    if (!editing) return;
    const ok = await action.run(
      `/api/reports/${editing.id}`,
      jsonInit("PATCH", { adminStatus: form.adminStatus, adminNote: orNull(form.adminNote) }),
      "Gagal menyimpan status administrasi.",
    );
    if (ok) setEditing(null);
  };

  const errorBox = action.error && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {action.error}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Report Administrasi</h1>

      <div
        className="flex flex-wrap border border-slate-200 rounded-xl overflow-hidden"
        role="group"
        aria-label="Filter status administrasi"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={tabClass(activeTab === tab)}
          >
            {tabName(tab)}
          </button>
        ))}
      </div>

      <PageSizeSelect pagination={pagination} />

      {!editing && errorBox}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading && !data.length ? (
          <div className="p-8 text-center text-slate-600">Memuat data report...</div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : (
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-slate-800 text-white text-sm">
                <th className={th}>Nama Acara</th>
                <th className={th}>Klien</th>
                <th className={th}>Tanggal Mulai</th>
                <th className={th}>Status Event</th>
                <th className={th}>Status Administrasi</th>
                <th className={th}>Catatan</th>
                <th className={stickyTh}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((item) => (
                <tr key={item.id} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className={`${td} font-medium text-slate-800 break-words`}>{item.name}</td>
                  <td className={`${td} text-slate-700 break-words`}>{item.client}</td>
                  <td className={`${td} text-slate-700 whitespace-nowrap`}>{formatWib(item.startAt)}</td>
                  <td className={`${td} text-slate-700`}>{WORKSPACE_EVENT_STATUS_LABELS[item.status]}</td>
                  <td className={`${td} font-medium text-slate-800`}>{ADMIN_STATUS_LABELS[item.adminStatus]}</td>
                  <td className={`${td} text-slate-700 whitespace-pre-line break-words`}>{item.adminNote}</td>
                  <td className={`${stickyTd} text-center`}>
                    <button
                      type="button"
                      onClick={() => openForm(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-yellow-800 hover:bg-yellow-50 rounded transition-colors text-xs font-medium"
                      aria-label={`Ubah status administrasi ${item.name}`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden />
                      Ubah
                    </button>
                  </td>
                </tr>
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-sm">
                    {activeTab === "semua"
                      ? "Belum ada event. Event dibuat di menu Workspace Event."
                      : `Belum ada event dengan status administrasi ${tabName(activeTab)}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination pagination={pagination} />

      <Modal
        open={!!editing}
        title="Ubah Status Administrasi"
        onClose={() => setEditing(null)}
        onSubmit={handleSave}
        busy={action.busy}
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} disabled={action.busy} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" disabled={action.busy} className={primaryButton}>
              {action.busy ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {errorBox}
        <p className="mb-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{editing?.name}</span>, {editing && formatWib(editing.startAt)}
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="report-status" className={labelClass}>
              Status administrasi
            </label>
            <select
              id="report-status"
              value={form.adminStatus}
              onChange={(e) => setForm({ ...form, adminStatus: e.target.value as AdminStatus })}
              className={`${inputClass} bg-white`}
              disabled={action.busy}
            >
              {ADMIN_STATUS.map((status) => (
                <option key={status} value={status}>
                  {ADMIN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-note" className={labelClass}>
              Catatan
            </label>
            <textarea
              id="report-note"
              value={form.adminNote}
              onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
              className={`${inputClass} min-h-[100px]`}
              disabled={action.busy}
              maxLength={2000}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
