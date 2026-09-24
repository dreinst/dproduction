"use client";

import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";

const highlights = [
  {
    name: "Bank Indonesia",
    role: "Program Hebitren & Temu Responden",
    review: "Mendampingi rangkaian program Hebitren di Bandung dan Yogyakarta serta Temu Responden di Magelang sepanjang 2026, dari penjemputan peserta hingga gala dinner malam puncak.",
  },
  {
    name: "PT. Ustegra",
    role: "Peresmian Gedung Ekstensi",
    review: "Mengelola seremoni peresmian gedung pabrik baru di Malang pada 24 Agustus 2026, mulai dari tur pabrik bersama tamu VIP, dekorasi panggung, hingga hiburan live band.",
  },
];

const clients = [
  "Bank Indonesia",
  "PT. Ustegra",
  "G4S",
  "KPU Kab. Malang",
  "Emba",
  "MS Glow",
  "Smartfren",
  "Pemprov Jawa Timur",
];

export default function KlienSection() {
  return (
    <section id="klien" className="py-20 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Klien & Mitra
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Mereka yang <span className="gradient-text">Mempercayai</span> Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Kebanggaan bagi kami dapat bekerjasama dengan berbagai perusahaan dan instansi dalam menyukseskan acara mereka.
          </motion.p>
        </div>

        {/* Logo row */}
        <div className="w-full bg-white py-10 mb-20 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
            {clients.map((client) => (
              <div key={client} className="text-2xl font-black text-slate-500 uppercase tracking-widest text-center px-4">
                {client}
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {highlights.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 relative group hover:-translate-y-2 transition-transform duration-300 flex flex-col"
            >
              <div className="absolute top-8 right-8 text-blue-50 group-hover:text-blue-100 transition-colors duration-300">
                <CalendarCheck className="w-12 h-12" />
              </div>

              <p className="text-slate-600 leading-relaxed mb-8 relative z-10 flex-grow">
                {item.review}
              </p>

              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
