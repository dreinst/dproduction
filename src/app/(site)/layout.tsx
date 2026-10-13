import type { Metadata } from "next";
import GoogleAdsTag from "@/components/GoogleAdsTag";
import PenandaKoneksi from "@/components/ketahanan/PenandaKoneksi";
import PendaftarSW from "@/components/ketahanan/PendaftarSW";
import KacaBiru from "@/components/site/KacaBiru";
import Kerangka from "@/components/site/Kerangka";
import PengalihJangkar from "@/components/site/PengalihJangkar";
import { getLandingKantor } from "@/lib/landing-content";

// Judul, deskripsi, canonical, dan Open Graph ditulis tiap halaman lewat pageMetadata (src/lib/seo.tsx).
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kantor = await getLandingKantor();

  return (
    <>
      <GoogleAdsTag />
      <Kerangka kantor={kantor}>{children}</Kerangka>
      <KacaBiru />
      <PengalihJangkar />
      <PenandaKoneksi />
      <PendaftarSW />
    </>
  );
}
