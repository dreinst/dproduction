"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Search, Filter, ChevronDown, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const baseEvents = [
  "Gala Dinner Bank Indonesia 2023", "Tech Innovation Summit 2024", "Rapat Koordinasi Nasional Kemendagri",
  "Peluncuran Produk Baru Astra", "Gathering Nasional Telkomsel", "Anniversary BCA 65 Tahun",
  "Mandiri Investment Forum", "Pertamina Energy Outlook", "Gojek Partner Gathering", "Traveloka Travel Fair",
  "Festival Kuliner Nusantara", "Pameran Otomotif GIIAS Surabaya", "Konser Musik Indie Lokal",
  "Seminar Nasional Pendidikan", "Workshop Digital Marketing", "Pelatihan Kepemimpinan OJK",
  "Pameran Franchise Nasional", "Bazaar Ramadhan Kota Malang", "Perayaan Tahun Baru 2024",
  "HUT Kota Malang ke-110", "Pekan Olahraga Mahasiswa Nasional", "Kompetisi Esport Regional",
  "Fashion Week Jawa Timur", "Pameran Seni Rupa Kontemporer", "Festival Budaya Nusantara",
  "Konferensi Medis Internasional", "Simposium Hukum Nasional", "Peluncuran Buku Inspiratif",
  "Temu Alumni Universitas Brawijaya", "Gathering Komunitas Mobil Klasik", "Pameran Properti Terbesar",
  "Expo Pendidikan Tinggi", "Festival Film Pendek", "Kompetisi Startup Inovatif", "Hackathon Mahasiswa",
  "Peringatan Hari Pahlawan Nasional", "Konser Amal Peduli Bencana", "Pameran Produk UMKM",
  "Festival Kopi Nusantara", "Kejuaraan Bulu Tangkis Regional", "Lomba Lari Marathon 10K",
  "Pentas Seni Sekolah Menengah", "Pameran Teknologi Pertanian", "Simposium Energi Terbarukan",
  "Workshop Fotografi Jurnalistik", "Pelatihan Public Speaking", "Gathering Influencer Nasional",
  "Acara Penghargaan Tokoh Inspiratif"
];

const clients = [
  "Bank Indonesia", "Astra Group", "Kementerian Dalam Negeri", "Telkomsel", 
  "Bank BCA", "Bank Mandiri", "Pertamina", "Gojek", "Traveloka", "OJK", "Universitas Brawijaya", "Pemerintah Kota Malang"
];

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const years = ["2022", "2023", "2024"];

// Generate 47 rich events
const events = baseEvents.slice(0, 47).map((title, index) => {
  const year = years[index % years.length];
  const month = months[(index * 3) % months.length];
  const client = clients[(index * 5) % clients.length];
  const imgBg = ["bg-blue-100", "bg-purple-100", "bg-green-100", "bg-orange-100", "bg-slate-200", "bg-red-100"][index % 6];
  
  return {
    id: index + 1,
    title,
    client,
    year,
    month,
    fullDate: `${(index % 28) + 1} ${month} ${year}`,
    location: "Indonesia",
    image: imgBg
  };
});

export default function DetailEventPage() {
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchYear = selectedYear === "" || event.year === selectedYear;
      const matchMonth = selectedMonth === "" || event.month === selectedMonth;
      const matchClient = selectedClient === "" || event.client === selectedClient;
      
      return matchSearch && matchYear && matchMonth && matchClient;
    });
  }, [searchQuery, selectedYear, selectedMonth, selectedClient]);

  const handleShowAll = () => {
    setVisibleCount(filteredEvents.length);
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <Link href="/#beranda" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
            47+ Masterpiece Event
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Detail <span className="gradient-text">Event</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Eksplorasi portofolio event kami. Temukan inspirasi dari berbagai acara berskala besar yang telah sukses kami selenggarakan bersama klien-klien terbaik.
          </p>
        </motion.div>
      </div>

      {/* Filters and Search Section */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
          
          {/* Search Bar */}
          <div className="relative w-full lg:flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari nama event atau klien..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          <div className="w-full lg:w-auto flex flex-wrap lg:flex-nowrap gap-4">
            {/* Year Dropdown */}
            <div className="relative flex-1 lg:flex-none min-w-[140px]">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Semua Tahun</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Month Dropdown */}
            <div className="relative flex-1 lg:flex-none min-w-[140px]">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Client Dropdown */}
            <div className="relative flex-1 lg:flex-none min-w-[180px]">
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 cursor-pointer"
              >
                <option value="">Semua Klien</option>
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Event tidak ditemukan</h3>
            <p className="text-slate-500">Silakan sesuaikan kriteria pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredEvents.slice(0, visibleCount).map((event, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={event.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Event Image */}
                  <div className={`w-full aspect-[4/3] ${event.image} relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300"></div>
                    <span className="text-slate-900/20 font-black uppercase tracking-widest text-3xl transform -rotate-12">FOTO EVENT</span>
                    
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg text-sm font-bold text-slate-800">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {event.fullDate}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs mb-4 w-max">
                      <Building2 className="w-3 h-3" /> {event.client}
                    </div>
                    
                    <h3 className="font-extrabold text-xl text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-400" /> {event.location}
                      </div>
                      <Link href="#" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Detail
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredEvents.length > visibleCount && (
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button 
              onClick={handleShowAll}
              className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-blue-600 transition-all duration-300 shadow-xl hover:-translate-y-1"
            >
              Lihat Semua {filteredEvents.length} Event
            </button>
          </motion.div>
        </div>
      )}
      
    </main>
  );
}
