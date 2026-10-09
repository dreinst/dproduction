import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFoundView from "@/components/NotFoundView";
import { KANTOR_CADANGAN } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: { absolute: "Halaman Tidak Ditemukan | D'Production" },
};

// Dipakai untuk semua alamat yang tidak punya rute, termasuk alamat admin tanpa sesi. Tidak membaca database:
// navigasi dan footer memakai data kantor dari konten kode, jadi halaman ini tetap tampil saat database mati.
export default function NotFound() {
  return (
    <>
      <Navbar whatsapp={KANTOR_CADANGAN.whatsapp} />
      <main className="flex-grow bg-slate-50 pt-24">
        <NotFoundView />
      </main>
      <Footer kantor={KANTOR_CADANGAN} />
    </>
  );
}
