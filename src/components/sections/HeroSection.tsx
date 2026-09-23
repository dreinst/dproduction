"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Users, CalendarDays, Box, ArrowRight } from "lucide-react";
import { whatsappUrl, trackWhatsAppClick } from "@/lib/site";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="beranda" className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute inset-0 bg-slate-900 overflow-hidden -z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-900/10 z-10 pointer-events-none"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Content */}
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 motion-safe:animate-pulse"></span>
                Event Organizer &amp; Wedding Organizer di Malang
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-lg">
                Event Organizer &amp; <span className="text-blue-400">Wedding Organizer Malang</span> untuk Momen Bahagia Anda
              </h1>

              <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-xl drop-shadow-md">
                D&apos;Production adalah event organizer dan wedding organizer di Malang sejak 2016. Dari konsep hingga eksekusi, kami merancang acara korporat, pemerintahan, hingga pernikahan Anda dari awal sampai selesai.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackWhatsAppClick}
                  className="px-8 py-4 gradient-bg text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  Konsultasi Sekarang <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  17+
                </div>
                <div className="text-sm text-slate-300 font-medium drop-shadow-md">
                  Dipercaya oleh <span className="text-white font-bold">17+ klien</span> dan perusahaan.
                </div>
              </div>
            </div>

            {/* Hero Image / Cards */}
            <div className="relative lg:ml-auto w-full max-w-lg">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10"></div>
                <Image
                  src="/assets/portfolio/temres-magelang-gala-malam.jpg"
                  fill
                  sizes="(min-width: 640px) 512px, 100vw"
                  loading="eager"
                  fetchPriority="high"
                  alt="Gala malam Temu Responden Bank Indonesia di Magelang"
                  className="object-cover"
                />
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <p className="font-heading text-xl font-bold text-white mb-2 drop-shadow-md">Corporate Event</p>
                    <p className="text-sm text-slate-200 drop-shadow-md">Gathering sukses bersama 500+ peserta dari Bank Indonesia.</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
            </div>

          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <a href="#klien" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-blue-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-heading text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">17+</p>
              <p className="text-slate-500 font-medium">Klien</p>
            </a>
            <a href="#masterpiece" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-green-50 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-4 text-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <CalendarDays className="w-8 h-8" />
              </div>
              <p className="font-heading text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">47+</p>
              <p className="text-slate-500 font-medium">Event</p>
            </a>
            <a href="#layanan" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Box className="w-8 h-8" />
              </div>
              <p className="font-heading text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">5+</p>
              <p className="text-slate-500 font-medium">Kategori Rental</p>
            </a>
            <a href="#tentang-kami" className="group block text-center p-6 -m-6 rounded-3xl hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
              <div className="w-16 h-16 mx-auto bg-orange-50 group-hover:bg-orange-600 rounded-2xl flex items-center justify-center mb-4 text-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-heading text-4xl font-extrabold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">179+</p>
              <p className="text-slate-500 font-medium">Member</p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
