"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";

const photos = [
  { src: "/assets/portfolio/hebitren-bandung-aerial-desa.jpg", label: "Hebitren BI Bandung", caption: "Dokumentasi Udara" },
  { src: "/assets/portfolio/ustegra-panggung.jpg", label: "Peresmian Ustegra", caption: "Panggung & Dekorasi" },
  { src: "/assets/portfolio/hebitren-jogja-bandara.jpg", label: "Hebitren BI Jogja", caption: "Penjemputan Peserta" },
  { src: "/assets/portfolio/temres-magelang-penjemputan.jpg", label: "Temres BI Magelang", caption: "Kedatangan Peserta" },
  { src: "/assets/portfolio/ustegra-tur-vip.jpg", label: "Peresmian Ustegra", caption: "Tur Tamu VIP" },
  { src: "/assets/portfolio/hebitren-jogja-kunjungan-tani.jpg", label: "Hebitren BI Jogja", caption: "Kunjungan Lapangan" },
  { src: "/assets/portfolio/temres-magelang-gedung-bi.jpg", label: "Temres BI Magelang", caption: "Dokumentasi Udara" },
  { src: "/assets/portfolio/ustegra-pabrik-aerial.jpg", label: "Peresmian Ustegra", caption: "Dokumentasi Udara" },
  { src: "/assets/portfolio/temres-magelang-santai.jpg", label: "Temres BI Magelang", caption: "Momen Santai Peserta" },
];

type Photo = (typeof photos)[number];

export default function GaleriSection() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedPhoto) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const trigger = triggerRef.current;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
      // Tombol tutup satu-satunya elemen fokus di dialog, jadi Tab ditahan di sana.
      if (e.key === "Tab") e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [selectedPhoto]);

  return (
    <section id="galeri" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            Galeri Momen
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Rekam Jejak <span className="gradient-text">Event Terbaik</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Koleksi visual dari berbagai acara yang telah sukses kami selenggarakan. Setiap foto bercerita tentang kebahagiaan dan kesuksesan.
          </motion.p>
        </div>

        {/* Masonry/Grid Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.1 }}
              className="relative group rounded-3xl overflow-hidden break-inside-avoid shadow-lg"
            >
              <div className="w-full aspect-[4/3] bg-slate-200 group-hover:scale-105 transition-transform duration-700 relative flex items-center justify-center">
                <Image src={photo.src} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" alt={`${photo.label}, ${photo.caption}`} className="object-cover" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 group-has-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <span className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <Maximize2 className="w-5 h-5" />
                </span>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full w-max mb-3">
                  {photo.label}
                </span>
                <h3 className="text-white font-bold text-xl">{photo.caption}</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setSelectedPhoto(photo);
                }}
                aria-label={`Perbesar foto ${photo.label}, ${photo.caption}`}
                className="absolute inset-0 rounded-3xl focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white"
              />
            </motion.div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${selectedPhoto.label}, ${selectedPhoto.caption}`}
            className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/90 backdrop-blur-sm"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Tutup foto"
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 text-white bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[85dvh] sm:rounded-xl overflow-hidden shadow-2xl"
            >
              <Image src={selectedPhoto.src} fill sizes="(min-width: 1024px) 1024px, 100vw" alt={`${selectedPhoto.label}, ${selectedPhoto.caption}`} className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
