import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import TentangKamiSection from "@/components/sections/TentangKamiSection";
import LayananSection from "@/components/sections/LayananSection";
import MasterpieceSection from "@/components/sections/MasterpieceSection";
import KlienSection from "@/components/sections/KlienSection";
import GaleriSection from "@/components/sections/GaleriSection";
import FaqSection from "@/components/sections/FaqSection";
import KontakSection from "@/components/sections/KontakSection";

export const metadata: Metadata = {
  title: { absolute: "D'Production | Event Organizer & Wedding Planner Malang" },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "D'Production",
    // Gambar OG ada di src/app (URL tetap /opengraph-image); openGraph di sini menimpa bawaan root, jadi disebut lagi.
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "D'Production | Event Organizer Profesional di Malang" }],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <TentangKamiSection />
      <LayananSection />
      <MasterpieceSection />
      <KlienSection />
      <GaleriSection />
      <FaqSection />
      <KontakSection />
    </>
  );
}
