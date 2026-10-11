import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Portofolio D'Production: pelari melewati gerbang start Malang Half Marathon";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Tanpa baris ini sebagian rute gambar OG terdeteksi dinamis saat build dan dirender ulang tiap permintaan.
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Portofolio",
    title: "Event yang pernah kami tangani",
    photo: "assets/portfolio/half-marathon-flag-off.jpg",
  });
}
