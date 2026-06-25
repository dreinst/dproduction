"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Trophy, ArrowRight } from "lucide-react";

const masterpieces = [
  {
    title: "Gala Dinner Bank Indonesia",
    date: "Desember 2023",
    category: "Corporate Event",
    description: "Menghadirkan malam penghargaan megah untuk 500+ tamu undangan VIP dengan tata panggung spektakuler dan hiburan kelas atas.",
  },
  {
    title: "Royal Wedding Anisa & Bima",
    date: "Agustus 2023",
    category: "Wedding",
    description: "Pernikahan impian bergaya klasik modern di gedung bersejarah dengan dekorasi bunga segar premium sepanjang lorong.",
  },
  {
    title: "Tech Innovation Summit",
    date: "Maret 2024",
    category: "Exhibition",
    description: "Pameran teknologi terbesar di Jawa Timur yang dihadiri oleh 50+ startup dan 5000+ pengunjung selama tiga hari berturut-turut.",
  }
];

export default function MasterpieceSection() {
  return (
    <section id="masterpiece" className="py-20 lg:py-32 bg-white">
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
                  <div className="rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-2xl bg-slate-200">
                  </div>
                  
                  <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
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
                  <Link href="/studi-kasus" className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-blue-600 transition-colors inline-flex items-center gap-2 group w-max">
                    Lihat Studi Kasus <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
