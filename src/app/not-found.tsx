import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";
import Kerangka from "@/components/site/Kerangka";
import { KANTOR_CADANGAN } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: { absolute: "Halaman Tidak Ditemukan | D'Production" },
};

// Dipakai untuk semua alamat yang tidak punya rute, termasuk alamat admin tanpa sesi. Tidak membaca database:
// navigasi dan footer memakai data kantor dari konten kode, jadi halaman ini tetap tampil saat database mati.
export default function NotFound() {
  return (
    <Kerangka kantor={KANTOR_CADANGAN}>
      <NotFoundView />
    </Kerangka>
  );
}
