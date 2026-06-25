"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Target, Eye, Trophy } from "lucide-react";

export default function TentangKamiSection() {
  return (
    <section id="tentang-kami" className="py-20 lg:py-32 overflow-hidden bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">
          {/* Images Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-6 pt-12">
                <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-xl bg-slate-200">
                </div>
                <div className="rounded-3xl overflow-hidden aspect-square shadow-xl bg-slate-200">
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl overflow-hidden aspect-square shadow-xl bg-slate-200">
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-xl bg-slate-200">
                </div>
              </div>
            </div>
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-100 rounded-full blur-3xl -z-10"></div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6">
              Tentang Kami
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
              Lebih Dari Sekadar <span className="gradient-text">Event Organizer</span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              D'Production adalah mitra terpercaya Anda di Malang. Kami percaya bahwa setiap acara memiliki cerita dan tujuannya masing-masing. Oleh karena itu, kami tidak hanya menyelenggarakan acara, tapi kami merancang pengalaman.
            </p>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Dengan tim yang berdedikasi tinggi, kreatif, dan berpengalaman, kami memastikan setiap detail—dari konsep hingga eksekusi—berjalan dengan sempurna.
            </p>

            <ul className="space-y-4 mb-10">
              {["Konsep Kreatif & Out of the Box", "Manajemen Budget Transparan", "Tim Profesional & Berpengalaman", "Garansi Kesuksesan Acara"].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-800 font-bold">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-8 lg:gap-12 pt-6 border-t border-slate-200">
              <div>
                <p className="text-4xl font-extrabold text-blue-600 mb-2">17+</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Klien</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-blue-600 mb-2">10+</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tahun Pengalaman</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-blue-600 mb-2">47+</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Event Sukses</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
