"use client";

import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, ExternalLink } from "lucide-react";

const initialData = [
  { id: 1, name: "Event", icon: "fa-users", levelA: "Rp 500.000", levelB: "Rp 400.000", levelC: "Rp 300.000" },
  { id: 2, name: "Gladi Bersih", icon: "fa-microphone", levelA: "Rp 400.000", levelB: "Rp 300.000", levelC: "Rp 200.000" },
  { id: 3, name: "Gladi Kotor", icon: "fa-microphone-alt", levelA: "Rp 400.000", levelB: "Rp 300.000", levelC: "Rp 200.000" },
  { id: 4, name: "Loading", icon: "fa-truck", levelA: "Rp 50.000", levelB: "Rp 40.000", levelC: "Rp 30.000" },
  { id: 5, name: "Meeting", icon: "fa-comments", levelA: "Rp 30.000", levelB: "Rp 20.000", levelC: "Rp 10.000" },
  { id: 6, name: "Survey", icon: "fa-map-marked-alt", levelA: "Rp 100.000", levelB: "Rp 50.000", levelC: "Rp 25.000" },
];

export default function MasterJobDescPage() {
  const [data, setData] = useState(initialData);
  const [showEntries, setShowEntries] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEditing, setCurrentEditing] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({ name: "", icon: "", levelA: "", levelB: "", levelC: "" });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setCurrentEditing(item);
      setFormData({ name: item.name, icon: item.icon || "", levelA: item.levelA || "", levelB: item.levelB || "", levelC: item.levelC || "" });
    } else {
      setCurrentEditing(null);
      setFormData({ name: "", icon: "", levelA: "", levelB: "", levelC: "" });
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

  const filtered = data.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q);
    }
    return true;
  }).slice(0, showEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 uppercase">Master Job Description</h1>

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

      <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-800 text-white text-sm">
              <th className="px-4 py-3 text-left font-semibold w-16 border-r border-slate-700">No</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-slate-700">Nama</th>
              <th className="px-4 py-3 text-left font-semibold border-r border-slate-700">Grade Event Salary</th>
              <th className="px-4 py-3 text-center font-semibold w-12 border-r border-slate-700"></th>
              <th className="px-4 py-3 text-center font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors bg-slate-100/50">
                <td className="px-4 py-3 text-sm text-slate-600 align-top border-r border-slate-200">{idx + 1}.</td>
                <td className="px-4 py-3 text-sm text-slate-800 font-medium align-top border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    {item.name}
                    {item.icon && <i className={`fas ${item.icon} text-slate-400 text-xs`}></i>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-200">
                  <div className="space-y-1">
                    {item.levelA && <div>Level A = {item.levelA}</div>}
                    {item.levelB && <div>Level B = {item.levelB}</div>}
                    {item.levelC && <div>Level C = {item.levelC}</div>}
                  </div>
                </td>
                <td className="px-2 py-3 text-center align-top border-r border-slate-200">
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-2 py-3 text-center align-top">
                  <button onClick={() => { setCurrentEditing(item); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                 <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Showing 1 to {Math.min(filtered.length, showEntries)} of {filtered.length} entries</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 text-sm text-slate-400">Previous</button>
          <button className="w-8 h-8 border border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium">1</button>
          <button className="px-3 py-1 text-sm text-slate-600">Next</button>
        </div>
      </div>

      <div className="pt-4">
        <a href="https://fontawesome.com/v5/search?m=free" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 underline flex items-center gap-1 w-fit">
          Click to view list font awesome 5 icon
        </a>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{currentEditing ? "Edit Master JobDesc" : "Tambah Master JobDesc"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama JobDesc</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Event" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Icon (FontAwesome 5)</label>
                <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. fa-users" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level A Salary</label>
                  <input type="text" value={formData.levelA} onChange={e => setFormData({...formData, levelA: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Rp 500.000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level B Salary</label>
                  <input type="text" value={formData.levelB} onChange={e => setFormData({...formData, levelB: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Rp 400.000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level C Salary</label>
                  <input type="text" value={formData.levelC} onChange={e => setFormData({...formData, levelC: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Rp 300.000" />
                </div>
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
