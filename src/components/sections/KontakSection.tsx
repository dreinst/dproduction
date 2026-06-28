"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function KontakSection() {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    eventType: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.eventType || !formData.message) {
      setStatus("error");
      setErrorMessage("Semua field wajib diisi.");
      return;
    }
    
    const waRegex = /^08\d{8,11}$/;
    if (!waRegex.test(formData.whatsapp)) {
      setStatus("error");
      setErrorMessage("Format nomor WhatsApp tidak valid (contoh: 08123456789).");
      return;
    }

    setStatus("loading");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Terjadi kesalahan. Silakan coba lagi nanti.");
        return;
      }
      
      setStatus("success");
      setFormData({ name: "", whatsapp: "", eventType: "", message: "" });
      
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
      
    } catch (error) {
      setStatus("error");
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi nanti.");
    }
  };

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
                <a href="https://wa.me/6281938938800" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                  +62 819-3893-8800
                </a>
              </div>
            </div>

            <div className="glass-card p-8 flex items-start gap-6 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Email</h3>
                <a href="mailto:dproductionorganizer@gmail.com" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
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
                <p className="text-slate-600">Senin - Sabtu: 09.00 - 17.00 WIB</p>
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
              
              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}
              
              {status === "success" && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-start gap-3 border border-green-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Pesan berhasil dikirim! Tim kami akan segera menghubungi Anda.</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp</label>
                  <input type="text" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" placeholder="08123456789" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Acara</label>
                <select value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none disabled:opacity-50">
                  <option value="">Pilih Jenis Acara...</option>
                  <option value="corporate">Corporate Gathering</option>
                  <option value="wedding">Wedding / Pernikahan</option>
                  <option value="exhibition">Pameran / Exhibition</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pesan & Detail Acara</label>
                <textarea rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} disabled={status === "loading"} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50" placeholder="Ceritakan konsep atau kebutuhan acara Anda..."></textarea>
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
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15804.81156829705!2d112.597793!3d-7.978007!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7882afb1854ea7%3A0xebc95971a812e95f!2sD&#39;Production!5e0!3m2!1sen!2sid!4v1714578168234!5m2!1sen!2sid" 
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
