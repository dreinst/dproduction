"use client";

import { useEffect } from "react";

// Jangkar Beranda situs satu halaman lama yang isinya pindah ke /tentang. Bagian "#..." tidak pernah sampai ke server,
// jadi pengalihannya hanya bisa dilakukan di peramban. Jangkar yang masih ada di Beranda v2 (#layanan, #masterpiece,
// #klien, #kontak) tidak masuk daftar ini.
const PINDAH: Record<string, string> = {
  "#tentang-kami": "/tentang",
  "#galeri": "/tentang#galeri",
  "#faq": "/tentang#faq",
};

export default function PengalihJangkar() {
  useEffect(() => {
    // Hanya di Beranda: /tentang sendiri punya #galeri dan #faq.
    const tujuan = window.location.pathname === "/" ? PINDAH[window.location.hash] : undefined;
    if (tujuan) window.location.replace(tujuan);
  }, []);
  return null;
}
