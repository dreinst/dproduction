"use client";

import { motion } from "framer-motion";

const clients = [
  "Bank Indonesia", "BCA", "Pertamina", "Telkom", 
  "Astra", "Unilever", "Gojek", "Tokopedia", 
  "Shopee", "Traveloka", "Garuda Indonesia", "Indofood",
  "OJK", "Kemenkeu", "Kemenkes", "Pemprov Jatim"
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
            Kebanggaan bagi kami dapat bekerjasama dengan berbagai perusahaan, instansi, dan individu luar biasa dalam menyukseskan acara mereka.
          </motion.p>
        </div>

        {/* Marquee Section */}
        <div className="relative w-full overflow-hidden bg-white py-10 mb-20 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <div className="flex w-[200%] animate-marquee">
            <div className="flex w-1/2 justify-around items-center">
              {clients.slice(0, 8).map((client, i) => (
                <div key={i} className="text-2xl font-black text-slate-300 uppercase tracking-widest px-8">
                  {client}
                </div>
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center">
              {clients.slice(0, 8).map((client, i) => (
                <div key={i + 8} className="text-2xl font-black text-slate-300 uppercase tracking-widest px-8">
                  {client}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex w-[200%] animate-marquee-reverse mt-10">
            <div className="flex w-1/2 justify-around items-center">
              {clients.slice(8, 16).map((client, i) => (
                <div key={i} className="text-2xl font-black text-slate-300 uppercase tracking-widest px-8">
                  {client}
                </div>
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center">
              {clients.slice(8, 16).map((client, i) => (
                <div key={i + 8} className="text-2xl font-black text-slate-300 uppercase tracking-widest px-8">
                  {client}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clients.map((client, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.1 }}
              key={i} 
              className="glass-card aspect-[4/3] flex items-center justify-center p-6 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 group-hover:bg-blue-50 rounded-full mb-4 transition-colors"></div>
                <p className="font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{client}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
