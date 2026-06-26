"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, CalendarDays, Box, PlayCircle, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="beranda" className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 lg:pt-32 lg:pb-32">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute inset-0 bg-slate-900 overflow-hidden -z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-900/10 z-10 pointer-events-none"></div>
            <iframe
              className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
              src="https://www.youtube.com/embed/aze3mZUis6M?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=aze3mZUis6M&playsinline=1"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                Partner Event yang Nyaman untuk Kamu
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-lg">
                Rancang <span className="text-blue-400">Momen Bahagia</span> Anda Bersama Kami
              </h1>
              
              <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-xl drop-shadow-md">
                Dari konsep hingga eksekusi, D'Production siap merancang acara impian Anda menjadi kenyataan. Profesional, kreatif, dan tak terlupakan.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="https://wa.me/6281938938800" 
                  target="_blank"
                  className="px-8 py-4 gradient-bg text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Konsultasi Sekarang <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-slate-300"></div>
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs z-10">
                    179+
                  </div>
                </div>
                <div className="text-sm text-slate-300 font-medium drop-shadow-md">
                  Dipercaya oleh lebih dari <span className="text-white font-bold">179+ Klien</span> & Perusahaan.
                </div>
              </div>
            </motion.div>

            {/* Hero Image / Cards */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-auto w-full max-w-lg"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>
                <div className="w-full h-full bg-slate-200"></div>
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">Corporate Event</h3>
                    <p className="text-sm text-slate-200 drop-shadow-md">Gathering sukses bersama 500+ peserta dari Bank Indonesia.</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 lg:-right-12 gradient-bg p-4 rounded-2xl flex items-center gap-4 z-30 shadow-lg shadow-blue-500/30"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-inner">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-white/80 font-medium">Pengalaman</p>
                  <p className="text-lg font-bold text-white">10+ Tahun</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Link href="/klien" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-blue-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">17+</h4>
              <p className="text-slate-500 font-medium">Klien</p>
            </Link>
            <Link href="/detail-event" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-green-50 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-4 text-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">47+</h4>
              <p className="text-slate-500 font-medium">Event</p>
            </Link>
            <Link href="/katalog" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Box className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">5+</h4>
              <p className="text-slate-500 font-medium">Kategori Rental</p>
            </Link>
            <Link href="/team" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-orange-50 group-hover:bg-orange-600 rounded-2xl flex items-center justify-center mb-4 text-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">179+</h4>
              <p className="text-slate-500 font-medium">Member</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
