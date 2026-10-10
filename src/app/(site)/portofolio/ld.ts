import type { LandingEvents } from "@/lib/landing-content";
import { absoluteUrl, breadcrumbLd, orgRef, siteRef } from "@/lib/seo";

// JSON-LD /portofolio: jejak halaman dan daftar semua event yang tampil. Event portofolio sudah lewat dan hanya punya
// tahun, jadi ditulis sebagai butir daftar, tidak sebagai tipe Event (yang menuntut tanggal mulai dan lokasi).
// Deskripsi dan foto hanya ada pada event Masterpiece.
export function portofolioLd({ byYear, masterpieces }: LandingEvents) {
  const events = byYear.flatMap((group) => group.events.map((event) => ({ name: event.name, year: group.year })));
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbLd("Portofolio", "/portofolio"),
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/portofolio#halaman"),
        name: "Portofolio event D'Production",
        url: absoluteUrl("/portofolio"),
        inLanguage: "id-ID",
        isPartOf: siteRef,
        about: orgRef,
        mainEntity: {
          "@type": "ItemList",
          name: "Event yang pernah ditangani D'Production",
          numberOfItems: events.length,
          itemListElement: events.map((event, index) => {
            const utama = masterpieces.find((m) => m.name === event.name && m.year === event.year);
            return {
              "@type": "ListItem",
              position: index + 1,
              name: event.year ? `${event.name} (${event.year})` : event.name,
              ...(utama?.description ? { description: utama.description } : {}),
              // Foto bisa berupa path di situs ini atau URL https.
              ...(utama ? { image: utama.photo.startsWith("/") ? absoluteUrl(utama.photo) : utama.photo } : {}),
            };
          }),
        },
      },
    ],
  };
}
