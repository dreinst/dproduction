"use client";

import { useEffect, useState } from "react";
import { tombol } from "@/components/site/tombol";

type Koneksi = { saveData?: boolean; effectiveType?: string };

// Network Information API hanya ada di peramban berbasis Chromium. Di peramban lain nilainya undefined dan peta dimuat
// seperti biasa.
function hematData() {
  const koneksi = (navigator as Navigator & { connection?: Koneksi }).connection;
  return Boolean(koneksi?.saveData) || /(^|-)2g$/.test(koneksi?.effectiveType ?? "");
}

// Peta Google Maps di kartu Lokasi, mengisi wadah relative. iframe lintas asal tidak memberi tahu halaman kalau isinya
// gagal dimuat, dan saat offline peramban menggambar halaman galatnya sendiri di dalam bingkai. Karena itu iframe baru
// dipasang kalau perangkat online dan tidak sedang berhemat data. Selain itu yang tampil latar kartu dan tombol untuk
// memuatnya. Alamat dan tautan ke Google Maps ada di panel di luar komponen ini, jadi lokasi tetap bisa ditemukan
// tanpa peta.
export default function PetaLokasi({ src, title }: { src: string; title: string }) {
  // null: skrip belum jalan, belum ada yang ditampilkan.
  const [muat, setMuat] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => setMuat(navigator.onLine && !hematData()));
  }, []);

  if (muat) {
    return <iframe title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0" />;
  }
  if (muat === null) return null;
  return (
    <div className="absolute inset-0 flex items-end justify-center p-6">
      <button type="button" onClick={() => setMuat(true)} className={tombol("navy", "kecil")}>
        Tampilkan peta
      </button>
    </div>
  );
}
