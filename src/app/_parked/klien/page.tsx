"use client";

import Link from "next/link";
import { ArrowLeft, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Bank Indonesia", role: "Corporate Event", rating: 5, review: "Tim D'Production sangat profesional dan cekatan. Acara gathering tahunan kami berjalan luar biasa sukses dan meriah." },
  { name: "Telkomsel", role: "Product Launching", rating: 5, review: "Kreativitas tim tidak diragukan lagi. Konsep acara sangat fresh dan eksekusinya sangat rapi di lapangan." },
  { name: "Pertamina", role: "Gala Dinner", rating: 5, review: "Detail-oriented dan sangat komunikatif. Seluruh rangkaian acara terkonsep dengan matang dan elegan." },
  { name: "Astra Group", role: "Family Gathering", rating: 5, review: "Pilihan vendor yang tepat untuk acara berskala besar. Sangat memudahkan kami sebagai panitia internal." },
  { name: "Gojek", role: "Awarding Night", rating: 4, review: "Tata panggung dan lighting sangat memukau. D'Production benar-benar tahu cara menghidupkan suasana." },
  { name: "Bank Mandiri", role: "Seminar Nasional", rating: 5, review: "Peralatan rental berkualitas dan tim teknis yang sangat responsif. Acara berjalan mulus tanpa kendala teknis." },
  { name: "BCA", role: "Customer Gathering", rating: 5, review: "Sangat responsif terhadap perubahan mendadak. Manajemen event yang solid dan terpercaya." },
  { name: "Unilever", role: "Internal Conference", rating: 5, review: "Luar biasa! D'Production menangani semuanya dengan sangat rapi dari registrasi hingga penutupan." },
  { name: "Traveloka", role: "Media Briefing", rating: 4, review: "Cepat tanggap dan eksekusinya memuaskan. Sangat merekomendasikan untuk event korporat." },
  { name: "Shopee", role: "Mega Konser", rating: 5, review: "Skala sebesar apapun, mereka siap! Kualitas panggung dan sound system juara." },
  { name: "Garuda Indonesia", role: "Gala Dinner", rating: 5, review: "Sentuhan dekorasi yang sangat premium dan sesuai dengan citra perusahaan kami." },
  { name: "Otoritas Jasa Keuangan", role: "Sosialisasi Nasional", rating: 5, review: "Event berjalan kondusif, rapi, dan sesuai dengan standar instansi pemerintahan." }
];

export default function KlienPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <Link href="/#beranda" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Klien <span className="gradient-text">Perusahaan</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Kepercayaan adalah fondasi utama kami. Lebih dari 17 perusahaan dan instansi ternama telah mempercayakan momen penting mereka kepada D'Production.
          </p>
        </motion.div>
      </div>

      {/* Testimonials Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 relative group hover:-translate-y-2 transition-transform duration-300 flex flex-col"
            >
              <div className="absolute top-8 right-8 text-blue-50 group-hover:text-blue-100 transition-colors duration-300">
                <Quote className="w-12 h-12 rotate-180" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
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
    </main>
  );
}
