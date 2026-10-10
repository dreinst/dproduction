import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Pelari di garis start QRIS Fun Run Bank Indonesia di Malang, salah satu acara yang ditangani D'Production";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Tanpa baris ini rute gambar OG bisa terdeteksi dinamis saat build dan dirender ulang tiap permintaan.
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Event Organizer dan Wedding Organizer Malang",
    title: "Acara Anda, kami yang urus.",
    photo: "assets/portfolio/qris-fun-run-start.jpg",
  });
}
