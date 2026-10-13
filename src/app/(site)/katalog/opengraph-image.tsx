import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Katalog harga sewa peralatan event D'Production di Malang";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-static";

// Latar memakai foto panggung dokumentasi D'Production sendiri (juga foto item Sound System di katalog). Foto produk
// lain di katalog berasal dari pihak lain.
export default function Image() {
  return renderOg({
    eyebrow: "Katalog harga",
    title: "Sewa peralatan event di Malang",
    photo: "assets/portfolio/pekan-qris-nasional-panggung.jpg",
  });
}
