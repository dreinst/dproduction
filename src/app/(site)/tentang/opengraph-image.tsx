import { KANTOR_CADANGAN } from "@/lib/landing-content";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Tentang D'Production: kru berpose bersama memakai rompi merah biru";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Tanpa baris ini sebagian rute gambar OG terdeteksi dinamis saat build dan dirender ulang tiap permintaan.
export const dynamic = "force-static";

// Gambarnya dibuat saat build tanpa database, jadi tahun berdiri diambil dari konten kode.
export default function Image() {
  return renderOg({
    eyebrow: "Tentang kami",
    title: `D'Production, Malang, sejak ${KANTOR_CADANGAN.foundedYear}`,
    photo: "assets/portfolio/tim-dpro-rompi.jpg",
  });
}
