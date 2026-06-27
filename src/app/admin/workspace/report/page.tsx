"use client";

import { useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface WorkspaceReport {
  id: number;
  title: string;
  date: number;
  month: string;
  time: string;
  client: string;
  status: string;
}

export default function WorkspaceReportPage() {
  const { data, loading, error, createItem, updateItem, deleteItem } = useCrud<WorkspaceReport>({ endpoint: '/api/workspace-reports' });
  const [activeTab, setActiveTab] = useState<"admin" | "selesai" | "performance">("admin");
  const [statusFilter, setStatusFilter] = useState("--- semua ---");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<WorkspaceReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState<Partial<WorkspaceReport>>({
    title: "", date: 1, month: "", time: "", client: "", status: "admin"
  });

  const handleOpenModal = (item?: WorkspaceReport) => {
    if (item) {
      setCurrentEditing(item);
      setFormData({
        title: item.title,
        date: item.date,
        month: item.month,
        time: item.time,
        client: item.client,
        status: item.status
      });
    } else {
      setCurrentEditing(null);
      setFormData({ title: "", date: 1, month: "", time: "", client: "", status: activeTab });
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

  const safeData = data || [];
  
  // Filter based on active tab and status filter
  const filteredData = safeData.filter(d => d.status === activeTab);
  
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-3 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("admin")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "admin" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Administrasi
        </button>
        <button
          onClick={() => setActiveTab("selesai")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "selesai" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Administrasi Selesai
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "performance" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Team Performance
        </button>
      </div>

      <div className="flex justify-between items-center">
        {/* Status filter */}
        <div>
          <label className="block text-sm text-slate-500 mb-1">Status Event</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[200px]"
          >
            <option>--- semua ---</option>
            <option>Berjalan</option>
            <option>Selesai</option>
          </select>
        </div>
        
        <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors mt-6">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
         <div className="p-8 text-center text-slate-500">Loading reports...</div>
      ) : error ? (
         <div className="p-8 text-center text-red-500">Error: {error}</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length === 0 ? (
           <div className="col-span-full p-8 text-center text-slate-500">Tidak ada report</div>
        ) : filteredData.map((event) => (
          <div
            key={event.id}
            className="relative bg-slate-600 rounded-xl overflow-hidden h-48 flex flex-col justify-between p-4 cursor-pointer hover:shadow-lg transition-shadow group"
          >
            {/* Event title & Actions */}
            <div className="flex justify-between items-start z-10 relative">
               <h3 className="text-white font-bold text-sm uppercase tracking-wide pr-4">
                 {event.title}
               </h3>
               <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); handleOpenModal(event); }} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white"><Pencil className="w-3.5 h-3.5" /></button>
                 <button onClick={(e) => { e.stopPropagation(); setCurrentEditing(event); setIsDeleteModalOpen(true); }} className="p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"><Trash2 className="w-3.5 h-3.5" /></button>
               </div>
            </div>

            {/* No Image placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 z-0">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs mt-1">NO IMAGE AVAILABLE</p>
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-end justify-between relative z-10">
              {/* Date badge */}
              <div className="bg-green-600 rounded-lg px-3 py-2 text-center shadow-lg">
                <p className="text-white text-xl font-extrabold leading-none">{event.date}</p>
                <p className="text-green-200 text-[10px] uppercase">{event.month}</p>
                <p className="text-green-200 text-[10px]">⏱ {event.time}</p>
              </div>

              {/* Client */}
              <p className="text-white/90 text-xs font-medium bg-black/30 px-2 py-1 rounded backdrop-blur-sm">{event.client}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Report" : "Tambah Report"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. EVENT BI KALBAR" disabled={isSubmitting} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date (Number)</label>
                   <input type="number" value={formData.date} onChange={e => setFormData({...formData, date: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. 26" disabled={isSubmitting} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Month (String)</label>
                   <input type="text" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. JUN '25" disabled={isSubmitting} />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. 17:00" disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Bank Indonesia" disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Report</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting}>
                   <option value="admin">Administrasi</option>
                   <option value="selesai">Administrasi Selesai</option>
                   <option value="performance">Team Performance</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
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
