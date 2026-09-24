import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import TentangKamiSection from "@/components/sections/TentangKamiSection";
import LayananSection from "@/components/sections/LayananSection";
import MasterpieceSection from "@/components/sections/MasterpieceSection";
import KlienSection from "@/components/sections/KlienSection";
import GaleriSection from "@/components/sections/GaleriSection";
import FaqSection from "@/components/sections/FaqSection";
import KontakSection from "@/components/sections/KontakSection";
import { getLandingContent, getLandingKantor } from "@/lib/landing-content";

// Konten dari database di-render ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

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

export default async function Home() {
  const [content, kantor] = await Promise.all([getLandingContent(), getLandingKantor()]);
  const { whatsapp } = kantor;

  return (
    <>
      <HeroSection whatsapp={whatsapp} description={kantor.description} stats={kantor.stats} hero={content.hero} />
      <TentangKamiSection aboutUs={kantor.aboutUs} stats={kantor.stats} />
      <LayananSection whatsapp={whatsapp} wedding={content.wedding} rentals={content.rentals} />
      <MasterpieceSection items={content.masterpieces} />
      <KlienSection />
      <GaleriSection photos={content.photos} videos={content.videos} />
      <FaqSection />
      <KontakSection
        address={kantor.address}
        whatsapp={whatsapp}
        whatsappDisplay={kantor.whatsappDisplay}
        email={kantor.email}
        googleMapsUrl={kantor.googleMapsUrl}
      />
    </>
  );
}
