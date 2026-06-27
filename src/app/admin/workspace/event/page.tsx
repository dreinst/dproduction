"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Calendar, ArrowRight, Search, X } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface WorkspaceEvent {
  id: number;
  jobDesc: string;
  date: string; 
  client: string;
  status: string;
  waktu?: string | null;
  event?: string | null;
  deskripsi?: string | null;
  linkFoto?: string | null;
  linkVideo?: string | null;
  active?: boolean;
}

export default function WorkspaceEventPage() {
  const { data, loading, error, createItem, updateItem, deleteItem } = useCrud<WorkspaceEvent>({ endpoint: '/api/workspace-events' });
  const [activeTab, setActiveTab] = useState<"berjalan" | "selesai">("berjalan");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<WorkspaceEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState<Partial<WorkspaceEvent>>({
    jobDesc: "", date: "", client: "", status: "running", waktu: "", event: "", deskripsi: "", linkFoto: "", linkVideo: "", active: true
  });

  const handleOpenModal = (item?: WorkspaceEvent) => {
    if (item) {
      setCurrentEditing(item);
      setFormData({
        jobDesc: item.jobDesc || "",
        date: item.date ? new Date(item.date).toISOString().slice(0,16) : "", // format for datetime-local
        client: item.client || "",
        status: item.status || (activeTab === "berjalan" ? "running" : "selesai"),
        waktu: item.waktu || "",
        event: item.event || "",
        deskripsi: item.deskripsi || "",
        linkFoto: item.linkFoto || "",
        linkVideo: item.linkVideo || "",
        active: item.active ?? true
      });
    } else {
      setCurrentEditing(null);
      setFormData({ jobDesc: "", date: "", client: "", status: activeTab === "berjalan" ? "running" : "selesai", waktu: "", event: "", deskripsi: "", linkFoto: "", linkVideo: "", active: true });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFormError("");
    
    // Convert local datetime string to ISO 8601 for Prisma
    const isoDate = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();
    
    const payload = {
      ...formData,
      date: isoDate
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
      setFormError("Gagal menyimpan data.");
    }
  };

  const handleMarkAsDone = async (item: WorkspaceEvent) => {
    setIsSubmitting(true);
    const success = await updateItem(item.id, { status: "selesai" });
    setIsSubmitting(false);
    if(success) {
       // Optional notification
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
  
  const eventsRunning = safeData.filter(d => d.status === "running").filter(e => {
    if(searchQuery) {
      return (e.jobDesc || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             (e.client || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).slice(0, showEntries);
  
  const eventsCompleted = safeData.filter(d => d.status === "selesai").filter(e => {
    if(searchQuery) {
      return (e.event || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
             (e.client || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).slice(0, showEntries);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("berjalan")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "berjalan" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Event Berjalan
        </button>
        <button
          onClick={() => setActiveTab("selesai")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "selesai" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Event Selesai
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">
        {activeTab === "berjalan" ? "EVENT BERJALAN" : "EVENT SELESAI"}
      </h1>

      {activeTab === "berjalan" && (
        <>
          <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <Plus className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Show</span>
              <input type="number" value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm" />
              <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading events...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error: {error}</div>
            ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="px-4 py-3 text-left font-semibold">Job Description</th>
                  <th className="px-4 py-3 text-center font-semibold" colSpan={2}>Jadwal</th>
                  <th className="px-4 py-3 text-left font-semibold">Team Event</th>
                  <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                </tr>
                <tr className="bg-slate-700 text-white text-xs">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2 text-center">Awal</th>
                  <th className="px-4 py-2 text-center">Akhir</th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {eventsRunning.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="text-slate-800 font-medium">{event.jobDesc}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(event.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        <Users className="w-3 h-3 inline mr-1" />
                        {event.client}
                      </span>
                      <button onClick={() => handleMarkAsDone(event)} className="ml-2 inline-flex items-center px-2 py-0.5 bg-red-100 text-red-600 hover:bg-red-200 text-xs rounded-full cursor-pointer" title="Mark as Selesai">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">-</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">-</td>
                    <td className="px-4 py-3 text-sm text-slate-600">-</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenModal(event)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setCurrentEditing(event); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {eventsRunning.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada event berjalan</td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>

          <p className="text-sm text-blue-600">
            Showing 1 to {eventsRunning.length} of {safeData.filter(d => d.status === "running").length} entries
          </p>
        </>
      )}

      {activeTab === "selesai" && (
        <>
          <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Show</span>
              <input type="number" value={showEntries} onChange={(e) => setShowEntries(Number(e.target.value))} className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center text-sm" />
              <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading events...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error: {error}</div>
            ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="px-3 py-3 text-left font-semibold w-10">No</th>
                  <th className="px-3 py-3 text-left font-semibold">Waktu</th>
                  <th className="px-3 py-3 text-left font-semibold">Klien</th>
                  <th className="px-3 py-3 text-left font-semibold">Event</th>
                  <th className="px-3 py-3 text-left font-semibold">Deskripsi</th>
                  <th className="px-3 py-3 text-left font-semibold">Link Foto</th>
                  <th className="px-3 py-3 text-left font-semibold">Link Video</th>
                  <th className="px-3 py-3 text-center font-semibold">Foto</th>
                  <th className="px-3 py-3 text-center font-semibold">Aktif</th>
                  <th className="px-3 py-3 text-center font-semibold w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsCompleted.map((event, idx) => (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs">
                    <td className="px-3 py-2 text-slate-600">{idx + 1}.</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{event.waktu}</td>
                    <td className="px-3 py-2 text-slate-800 font-medium">{event.client}</td>
                    <td className="px-3 py-2 text-slate-600">{event.event}</td>
                    <td className="px-3 py-2 text-slate-600">{event.deskripsi}</td>
                    <td className="px-3 py-2 text-blue-500">{event.linkFoto ? <a href={event.linkFoto} target="_blank" rel="noreferrer">Link</a> : '-'}</td>
                    <td className="px-3 py-2 text-blue-500">{event.linkVideo ? <a href={event.linkVideo} target="_blank" rel="noreferrer">Link</a> : '-'}</td>
                    <td className="px-3 py-2 text-center">-</td>
                    <td className="px-3 py-2 text-center">{event.active ? 'Ya' : 'Tidak'}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(event)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setCurrentEditing(event); setIsDeleteModalOpen(true); }} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {eventsCompleted.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">Tidak ada event selesai</td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>

          <p className="text-sm text-blue-600">
            Showing 1 to {eventsCompleted.length} of {safeData.filter(d => d.status === "selesai").length} entries
          </p>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Event" : "Tambah Event"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>}
              
              {/* Event Berjalan Fields */}
              {activeTab === "berjalan" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                    <input type="text" value={formData.jobDesc} onChange={e => setFormData({...formData, jobDesc: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. QrisMa #Level B" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                    <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Bank Indonesia" disabled={isSubmitting} />
                  </div>
                </>
              )}

              {/* Event Selesai Fields */}
              {activeTab === "selesai" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client / Klien</label>
                    <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Nama Klien" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Event</label>
                    <input type="text" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Nama Event" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Waktu</label>
                    <input type="text" value={formData.waktu} onChange={e => setFormData({...formData, waktu: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. 30 Agt 2025 17:00" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                    <input type="text" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Deskripsi Event" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link Foto</label>
                    <input type="text" value={formData.linkFoto} onChange={e => setFormData({...formData, linkFoto: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="URL Foto" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link Video</label>
                    <input type="text" value={formData.linkVideo} onChange={e => setFormData({...formData, linkVideo: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="URL Video" disabled={isSubmitting} />
                  </div>
                  {/* JobDesc parameter required for workspace-events API, default if not filled */}
                  <div className="hidden">
                     <input type="text" value={formData.jobDesc = formData.jobDesc || "-"} readOnly />
                  </div>
                </>
              )}
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
