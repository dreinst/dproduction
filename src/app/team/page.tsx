"use client";

import Link from "next/link";
import { ArrowLeft, Star, Target, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Generate 179 members
const generateMembers = () => {
  const members = [];
  const firstNames = ["Ahmad", "Ayu", "Bagus", "Citra", "Deni", "Eka", "Fajar", "Gita", "Hadi", "Intan", "Joko", "Kartika", "Lukman", "Mega", "Nugroho", "Putri", "Rizky", "Sari", "Teguh", "Wulan", "Budi", "Siti", "Andi", "Diana", "Kevin", "Maya", "Reza", "Lestari", "Galih", "Ratna", "Indra", "Nadia"];
  const lastNames = ["Saputra", "Wijaya", "Pratama", "Kusuma", "Hidayat", "Lestari", "Nugraha", "Permana", "Setiawan", "Wahyu", "Santoso", "Rahmawati", "Putri", "Kurniawan", "Indah", "Purnama", "Siregar", "Wibowo", "Sanjaya"];
  const slogans = ["Visi Besar, Hasil Nyata", "Kreativitas Tanpa Batas", "Presisi di Setiap Sudut", "Rencana Sempurna, Eksekusi Lancar", "Kolaborasi adalah Kunci", "Harmoni dalam Berkomunikasi", "Sutradara Panggung Terbaik", "Efisiensi dan Integritas", "Kerja Keras Tiap Hari", "Fokus pada Detail", "Kepuasan Klien No.1", "Solusi Cerdas", "Membangun Impian", "Eksekusi Maksimal", "Kreatif & Inovatif", "Pantang Menyerah", "Selalu Siap Sedia", "Sinergi Tim"];
  
  for (let i = 0; i < 179; i++) {
    const fn = firstNames[(i * 3 + 1) % firstNames.length];
    const ln = lastNames[(i * 7 + 2) % lastNames.length];
    const sl = slogans[(i * 5 + 3) % slogans.length];
    const bg = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-orange-50", "bg-slate-100", "bg-red-50", "bg-yellow-50", "bg-teal-50"][i % 8];
    members.push({ name: `${fn} ${ln}`, slogan: sl, image: bg });
  }
  return members;
};

const teamMembers = generateMembers();

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-32 overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-16 relative z-10">
        <Link href="/#beranda" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6">
            179+ Tim Profesional
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Tim <span className="gradient-text">Profesional</span> Kami
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Dibalik setiap event yang sukses, ada tim yang bekerja dengan dedikasi tinggi. 
            Mengenal lebih dekat 179+ ahli yang siap mewujudkan acara impian Anda.
          </p>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 lg:px-8 mb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Keunggulan</h3>
            <p className="text-slate-600 leading-relaxed">Tim kami terdiri dari para ahli di bidangnya masing-masing, siap memberikan kualitas terbaik untuk setiap detail acara Anda.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Fokus & Presisi</h3>
            <p className="text-slate-600 leading-relaxed">Kami bekerja dengan tingkat presisi yang tinggi untuk memastikan eksekusi acara berjalan lancar sesuai rencana (zero error).</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Dedikasi</h3>
            <p className="text-slate-600 leading-relaxed">Setiap event adalah mahakarya bagi kami. Kami melayani dengan hati untuk menciptakan momen bahagia yang tak terlupakan.</p>
          </motion.div>
        </div>
      </div>

      {/* Marquee Slider Section for 179+ Members */}
      <div className="mb-24 w-full relative z-0">
        {/* Left & Right Gradients for smooth fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        
        <div className="flex flex-col gap-6">
          {[0, 1, 2, 3, 4].map((rowIndex) => {
            const rowMembers = teamMembers.slice(rowIndex * 36, (rowIndex + 1) * 36);
            return (
              <motion.div 
                key={rowIndex}
                animate={{ x: rowIndex % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }} 
                transition={{ repeat: Infinity, duration: 60 + rowIndex * 10, ease: "linear" }}
                className="flex gap-6 w-max pl-6"
              >
                {/* Duplicate the array to make the infinite scroll seamless */}
                {[...rowMembers, ...rowMembers].map((member, index) => (
                  <div 
                    key={index}
                    className="w-[300px] shrink-0 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
                  >
                    <div className={`w-24 h-24 rounded-full ${member.image} mb-4 overflow-hidden flex items-center justify-center border-4 border-white shadow-md`}>
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Foto</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate w-full">{member.name}</h3>
                    <p className="text-blue-600 text-sm font-medium italic truncate w-full">"{member.slogan}"</p>
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>
      
    </main>
  );
}
