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
