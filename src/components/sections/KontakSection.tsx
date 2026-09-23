"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, AlertCircle, ChevronDown, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import {
  EVENT_OPTIONS,
  WHATSAPP_DEFAULT_TEXT,
  WHATSAPP_PATTERN,
  eventLabel,
  normalizeWhatsapp,
  whatsappUrl,
  trackWhatsAppClick,
  trackFormConversion,
} from "@/lib/site";

const EMPTY_FORM = { name: "", whatsapp: "", eventType: "", message: "", website: "" };
const SEND_FAILED = "Pesan belum terkirim karena gangguan koneksi atau server.";
const MAP_QUERY = "D'Production Event & Wedding Planner, Jl. Raya Pandanlandung No.16, Bandulan, Wagir, Malang";

export default function KontakSection() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showError = (nextStatus: "error" | "failed", message: string) => {
    setStatus(nextStatus);
    setErrorMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearTimeout(resetTimer.current);
    const whatsapp = normalizeWhatsapp(formData.whatsapp);

    if (!formData.name.trim() || !whatsapp || !formData.eventType || !formData.message.trim()) {
      return showError("error", "Semua field wajib diisi.");
    }
    if (!WHATSAPP_PATTERN.test(whatsapp)) {
      return showError("error", "Format nomor WhatsApp tidak valid (contoh: 08123456789).");
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, whatsapp })
      });
      const data: { success?: unknown; message?: unknown } | null = await res.json().catch(() => null);

      if (!res.ok || data?.success !== true) {
        return showError("failed", typeof data?.message === "string" ? data.message : SEND_FAILED);
      }

      setStatus("success");
      setFormData(EMPTY_FORM);
      trackFormConversion();
      resetTimer.current = setTimeout(() => setStatus("idle"), 3000);
    } catch {
      showError("failed", SEND_FAILED);
    }
  };

  const whatsappFallbackText = `${WHATSAPP_DEFAULT_TEXT}\n\nNama: ${formData.name}\nJenis acara: ${formData.eventType ? eventLabel(formData.eventType) : ""}\nPesan: ${formData.message}`;

  return (
    <section id="kontak" className="py-20 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Hubungi Kami
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Mari Mulai <span className="gradient-text">Cerita Baru</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Konsultasikan rencana acara Anda secara gratis. Tim kami siap memberikan solusi terbaik sesuai budget dan kebutuhan Anda.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 max-w-6xl mx-auto">
          
          {/* Contact Info Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-8 flex items-start gap-6 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Alamat Kantor</h3>
                <p className="text-slate-600 leading-relaxed">
                  Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang, Jawa Timur
                </p>
              </div>
            </div>

            <div className="glass-card p-8 flex items-start gap-6 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Telepon / WA</h3>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                  +62 819-3893-8800
                </a>
              </div>
            </div>

            <div className="glass-card p-8 flex items-start gap-6 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xl text-slate-900 mb-2">Email</h3>
                <a href="mailto:dproductionorganizer@gmail.com" className="break-all text-slate-600 hover:text-blue-600 transition-colors font-medium">
                  dproductionorganizer@gmail.com
                </a>
              </div>
            </div>

            <div className="glass-card p-8 flex items-start gap-6 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Jam Kerja</h3>
                <p className="text-slate-600">Senin sampai Sabtu, 09.00 sampai 17.00 WIB</p>
                <p className="text-slate-600">Minggu: Libur / Sesuai Janji</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form & Map */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 glass-card p-8 lg:p-12"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Kirim Pesan Langsung</h3>
            
            <form className="space-y-6 mb-10" onSubmit={handleSubmit}>
              
              {(status === "error" || status === "failed") && (
                <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-medium">
                    <p>{errorMessage}</p>
                    {status === "failed" && (
                      <>
                        <p className="mt-1 text-slate-600">Isian Anda masih tersimpan. Anda bisa langsung mengirimnya lewat WhatsApp.</p>
                        <a href={whatsappUrl(whatsappFallbackText)} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white font-bold hover:bg-green-800 transition-colors">
                          <MessageCircle className="w-4 h-4" /> Kirim lewat WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {status === "success" && (
                <div role="status" className="bg-green-50 text-green-600 p-4 rounded-xl flex items-start gap-3 border border-green-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Pesan berhasil dikirim! Tim kami akan segera menghubungi Anda.</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="kontak-nama" className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                  <input id="kontak-nama" name="name" type="text" autoComplete="name" required maxLength={100} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" placeholder="John Doe" />
                </div>
                <div>
                  <label htmlFor="kontak-whatsapp" className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp</label>
                  <input id="kontak-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" placeholder="08123456789" />
                </div>
              </div>
              <div>
                <label htmlFor="kontak-acara" className="block text-sm font-bold text-slate-700 mb-2">Jenis Acara</label>
                <div className="relative">
                  <select id="kontak-acara" name="eventType" autoComplete="off" required value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})} disabled={status === "loading"} className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none disabled:opacity-50">
                    <option value="">Pilih Jenis Acara...</option>
                    {EVENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                </div>
              </div>
              <div>
                <label htmlFor="kontak-pesan" className="block text-sm font-bold text-slate-700 mb-2">Pesan & Detail Acara</label>
                <textarea id="kontak-pesan" name="message" autoComplete="off" required maxLength={2000} rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50" placeholder="Ceritakan konsep atau kebutuhan acara Anda..."></textarea>
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="kontak-website">Website</label>
                <input id="kontak-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
              </div>
              <button type="submit" disabled={status === "loading"} className="w-full py-4 gradient-bg text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                {status === "loading" ? (
                  <>Mengirim... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Kirim Pesan <Send className="w-5 h-5" /></>
                )}
              </button>
            </form>

            <div className="w-full h-64 bg-slate-200 rounded-2xl overflow-hidden relative">
              <iframe 
                title="Peta lokasi kantor D'Production di Wagir, Malang"
                src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
                className="absolute inset-0 w-full h-full border-0" 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
