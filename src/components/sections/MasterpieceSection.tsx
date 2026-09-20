"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Trophy, ArrowRight } from "lucide-react";

const masterpieces = [
  {
    title: "Peresmian Gedung Ekstensi PT. Ustegra",
    date: "24 Agustus 2026",
    category: "Corporate Event",
    description: "Mengelola seremoni peresmian gedung pabrik baru PT. Ustegra Malang secara menyeluruh, dari tur pabrik bersama tamu VIP, dekorasi panggung, hingga hiburan live band di hari puncak acara.",
    image: "/assets/portfolio/ustegra-peresmian-aerial.jpg",
  },
  {
    title: "Program Hebitren Bank Indonesia — Bandung",
    date: "2026",
    category: "Corporate Event",
    description: "Mendampingi rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Bandung, termasuk kunjungan ke Masjid Raya Al Jabbar, selama lima hari penuh dari penjemputan sampai kepulangan.",
    image: "/assets/portfolio/hebitren-bandung-masjid.jpg",
  },
  {
    title: "Temu Responden Bank Indonesia — Magelang",
    date: "2026",
    category: "Corporate Event",
    description: "Menyelenggarakan gala dinner malam puncak Temu Responden Bank Indonesia di Magelang dengan panggung taman bertema, live music, dan dokumentasi udara untuk seluruh rangkaian acara.",
    image: "/assets/portfolio/temres-magelang-gala-malam.jpg",
  }
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
            Melihat lebih dekat beberapa acara berskala besar dan eksklusif yang berhasil kami eksekusi dengan presisi dan dedikasi penuh.
          </motion.p>
        </div>

        <div className="space-y-16 lg:space-y-32">
          {masterpieces.map((item, index) => {
            const isEven = index % 2 === 1;
            return (
              <div key={index} className={`grid lg:grid-cols-2 gap-10 items-center ${isEven ? 'lg:rtl' : ''}`}>
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className={`relative ${isEven ? 'lg:ltr' : ''}`}
                >
                  <div className="absolute inset-0 bg-blue-600 translate-x-4 translate-y-4 rounded-[2.5rem] -z-10 opacity-10"></div>
                  <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-2xl bg-slate-200">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  
                  <div className="absolute -bottom-6 right-2 sm:-right-6 lg:-right-10 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{item.category}</p>
                      <p className="font-extrabold text-slate-900">{item.date}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className={`lg:px-12 ${isEven ? 'lg:ltr' : ''}`}
                >
                  <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">{item.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a href="#galeri" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
            Lihat Galeri Momen <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
