"use client";

import { useState } from "react";
import { Pencil, MapPin, Phone, Mail, Globe, Calendar, Building } from "lucide-react";

export default function SettingKantorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">SETTING KANTOR</h1>

      {/* Company name bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-bold text-slate-800 text-lg">DPro</p>
      </div>

      {/* Settings grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="flex items-center px-6 py-4 gap-4">
          <span className="text-slate-400 w-32 text-sm font-medium">Status</span>
          <span className="text-slate-700 text-sm">Your event partner</span>
        </div>

        <div className="px-6 py-4">
          <span className="text-slate-400 text-sm font-medium mb-2 block">Motto</span>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Your <span className="text-blue-600">Dream Event</span>
          </h2>
          <h2 className="text-3xl font-extrabold text-blue-600">Starts Here</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Partner with D&apos;Production Event Planner and Make Every Moment Truly Remarkable
          </p>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">01 Januari 2016</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Building className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang, Jawa Timur</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Phone className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">081938938800</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Mail className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 text-sm">dproductionorganizer@gmail.com</span>
        </div>

        <div className="flex items-center px-6 py-4 gap-4">
          <Globe className="w-5 h-5 text-slate-400" />
          <span className="text-blue-600 text-sm">http://localhost/dpro</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Google Maps Embed</p>
            <p className="text-xs mt-1">D&apos;Production Event & Wedding Planner</p>
            <p className="text-xs">Jl. Raya Pandanlandung No.16, Malang</p>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-slate-800">Link Media Sosial</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</span>
            <span className="text-blue-600">https://id-id.facebook.com/kanwilbcgatim2/</span>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ig</span>
            <span className="text-blue-600">https://www.instagram.com/dpro.duction</span>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-slate-50">
            <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">yt</span>
            <span className="text-blue-600">https://youtube.com/@dproductionzone</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">tt</span>
            <span className="text-slate-400 text-sm">-</span>
          </div>
        </div>
      </div>

      {/* Tentang Kami */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800">Tentang Kami</h3>
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Di <strong>D&apos;Production</strong>, kami percaya setiap acara adalah cerita yang layak diceritakan dengan sempurna. 
          Sebagai <strong>Event Organizer</strong> terpercaya, kami hadir bukan sekadar menyusun jadwal dan dekorasi, 
          tetap merancang pengalaman yang membekas di hati setiap tamu undangan. Dengan tim profesional yang berdedikasi tinggi, 
          konsep kreatif yang segar, dan eksekusi yang presisi di setiap detail, kami siap mewujudkan{" "}
          <strong>Corporate Gathering, Seminar, Product Launching, Gala Dinner, hingga acara skala besar lainnya</strong>{" "}
          menjadi momen-momen yang tak terlupakan.
        </p>
      </div>
    </div>
  );
}
