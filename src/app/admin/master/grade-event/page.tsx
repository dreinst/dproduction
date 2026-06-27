"use client";

import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface GradeItem {
  id: number;
  grade: string;
}

export default function MasterGradeEventPage() {
  const { data, loading, error, createItem, updateItem, deleteItem } = useCrud<GradeItem>({ endpoint: '/api/grade-events' });
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<GradeItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({ grade: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (item?: GradeItem) => {
    setFormError("");
    if (item) {
      setCurrentEditing(item);
      setFormData({ grade: item.grade });
    } else {
      setCurrentEditing(null);
      setFormData({ grade: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.grade.trim()) {
      setFormError("Grade wajib diisi");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const payload = {
      grade: formData.grade,
    };

    let success = false;
    if (currentEditing) {
      success = await updateItem(currentEditing.id, payload);
    } else {
      success = await createItem(payload);
    }
    
    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
    } else {
      setFormError("Gagal menyimpan data");
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

  const filtered = data.filter((item) => {
    if (searchQuery) {
      return item.grade.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).slice(0, showEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 uppercase">Master Grade Event</h1>

      {error && (
        <div className="p-4 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors" title="Input">
        <Plus className="w-5 h-5" />
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Show</span>
          <input type="number" value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Search:</span>
          <div className="relative">
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
             <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-left font-semibold">Grade</th>
              <th className="px-4 py-3 text-center font-semibold w-32">Sort Index</th>
              <th className="px-4 py-3 text-center font-semibold w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                 <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{item.grade}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center transition-colors" title="Up">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors" title="Down">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setCurrentEditing(item); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-blue-600">Showing 1 to {Math.min(filtered.length, showEntries)} of {filtered.length} entries</p>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Grade Event" : "Tambah Grade Event"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Level A" disabled={isSubmitting} />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors" disabled={isSubmitting}>Batal</button>
              <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data?</h3>
              <p className="text-slate-500 text-sm">Apakah Anda yakin ingin menghapus "{currentEditing?.grade}"?</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
