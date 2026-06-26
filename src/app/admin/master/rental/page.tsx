"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, CheckSquare, Search, Image as ImageIcon, X } from "lucide-react";

// Initial mock data based on live site format
const initialData = [
  { id: 1, name: "Sound system", description: "Persewaan sound system terbaik untuk acara Anda.", price: "1.000.000", unit: "hari", waCart: "https://wa.me/p/...", photo: "", active: true },
];

export default function MasterRentalPage() {
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState("Aktif");
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: "", description: "", price: "", unit: "", waCart: "", photo: "", active: true });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setCurrentEditing(item);
      setFormData({ name: item.name, description: item.description, price: item.price, unit: item.unit, waCart: item.waCart, photo: item.photo, active: item.active });
    } else {
      setCurrentEditing(null);
      setFormData({ name: "", description: "", price: "", unit: "", waCart: "", photo: "", active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (currentEditing) {
      setData(data.map(item => item.id === currentEditing.id ? { ...item, ...formData } : item));
    } else {
      setData([...data, { id: Date.now(), ...formData }]);
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

  const filteredData = data.filter(item => 
    (statusFilter === "Semua" || (statusFilter === "Aktif" && item.active)) && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, showEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 uppercase">Master Persewaan</h1>

      {/* Filters and Add Button */}
      <div>
        <label className="block text-sm text-slate-500 mb-1">Status Aktif</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]">
          <option>Aktif</option>
          <option>Semua</option>
        </select>
      </div>

      <button onClick={() => handleOpenModal()} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors" title="Input">
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
          <div className="relative">
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
             <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-3 py-3 text-left font-semibold w-10">No</th>
              <th className="px-3 py-3 text-left font-semibold">Nama</th>
              <th className="px-3 py-3 text-left font-semibold">Deskripsi</th>
              <th className="px-3 py-3 text-left font-semibold">Harga</th>
              <th className="px-3 py-3 text-left font-semibold">Satuan</th>
              <th className="px-3 py-3 text-left font-semibold">WA Cart</th>
              <th className="px-3 py-3 text-center font-semibold">Foto</th>
              <th className="px-3 py-3 text-center font-semibold w-16">Aktif</th>
              <th className="px-3 py-3 text-center font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                <td className="px-3 py-3 text-slate-600">{idx + 1}.</td>
                <td className="px-3 py-3 text-slate-800 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-slate-600 truncate max-w-[150px]">{item.description}</td>
                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{item.price}</td>
                <td className="px-3 py-3 text-slate-600">{item.unit}</td>
                <td className="px-3 py-3 text-blue-600 truncate max-w-[100px]">
                  {item.waCart ? <a href={item.waCart} target="_blank" rel="noreferrer" className="hover:underline">Link</a> : "-"}
                </td>
                <td className="px-3 py-3 text-center">
                   {item.photo ? (
                      <div className="w-10 h-10 rounded bg-slate-200 mx-auto overflow-hidden">
                         <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                   ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                         <ImageIcon className="w-4 h-4" />
                      </div>
                   )}
                </td>
                <td className="px-3 py-3 text-center">
                  {item.active ? <CheckSquare className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setCurrentEditing(item); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                 <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-blue-600">Showing 1 to {Math.min(filteredData.length, showEntries)} of {filteredData.length} entries</p>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Master Rental" : "Tambah Master Rental"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Rental</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Harga</label>
                   <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                   <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WA Cart URL</label>
                <input type="text" value={formData.waCart} onChange={e => setFormData({...formData, waCart: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="https://wa.me/p/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Foto (Opsional)</label>
                <input type="text" value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="active-check-rt" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                <label htmlFor="active-check-rt" className="text-sm font-medium text-slate-700">Aktif</label>
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
              <p className="text-slate-500 text-sm">Apakah Anda yakin ingin menghapus "{currentEditing?.name}"?</p>
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
