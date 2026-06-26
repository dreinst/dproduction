"use client";

import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, CheckSquare, ArrowUp, ArrowDown, Image as ImageIcon, X } from "lucide-react";

// Initial mock data
const initialData = [
  { id: 1, album: "Event Organizer", keterangan: "Flag Off Malang Half Marathon 2026", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 2, album: "Event Organizer", keterangan: "Emba Run Malang 10K", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 3, album: "Event Organizer", keterangan: "Qris Fun Run", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 4, album: "Event Organizer", keterangan: "Qris Jelajah Indonesia", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 5, album: "Event Organizer", keterangan: "Kemenkeu Goes To Bromo", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 6, album: "Event Organizer", keterangan: "Sekartaji Bank Indonesia", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 7, album: "Event Organizer", keterangan: "DIGIFES BI NGALAM", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 8, album: "Event Organizer", keterangan: "Cuddle me", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
  { id: 9, album: "Event Organizer", keterangan: "Rupiah Championship", tanggal: "27 Apr 2026", active: true, sortIndex: 0, image: "" },
];

export default function GaleriFotoPage() {
  const [data, setData] = useState(initialData);
  const [albumFilter, setAlbumFilter] = useState("--- semua ---");
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"foto" | "album">("foto");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({ album: "Event Organizer", keterangan: "", tanggal: "", image: "", active: true });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setCurrentEditing(item);
      setFormData({ album: item.album, keterangan: item.keterangan, tanggal: item.tanggal, image: item.image, active: item.active });
    } else {
      setCurrentEditing(null);
      setFormData({ album: "Event Organizer", keterangan: "", tanggal: "", image: "", active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (currentEditing) {
      setData(data.map(item => item.id === currentEditing.id ? { ...item, ...formData } : item));
    } else {
      setData([{ id: Date.now(), sortIndex: 0, ...formData }, ...data]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (currentEditing) {
      setData(data.filter(item => item.id !== currentEditing.id));
      setIsDeleteModalOpen(false);
      setCurrentEditing(null);
    }
  };

  const filtered = data.filter((item) => {
    if (albumFilter !== "--- semua ---" && item.album !== albumFilter) return false;
    if (statusFilter === "Aktif" && !item.active) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.keterangan.toLowerCase().includes(q) || item.album.toLowerCase().includes(q);
    }
    return true;
  }).slice(0, showEntries);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("foto")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "foto"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Galeri Foto
        </button>
        <button
          onClick={() => setActiveTab("album")}
          className={`py-3 text-sm font-semibold transition-colors ${
            activeTab === "album"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
        >
          Album Foto
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Galeri Foto</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">Album</label>
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          >
            <option>--- semua ---</option>
            <option>Event Organizer</option>
            <option>Wedding</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
          >
            <option>Aktif</option>
            <option>Semua</option>
          </select>
        </div>
      </div>

      <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors" title="Upload Image">
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
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-left font-semibold">Album</th>
              <th className="px-4 py-3 text-center font-semibold">Image</th>
              <th className="px-4 py-3 text-left font-semibold">Keterangan</th>
              <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
              <th className="px-4 py-3 text-center font-semibold">Sort Index</th>
              <th className="px-4 py-3 text-center font-semibold">Aktif</th>
              <th className="px-4 py-3 text-center font-semibold w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{item.album}</td>
                <td className="px-4 py-3 text-center">
                   {item.image ? (
                      <div className="w-12 h-12 rounded bg-slate-200 mx-auto overflow-hidden">
                         <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                   ) : (
                      <div className="w-12 h-12 rounded bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                         <ImageIcon className="w-5 h-5" />
                      </div>
                   )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">{item.keterangan}</td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{item.tanggal}</td>
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
                  {item.active ? <CheckSquare className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-slate-400">-</span>}
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
            ))}
            {filtered.length === 0 && (
              <tr>
                 <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-blue-600">Showing 1 to {Math.min(filtered.length, showEntries)} of {filtered.length} entries</p>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Galeri Foto" : "Tambah Galeri Foto"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Album</label>
                <select value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option>Event Organizer</option>
                  <option>Wedding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input type="text" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Masukkan keterangan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input type="text" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. 27 Apr 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Foto (Opsional)</label>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Masukkan URL foto" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="active-check-gf" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                <label htmlFor="active-check-gf" className="text-sm font-medium text-slate-700">Aktif</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Batal</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors">Simpan</button>
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
              <p className="text-slate-500 text-sm">Apakah Anda yakin ingin menghapus foto "{currentEditing?.keterangan}"?</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
