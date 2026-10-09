import type { Metadata } from "next";
import PenandaKonten from "@/components/PenandaKonten";
import HeroSection from "@/components/sections/HeroSection";
import TentangKamiSection from "@/components/sections/TentangKamiSection";
import LayananSection from "@/components/sections/LayananSection";
import MasterpieceSection from "@/components/sections/MasterpieceSection";
import KlienSection from "@/components/sections/KlienSection";
import GaleriSection from "@/components/sections/GaleriSection";
import FaqSection from "@/components/sections/FaqSection";
import KontakSection from "@/components/sections/KontakSection";
import {
  getLandingAngka,
  getLandingEvents,
  getLandingGaleri,
  getLandingHero,
  getLandingKantor,
  getLandingKatalog,
  getLandingWedding,
} from "@/lib/landing-content";

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
  const [kantor, angka, hero, events, katalog, wedding, galeri] = await Promise.all([
    getLandingKantor(),
    getLandingAngka(),
    getLandingHero(),
    getLandingEvents(),
    getLandingKatalog(),
    getLandingWedding(),
    getLandingGaleri(),
  ]);
  const { whatsapp } = kantor;

  return (
    <>
      <HeroSection
        whatsapp={whatsapp}
        description={kantor.description}
        angka={angka}
        rentalCategories={katalog.categories.length}
        hero={hero}
      />
      <TentangKamiSection aboutUs={kantor.aboutUs} angka={angka} />
      <LayananSection whatsapp={whatsapp} wedding={wedding} rentals={katalog.categories.flatMap((category) => category.items)} />
      <MasterpieceSection items={events.masterpieces} groups={events.byYear} total={angka.events.text} />
      <KlienSection />
      <GaleriSection photos={galeri.photos} videos={galeri.videos} />
      <FaqSection />
      <KontakSection
        address={kantor.address}
        whatsapp={whatsapp}
        whatsappDisplay={kantor.whatsappDisplay}
        email={kantor.email}
        googleMapsUrl={kantor.googleMapsUrl}
      />
      {/* Menandai halaman yang dirender tanpa data database, supaya tidak tersimpan di cache selama masa revalidate penuh. */}
      <PenandaKonten sumber={[kantor, angka, hero, events, katalog, wedding, galeri].map((data) => data.sumber)} />
    </>
  );
}
