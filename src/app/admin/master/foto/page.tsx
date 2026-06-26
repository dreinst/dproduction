"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, Image as ImageIcon, X } from "lucide-react";

const initialData = [
  { id: 1, image: "/images/foto-1.jpg", link: "https://dpro.events/images/foto/foto-1.jpg" },
  { id: 2, image: "/images/foto-2.jpg", link: "https://dpro.events/images/foto/foto-2.jpg" },
];

export default function MasterFotoPage() {
  const [data, setData] = useState(initialData);
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({ image: "", link: "" });

  const handleOpenModal = () => {
    setCurrentEditing(null);
    setFormData({ image: "", link: "" });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setData([{ id: Date.now(), ...formData }, ...data]);
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
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.link.toLowerCase().includes(q) || item.image.toLowerCase().includes(q);
    }
    return true;
  }).slice(0, showEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Master Foto</h1>

      <button onClick={handleOpenModal} className="w-10 h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors" title="Upload Image">
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
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-12">No</th>
              <th className="px-4 py-3 text-center font-semibold w-24">Image</th>
              <th className="px-4 py-3 text-left font-semibold">Link</th>
              <th className="px-4 py-3 text-center font-semibold w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}.</td>
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
                <td className="px-4 py-3">
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[300px] block">{item.link}</a>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setCurrentEditing(item); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                 <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-blue-600">Showing 1 to {Math.min(filtered.length, showEntries)} of {filtered.length} entries</p>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Upload Image</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Preview)</label>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="/images/foto.jpg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link URL</label>
                <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="https://dpro.events/images/foto/..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Foto?</h3>
              <p className="text-slate-500 text-sm">Apakah Anda yakin ingin menghapus foto ini secara permanen?</p>
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
