"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Semua", "Tenda", "Sound System", "Lighting", "Stage & Rigging", "Kursi & Meja"];

const items = [
  { id: 1, name: "Tenda Premium VIP", category: "Tenda", price: 500000, desc: "Tenda roder VIP dengan dekorasi eksklusif", img: "bg-blue-100" },
  { id: 2, name: "Tenda Sarnafil 5x5", category: "Tenda", price: 350000, desc: "Tenda sarnafil standar putih bersih", img: "bg-blue-200" },
  { id: 3, name: "Line Array 10000W", category: "Sound System", price: 2500000, desc: "Sistem audio profesional untuk outdoor", img: "bg-purple-100" },
  { id: 4, name: "Speaker Portable 15inch", category: "Sound System", price: 200000, desc: "Cocok untuk meeting atau acara kecil", img: "bg-purple-200" },
  { id: 5, name: "Moving Head Beam 230", category: "Lighting", price: 250000, desc: "Lampu panggung dinamis", img: "bg-yellow-100" },
  { id: 6, name: "Par LED 54x3W", category: "Lighting", price: 100000, desc: "Pencahayaan dasar untuk stage", img: "bg-yellow-200" },
  { id: 7, name: "Stage 8x6 Meter", category: "Stage & Rigging", price: 1500000, desc: "Panggung rigging kokoh", img: "bg-slate-200" },
  { id: 8, name: "Kursi Futura Cover", category: "Kursi & Meja", price: 15000, desc: "Kursi VIP dengan cover putih/hitam", img: "bg-green-100" },
  { id: 9, name: "Meja Bulat VIP", category: "Kursi & Meja", price: 75000, desc: "Meja bulat diameter 120cm + cover", img: "bg-green-200" },
];

export default function KatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState<Record<number, number>>({});

  const filteredItems = activeCategory === "Semua" ? items : items.filter(i => i.category === activeCategory);

  const updateCart = (id: number, amount: number) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + amount;
      const newCart = { ...prev };
      if (newQty <= 0) delete newCart[id];
      else newCart[id] = newQty;
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = items.find(i => i.id === Number(id));
    return total + (item?.price || 0) * qty;
  }, 0);

  const handleCheckout = () => {
    let message = "Halo D'Production, saya ingin menyewa peralatan berikut:\n\n";
    Object.entries(cart).forEach(([id, qty]) => {
      const item = items.find(i => i.id === Number(id));
      if (item) {
        message += `- ${qty}x ${item.name} (Rp ${item.price.toLocaleString("id-ID")})\n`;
      }
    });
    message += `\n*Total Estimasi: Rp ${totalPrice.toLocaleString("id-ID")}*\n\nMohon informasi ketersediaan. Terima kasih.`;
    window.open(`https://wa.me/6281938938800?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm pt-4 pb-4 px-4 lg:px-8">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/#layanan" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Katalog Rental</h1>
        </div>
        
        {/* Categories (Scrollable horizontal) */}
        <div className="container mx-auto mt-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                  activeCategory === cat 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col"
                >
                  <div className={`w-full aspect-[4/3] ${item.img} flex items-center justify-center p-6 relative`}>
                     {/* Dummy Image Indicator */}
                     <span className="text-black/30 font-bold uppercase tracking-widest text-xl">{item.category}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.desc}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-extrabold text-blue-600">Rp {item.price.toLocaleString("id-ID")}</span>
                      
                      {qty === 0 ? (
                        <button 
                          onClick={() => updateCart(item.id, 1)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-full hover:bg-blue-100 transition-colors"
                        >
                          Tambah
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-full border border-slate-200">
                          <button onClick={() => updateCart(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 hover:text-red-500 rounded-full shadow-sm"><Minus className="w-4 h-4" /></button>
                          <span className="font-bold w-4 text-center text-slate-900">{qty}</span>
                          <button onClick={() => updateCart(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-full shadow-sm"><Plus className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Cart */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 w-full max-w-lg flex items-center justify-between p-2 pl-6">
              <div className="flex flex-col">
                <span className="font-bold text-sm">{totalItems} Item Disewa</span>
                <span className="font-extrabold">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" /> Checkout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
