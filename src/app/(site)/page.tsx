import type { Metadata } from "next";
import CuplikanKatalog from "@/components/beranda/CuplikanKatalog";
import Hero from "@/components/beranda/Hero";
import Klien from "@/components/beranda/Klien";
import Kontak from "@/components/beranda/Kontak";
import Layanan from "@/components/beranda/Layanan";
import Lokasi from "@/components/beranda/Lokasi";
import Masterpiece from "@/components/beranda/Masterpiece";
import PilihAcara from "@/components/beranda/PilihAcara";
import ProsesKerja from "@/components/beranda/ProsesKerja";
import PenandaKonten from "@/components/PenandaKonten";
import {
  getLandingAngka,
  getLandingEvents,
  getLandingHero,
  getLandingKantor,
  getLandingKatalog,
  getLandingKatalogCuplikan,
  getLandingKlien,
  getLandingWedding,
} from "@/lib/landing-content";
import { JsonLd, SITE_NAME, homeLd, pageMetadata } from "@/lib/seo";

// Konten dari database di-render ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

const deskripsi = (tahunBerdiri: number) =>
  `${SITE_NAME} mengurus acara perusahaan, pernikahan, dan sewa peralatan event di Malang sejak ${tahunBerdiri}. Konsultasi gratis lewat WhatsApp.`;

export async function generateMetadata(): Promise<Metadata> {
  const { foundedYear } = await getLandingAngka();
  return pageMetadata({
    title: `Event Organizer dan Wedding Organizer Malang | ${SITE_NAME}`,
    description: deskripsi(foundedYear),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function Beranda() {
  const [kantor, angka, hero, events, klien, katalog, cuplikan, wedding] = await Promise.all([
    getLandingKantor(),
    getLandingAngka(),
    getLandingHero(),
    getLandingEvents(),
    getLandingKlien(),
    getLandingKatalog(),
    getLandingKatalogCuplikan(),
    getLandingWedding(),
  ]);
  const masterpieces = events.masterpieces.slice(0, 3);

  return (
    <>
      <Hero hero={hero} angka={angka} whatsapp={kantor.whatsapp} />
      <PilihAcara fotoPernikahan={wedding.photo} />
      <Layanan fotoPernikahan={wedding.photo} />
      <Masterpiece items={masterpieces} total={angka.events} />
      <ProsesKerja />
      <CuplikanKatalog items={cuplikan.items} categories={katalog.categories} />
      {angka.clients.value > 0 && <Klien logos={klien.logos} total={angka.clients} />}
      <Kontak kantor={kantor} />
      <Lokasi kantor={kantor} />
      {/* Foto untuk data terstruktur: foto hero dan Masterpiece yang tampil, hanya yang berkasnya ada di situs ini. */}
      <JsonLd
        data={homeLd(
          kantor,
          deskripsi(angka.foundedYear),
          [hero.image, ...masterpieces.map((event) => event.photo)].filter((src) => src.startsWith("/")),
        )}
      />
      {/* Menandai halaman yang dirender tanpa data database, supaya tidak tersimpan di cache selama masa revalidate penuh. */}
      <PenandaKonten sumber={[kantor, angka, hero, events, klien, katalog, cuplikan, wedding].map((data) => data.sumber)} />
    </>
  );
}
