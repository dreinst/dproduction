import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Layanan D'Production: event organizer, wedding organizer, dan sewa alat event di Malang";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Tanpa baris ini sebagian rute gambar OG terdeteksi dinamis saat build dan dirender ulang tiap permintaan.
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Layanan D'Production",
    title: "Event, wedding, dan sewa alat di Malang",
    photo: "assets/portfolio/ustegra-perayaan-karyawan.jpg",
  });
}
