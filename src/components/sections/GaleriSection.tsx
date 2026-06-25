"use client";

import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";

const photos = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
];

export default function GaleriSection() {
  return (
    <section id="galeri" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Galeri Momen
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Rekam Jejak <span className="gradient-text">Event Terbaik</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Koleksi visual dari berbagai acara yang telah sukses kami selenggarakan. Setiap foto bercerita tentang kebahagiaan dan kesuksesan.
          </motion.p>
        </div>

        {/* Masonry/Grid Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.1 }}
              className="relative group rounded-3xl overflow-hidden break-inside-avoid shadow-lg"
            >
              <div className="w-full aspect-[4/3] bg-slate-200 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <button className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full w-max mb-3">
                  Event
                </span>
                <h3 className="text-white font-bold text-xl">Momen Spesial {index + 1}</h3>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
