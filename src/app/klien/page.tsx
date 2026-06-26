"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const clients = [
  "Bank Indonesia", "Astra Group", "Kementerian Dalam Negeri", "Telkomsel", 
  "Bank BCA", "Bank Mandiri", "Pertamina", "PLN", "Gojek", "Traveloka",
  "Kementerian Pariwisata", "Otoritas Jasa Keuangan", "Bursa Efek Indonesia",
  "Unilever Indonesia", "Indofood", "Toyota Astra Motor", "Honda Prospect Motor",
  "Samsung Indonesia", "Universitas Brawijaya", "Pemerintah Kota Malang"
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

      {/* Clients Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clients.map((client, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <Building2 className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="font-bold text-slate-800">{client}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
