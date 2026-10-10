import { absoluteUrl, breadcrumbLd, orgRef } from "@/lib/seo";

// id menjadi jangkar di halaman (/layanan#event-organizer), jenis mengisi serviceType.
export type Layanan = { id: string; nama: string; jenis: string; deskripsi: string };

// JSON-LD /layanan: jejak halaman dan daftar tiga layanan. katalog adalah id layanan yang daftar harganya ada di
// /katalog, supaya layanan itu menunjuk ke sana.
export function layananLd(daftar: Layanan[], katalog: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbLd("Layanan", "/layanan"),
      {
        "@type": "OfferCatalog",
        "@id": absoluteUrl("/layanan#daftar"),
        name: "Layanan D'Production",
        url: absoluteUrl("/layanan"),
        numberOfItems: daftar.length,
        itemListElement: daftar.map((layanan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            "@id": absoluteUrl(`/layanan#${layanan.id}`),
            name: layanan.nama,
            serviceType: layanan.jenis,
            description: layanan.deskripsi,
            url: absoluteUrl(`/layanan#${layanan.id}`),
            provider: orgRef,
            areaServed: { "@type": "City", name: "Malang" },
            ...(layanan.id === katalog
              ? {
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    "@id": absoluteUrl("/katalog#katalog"),
                    name: "Katalog harga sewa alat event",
                    url: absoluteUrl("/katalog"),
                  },
                }
              : {}),
          },
        })),
      },
    ],
  };
}
