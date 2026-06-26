"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Bank Indonesia",
    role: "Corporate Event",
    review: "Tim D'Production sangat profesional dan cekatan. Acara gathering tahunan kami berjalan luar biasa sukses dan meriah.",
    rating: 5
  },
  {
    name: "Telkomsel",
    role: "Product Launching",
    review: "Kreativitas tim tidak diragukan lagi. Konsep acara sangat fresh dan eksekusinya sangat rapi di lapangan.",
    rating: 5
  },
  {
    name: "Pertamina",
    role: "Gala Dinner",
    review: "Detail-oriented dan sangat komunikatif. Seluruh rangkaian acara terkonsep dengan matang dan elegan.",
    rating: 5
  },
  {
    name: "Astra Group",
    role: "Family Gathering",
    review: "Pilihan vendor yang tepat untuk acara berskala besar. Sangat memudahkan kami sebagai panitia internal.",
    rating: 5
  },
  {
    name: "Gojek",
    role: "Awarding Night",
    review: "Tata panggung dan lighting sangat memukau. D'Production benar-benar tahu cara menghidupkan suasana.",
    rating: 4
  },
  {
    name: "Bank Mandiri",
    role: "Seminar Nasional",
    review: "Peralatan rental berkualitas dan tim teknis yang sangat responsif. Acara berjalan mulus tanpa kendala teknis.",
    rating: 5
  }
];

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 relative group hover:-translate-y-2 transition-transform duration-300 flex flex-col"
            >
              <div className="absolute top-8 right-8 text-blue-50 group-hover:text-blue-100 transition-colors duration-300">
                <Quote className="w-12 h-12 rotate-180" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className={`w-5 h-5 ${index < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                ))}
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-8 relative z-10 italic flex-grow">
                "{testimonial.review}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.role}</p>
                </div>
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
