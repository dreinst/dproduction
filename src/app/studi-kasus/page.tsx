"use client";

import Link from "next/link";
import { ArrowLeft, Users, Calendar, CheckCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const caseStudies = [
  {
    id: 1,
    title: "Gala Dinner Bank Indonesia",
    client: "Bank Indonesia",
    date: "Desember 2023",
    location: "Grand Ballroom Hotel Tugu, Malang",
    scale: "500+ Peserta VIP (Nasional)",
    role: ["Konseptor Utama", "Manajemen Vendor", "Eksekusi Hari-H", "Show Management"],
    description: "Sebuah malam penghargaan megah yang dihadiri oleh jajaran direksi dan tamu VIP Bank Indonesia dari seluruh cabang. D'Production merancang alur acara dari awal, mulai dari tema klasik elegan, tata letak ruangan, pemilihan menu, hingga penampilan hiburan kelas atas yang memukau seluruh tamu undangan.",
    img: "bg-slate-200"
  },
  {
    id: 2,
    title: "Tech Innovation Summit 2024",
    client: "Astra Group",
    date: "Maret 2024",
    location: "Graha Cakrawala UM, Malang",
    scale: "5000+ Pengunjung (3 Hari)",
    role: ["Layout Pameran", "Sistem Registrasi", "Penyediaan Rigging & Stage", "Keamanan Acara"],
    description: "Pameran teknologi terbesar di Jawa Timur yang menghadirkan 50+ startup dan berbagai inovasi terbaru. Skala acara yang masif menuntut koordinasi crowd control yang ketat. Kami memastikan arus pengunjung lancar, stage utama selalu hidup dengan talkshow bergantian, dan keamanan seluruh booth tenant terjamin selama 3 hari berturut-turut.",
    img: "bg-slate-300"
  },
  {
    id: 3,
    title: "Rapat Koordinasi Nasional Kemendagri",
    client: "Kementerian Dalam Negeri",
    date: "Agustus 2023",
    location: "Hotel Savana, Malang",
    scale: "1000+ Pejabat Daerah",
    role: ["Protokoler", "Penyediaan Sound & LED Screen", "Akomodasi Peserta"],
    description: "Acara berskala pemerintahan dengan standar protokoler yang sangat ketat. D'Production ditunjuk untuk memastikan seluruh perangkat audio visual (Sound System, LED Screen raksasa) berjalan tanpa cacat (zero error), serta mengatur alur kedatangan dan akomodasi para pejabat daerah agar sesuai dengan standar kementerian.",
    img: "bg-slate-200"
  }
];

export default function StudiKasusPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <Link href="/#masterpiece" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Studi <span className="gradient-text">Kasus</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Melihat lebih dekat bagaimana D'Production merancang, mengelola, dan mengeksekusi acara-acara berskala besar dengan presisi dan dedikasi tinggi.
          </p>
        </motion.div>
      </div>

      {/* Case Studies List */}
      <div className="container mx-auto px-4 lg:px-8 space-y-20 lg:space-y-32">
        {caseStudies.map((item, index) => {
          const isEven = index % 2 === 1;
          return (
            <div key={item.id} className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? 'lg:rtl' : ''}`}>
              <motion.div 
                initial={{ opacity: 0, x: isEven ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`relative ${isEven ? 'lg:ltr' : ''}`}
              >
                <div className={`w-full aspect-[4/3] rounded-[2.5rem] ${item.img} shadow-2xl relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-slate-900/10"></div>
                  {/* Dummy Image Indicator */}
                  <span className="text-slate-500/50 font-bold uppercase tracking-widest text-2xl relative z-10">Foto Event</span>
                </div>
                
                {/* Floating Badge */}
                <div className={`absolute -bottom-6 ${isEven ? '-left-6' : '-right-6'} bg-blue-600 text-white p-6 rounded-2xl shadow-xl max-w-xs`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-blue-200" />
                    <span className="font-bold text-lg">{item.scale}</span>
                  </div>
                  <p className="text-blue-100 text-sm">Skala Acara / Peserta</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: isEven ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`${isEven ? 'lg:ltr' : ''}`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-medium text-sm mb-6">
                  {item.client}
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">{item.title}</h2>
                
                <div className="flex flex-wrap gap-6 mb-8 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" /> {item.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" /> {item.location}
                  </div>
                </div>

                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                  {item.description}
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-8">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Peran D'Production:</h3>
                  <ul className="space-y-3">
                    {item.role.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="w-6 h-6 text-blue-500 shrink-0" />
                        <span className="leading-relaxed font-medium">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
      
      {/* CTA */}
      <div className="container mx-auto px-4 lg:px-8 mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">Siap Membuat Event Anda Menjadi Masterpiece Berikutnya?</h2>
            <p className="text-xl text-slate-300 mb-10">Konsultasikan ide Anda bersama tim ahli kami.</p>
            <a href="https://wa.me/6281938938800" target="_blank" className="inline-block px-10 py-5 bg-white text-blue-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20">
              Hubungi Kami Sekarang
            </a>
          </div>
        </motion.div>
      </div>

    </main>
  );
}
