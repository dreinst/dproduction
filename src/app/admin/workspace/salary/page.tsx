"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, X, Plus } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface SalaryEntry {
  id: number;
  waktu: string;
  klien: string;
  event: string;
  deskripsi: string;
  active: boolean;
}

export default function WorkspaceSalaryPage() {
  const { data, loading, error, createItem, updateItem, deleteItem } = useCrud<SalaryEntry>({ endpoint: '/api/workspace-salary' });
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<SalaryEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState<Partial<SalaryEntry>>({
    waktu: "",
    klien: "",
    event: "",
    deskripsi: "",
    active: true,
  });

  const safeData = data || [];

  const filtered = safeData.filter((s) => {
    if (statusFilter === "Aktif" && !s.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (s.klien || "").toLowerCase().includes(q) || (s.event || "").toLowerCase().includes(q) || (s.deskripsi || "").toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / showEntries) || 1;
  const paginatedSalary = filtered.slice((page - 1) * showEntries, page * showEntries);

  const handleOpenModal = (entry?: SalaryEntry) => {
    if (entry) {
      setCurrentEditing(entry);
      setFormData({
        waktu: entry.waktu || "",
        klien: entry.klien || "",
        event: entry.event || "",
        deskripsi: entry.deskripsi || "",
        active: entry.active ?? true,
      });
    } else {
      setCurrentEditing(null);
      setFormData({
        waktu: "",
        klien: "",
        event: "",
        deskripsi: "",
        active: true,
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFormError("");
    
    let success = false;
    if (currentEditing) {
      success = await updateItem(currentEditing.id, formData);
    } else {
      success = await createItem(formData);
    }
    
    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
    } else {
      setFormError("Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    if (currentEditing) {
      setIsSubmitting(true);
      const success = await deleteItem(currentEditing.id);
      setIsSubmitting(false);
      
      if (success) {
        setIsDeleteModalOpen(false);
        setCurrentEditing(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 uppercase">Input Salary</h1>

      <div>
        <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
        >
          <option>Aktif</option>
          <option>Semua</option>
        </select>
      </div>
      
      <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors mt-6">
         <Plus className="w-5 h-5" />
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input
            type="number"
            value={showEntries}
            onChange={(e) => setShowEntries(Number(e.target.value))}
            className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading salary entries...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : (
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-left font-semibold w-48">Waktu</th>
              <th className="px-4 py-3 text-left font-semibold">Klien</th>
              <th className="px-4 py-3 text-left font-semibold">Event</th>
              <th className="px-4 py-3 text-left font-semibold">Deskripsi</th>
              <th className="px-4 py-3 text-center font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSalary.map((entry, idx) => (
              <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{(page - 1) * showEntries + idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{entry.waktu}</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{entry.klien}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{entry.event}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{entry.deskripsi}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(entry)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setCurrentEditing(entry); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedSalary.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-600">
          Showing {filtered.length > 0 ? (page - 1) * showEntries + 1 : 0} to{" "}
          {Math.min(page * showEntries, filtered.length)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {currentEditing ? "Edit Salary" : "Tambah Salary"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu</label>
                <input
                  type="text"
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g. 30 Agt 2025 17:00"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Klien</label>
                <input
                  type="text"
                  value={formData.klien}
                  onChange={(e) => setFormData({ ...formData, klien: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Masukkan nama klien"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event</label>
                <input
                  type="text"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Masukkan nama event"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[80px]"
                  placeholder="Masukkan deskripsi"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Aktif</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    disabled={isSubmitting}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Hapus Data?</h2>
              <p className="text-sm text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Batal</button>
                <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-red-600/20 transition-colors">
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
