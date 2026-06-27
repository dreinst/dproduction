"use client";

import { useState, useEffect } from "react";
import { Pencil, MapPin, Phone, Mail, Globe, Calendar, Building, X } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface KantorSettingItem {
  id: number;
  companyName: string;
  status: string;
  motto1: string;
  motto2: string;
  description: string;
  foundedDate: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  aboutUs: string;
  googleMapsUrl: string;
}

export default function SettingKantorPage() {
  const { data, loading, error, updateItem } = useCrud<KantorSettingItem>({ endpoint: '/api/kantor-settings' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState<Partial<KantorSettingItem>>({});

  const settings = data?.[0] || null;

  const handleOpenModal = () => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        status: settings.status || "",
        motto1: settings.motto1 || "",
        motto2: settings.motto2 || "",
        description: settings.description || "",
        foundedDate: settings.foundedDate || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        aboutUs: settings.aboutUs || "",
        googleMapsUrl: settings.googleMapsUrl || ""
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSubmitting(true);
    setFormError("");

    const success = await updateItem(settings.id, formData);
    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
    } else {
      setFormError("Gagal menyimpan pengaturan kantor.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading setting kantor...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Setting belum diinisialisasi.</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">SETTING KANTOR</h1>
        <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Pencil className="w-4 h-4" /> Edit Setting
        </button>
      </div>

      {/* Company name bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-bold text-slate-800 text-lg">{settings.companyName}</p>
      </div>

      {/* Settings grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="flex items-center px-6 py-4 gap-4">
          <span className="text-slate-400 w-32 text-sm font-medium">Status</span>
          <span className="text-slate-700 text-sm">{settings.status || "-"}</span>
        </div>

        <div className="px-6 py-4">
          <span className="text-slate-400 text-sm font-medium mb-2 block">Motto</span>
          <h2 className="text-3xl font-extrabold text-slate-800">
            {settings.motto1}
          </h2>
          <h2 className="text-3xl font-extrabold text-blue-600">{settings.motto2}</h2>
          <p className="text-slate-500 mt-2 text-sm">
            {settings.description}
          </p>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">{settings.foundedDate ? new Date(settings.foundedDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Building className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">{settings.address || "-"}</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Phone className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">{settings.phone || "-"}</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Mail className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">{settings.email || "-"}</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Globe className="w-5 h-5 text-slate-400" />
          <span className="text-blue-600 text-sm">{settings.website || "-"}</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Google Maps Embed</p>
            <p className="text-xs mt-1">{settings.googleMapsUrl}</p>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-slate-800">Link Media Sosial</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</span>
            <span className="text-blue-600">{settings.facebookUrl || "-"}</span>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ig</span>
            <span className="text-blue-600">{settings.instagramUrl || "-"}</span>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">yt</span>
            <span className="text-blue-600">{settings.youtubeUrl || "-"}</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">tt</span>
            <span className="text-slate-400 text-sm">{settings.tiktokUrl || "-"}</span>
          </div>
        </div>
      </div>

      {/* Tentang Kami */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800">Tentang Kami</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {settings.aboutUs}
        </p>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Edit Setting Kantor</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {formError && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Perusahaan</label>
                  <input type="text" value={formData.companyName || ""} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Partner</label>
                  <input type="text" value={formData.status || ""} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Berdiri</label>
                <input type="date" value={formData.foundedDate || ""} onChange={e => setFormData({...formData, foundedDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motto 1 (Teks Gelap)</label>
                  <input type="text" value={formData.motto1 || ""} onChange={e => setFormData({...formData, motto1: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motto 2 (Teks Biru)</label>
                  <input type="text" value={formData.motto2 || ""} onChange={e => setFormData({...formData, motto2: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Motto</label>
                <textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[60px]" disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                  <input type="text" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="text" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input type="text" value={formData.website || ""} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                  <input type="text" value={formData.facebookUrl || ""} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                  <input type="text" value={formData.instagramUrl || ""} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
                  <input type="text" value={formData.youtubeUrl || ""} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TikTok URL</label>
                  <input type="text" value={formData.tiktokUrl || ""} onChange={e => setFormData({...formData, tiktokUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" disabled={isSubmitting} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Kantor</label>
                <textarea value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[60px]" disabled={isSubmitting} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Embed URL / iFrame</label>
                <textarea value={formData.googleMapsUrl || ""} onChange={e => setFormData({...formData, googleMapsUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[60px]" disabled={isSubmitting} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tentang Kami</label>
                <textarea value={formData.aboutUs || ""} onChange={e => setFormData({...formData, aboutUs: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[120px]" disabled={isSubmitting} />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors" disabled={isSubmitting}>Batal</button>
              <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
