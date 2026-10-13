import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Ketentuan layanan D'Production";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

// Latar memakai foto panggung dokumentasi D'Production sendiri, sama dengan gambar OG halaman Katalog.
export default function Image() {
  return renderOg({ eyebrow: "D'Production", title: "Ketentuan layanan", photo: "assets/portfolio/pekan-qris-nasional-panggung.jpg" });
}
