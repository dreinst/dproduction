"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, Heart, Speaker, Box, CheckCircle2, ArrowRight } from "lucide-react";

const services = [
  {
    id: "event",
    title: "Event Organizer",
    icon: CalendarDays,
    color: "blue",
    description: "Punya acara penting tapi bingung mau mulai dari mana? Serahkan saja pada D'Production! Kami adalah tim event organizer profesional yang siap mengubah ide dan konsepmu menjadi acara yang berkesan, rapi, dan berjalan lancar dari awal sampai akhir.",
    features: ["Corporate Gathering", "Product Launching", "Seminar & Workshop", "Gala Dinner"],
  },
  {
    id: "wedding",
    title: "Wedding Planner",
    icon: Heart,
    color: "pink",
    description: "Hari pernikahan hanya datang sekali. Kami hadir untuk membantu mewujudkan pernikahan impianmu — mulai dari konsep, dekorasi, venue, hingga rundown acara — semua kami rancang dengan teliti agar kamu bisa menikmati hari bahagiamu tanpa rasa khawatir.",
    features: ["Konsep & Tema", "Dekorasi Premium", "Manajemen Vendor", "Koordinasi Hari-H"],
  }
];

const rentals = [
  { name: "Tenda Premium", price: "Mulai Rp 200.000/hari", icon: Box },
  { name: "Sound System Pro", price: "Mulai Rp 1.000.000/hari", icon: Speaker },
  { name: "Lighting Stage", price: "Mulai Rp 500.000/hari", icon: Box },
  { name: "Kursi & Meja", price: "Hubungi Kami", icon: Box },
];

export default function LayananSection() {
  return (
    <section id="layanan" className="py-20 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Layanan Kami
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Solusi Menyeluruh untuk <span className="gradient-text">Setiap Acara</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Kami menghadirkan acara yang tidak hanya berkesan, namun dirancang dengan presisi, kreativitas, dan standar kualitas tinggi.
          </motion.p>
        </div>

        {/* Main Services */}
        <div className="space-y-24 mb-32">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div key={service.id} className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? 'lg:rtl' : ''}`}>
                
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={isEven ? 'lg:ltr' : ''}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${service.color === 'blue' ? 'gradient-bg shadow-blue-500/30' : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/30'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-6">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                    {service.description}
                  </p>
                  <ul className="space-y-4 mb-10">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href="https://wa.me/6281938938800" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group">
                    Konsultasi Detail <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative ${isEven ? 'lg:ltr' : ''}`}
                >
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-slate-200">
                    <Image src={index === 0 ? "/assets/layanan img 1.jpg" : "/assets/hero img 6.jpg"} fill alt={service.title} className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/10"></div>
                  </div>
                  {/* Decoration block */}
                  <div className={`absolute -z-10 w-full h-full rounded-3xl -bottom-6 ${isEven ? '-left-6' : '-right-6'} ${service.color === 'blue' ? 'bg-blue-100' : 'bg-pink-100'}`}></div>
                </motion.div>

              </div>
            );
          })}
        </div>

        {/* Equipment Rental Section (Bento Grid) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-slate-900 rounded-[3rem] p-8 lg:p-16 text-white overflow-hidden relative"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">Rental Peralatan Event</h3>
              <p className="text-slate-400">Kami menyewakan berbagai macam perlengkapan berkualitas tinggi untuk mendukung kesuksesan acara Anda.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rentals.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 transition-colors rounded-2xl p-6 group cursor-pointer">
                    <div className="w-12 h-12 bg-slate-700 group-hover:bg-blue-600 transition-colors rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                    <p className="text-sm text-slate-400 font-medium">{item.price}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/katalog" className="inline-block px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors">
                Lihat Katalog Lengkap
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
