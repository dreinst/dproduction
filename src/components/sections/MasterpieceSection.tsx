"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowRight, CalendarDays } from "lucide-react";

// Daftar portofolio resmi D'Production, sesuai dokumen "Portofolio D'Pro 2026 Presentation".
const masterpieces = [
  { title: "Gebyar QRIS Ngalam Bank Indonesia", year: "2023" },
  { title: "HUT Prov. Jawa Timur Ke-78", year: "2023" },
  { title: "Malang BI-Youth-Tiful Festival", year: "2024" },
  { title: "Employee Excellence Award G4S", year: "2024" },
  { title: "QRIS Fun Run Bank Indonesia", year: "2024" },
  { title: "Pesta Demokrasi KPU Kab. Malang", year: "2024" },
  { title: "Emba Run Malang 10K", year: "2025" },
  { title: "Emba JetBus Run Malang 10K", year: "2026" },
  { title: "MS Glow Run Malang Half Marathon", year: "2026" },
  { title: "Smartfren Fun Run Malang", year: "2026" },
];

export default function MasterpieceSection() {
  return (
    <section id="masterpiece" className="py-20 lg:py-32 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            <Trophy className="w-4 h-4" /> Portofolio Terbaik
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Karya <span className="gradient-text">Masterpiece</span> Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Sebagian acara besar yang telah kami eksekusi sejak 2023, dari kampanye Bank Indonesia hingga fun run berskala ribuan peserta di Malang.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterpieces.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.08 }}
              className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50 rounded-3xl p-8 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                <CalendarDays className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">{item.year}</p>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">{item.title}</h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a href="#galeri" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
            Lihat Galeri Momen <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
