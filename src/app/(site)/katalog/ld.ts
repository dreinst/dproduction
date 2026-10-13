import type { KatalogItem, LandingKatalog } from "@/lib/landing-content";
import { SITE_NAME, absoluteUrl, breadcrumbLd, orgRef } from "@/lib/seo";

const SEWA = "http://purl.org/goodrelations/v1#LeaseOut";

// Jangkar kartu sebuah item. nomor adalah urutan tampilnya di seluruh katalog, mulai dari 1. Dipakai page.tsx untuk id
// kartu dan JSON-LD untuk url item, supaya keduanya selalu menunjuk kartu yang sama.
export const idItem = (nomor: number) => `item-${nomor}`;

// Item berharga menjadi Product dengan offers. Item tanpa harga tampil (prices kosong, termasuk "Harga lewat WhatsApp")
// hanya menjadi ListItem bernama: tidak ada angka yang ikut, dan tidak ada Product tanpa offers.
// Product tidak diberi image: sebagian foto katalog adalah foto pernikahan dan foto pihak lain (keputusan.md 9.7).
function butir(item: KatalogItem, category: string, position: number) {
  const url = absoluteUrl(`/katalog#${idItem(position)}`);
  const [utama] = item.prices;
  if (!utama) return { "@type": "ListItem", position, name: item.name, url };

  const amounts = item.prices.map((price) => price.amount);
  const umum = { priceCurrency: "IDR", businessFunction: SEWA, seller: orgRef, url };
  // unit tampil dengan kata "per" ("per mesin"), sedangkan unitText hanya satuannya.
  const satuan = utama.unit?.replace(/^per\s+/i, "");
  const offers =
    item.priceFrom || amounts.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...amounts),
          ...(item.priceFrom ? {} : { highPrice: Math.max(...amounts) }),
          offerCount: amounts.length,
          ...umum,
        }
      : {
          "@type": "Offer",
          price: utama.amount,
          ...umum,
          ...(satuan
            ? { priceSpecification: { "@type": "UnitPriceSpecification", price: utama.amount, priceCurrency: "IDR", unitText: satuan } }
            : {}),
        };
  return { "@type": "ListItem", position, item: { "@type": "Product", "@id": url, name: item.name, category, offers } };
}

export function katalogLd(categories: LandingKatalog["categories"]) {
  const semua = categories.flatMap((category) => category.items.map((item) => ({ item, category: category.name })));
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbLd("Katalog Harga", "/katalog"),
      // Katalog yang semua itemnya disembunyikan admin tidak ditulis sebagai daftar kosong.
      ...(semua.length
        ? [
            {
              "@type": "ItemList",
              "@id": absoluteUrl("/katalog#katalog"),
              name: `Katalog harga sewa alat event ${SITE_NAME}`,
              url: absoluteUrl("/katalog"),
              numberOfItems: semua.length,
              itemListElement: semua.map(({ item, category }, index) => butir(item, category, index + 1)),
            },
          ]
        : []),
    ],
  };
}
