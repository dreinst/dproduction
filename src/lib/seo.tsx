import type { Metadata } from "next";
import type { LandingKantor } from "@/lib/landing-content";
import { SITE_URL } from "@/lib/site";

export const SITE_NAME = "D'Production";

// Satu-satunya tempat menulis jam buka untuk data terstruktur. Teks tampilnya "Senin sampai Sabtu, 09.00 sampai 17.00 WIB".
const OPEN_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const OPENS = "09:00";
const CLOSES = "17:00";
const ADDRESS_LOCALITY = "Wagir, Kab. Malang";
const ADDRESS_REGION = "Jawa Timur";

export const ORG_ID = `${SITE_URL}/#organisasi`;
export const WEBSITE_ID = `${SITE_URL}/#situs`;

export const absoluteUrl = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

// Satu tag JSON-LD per halaman, dirender page.tsx (komponen server) sebagai <script> biasa, bukan next/script.
// "<" di-escape supaya teks dari database tidak bisa menutup tag script.
// Sumber: node_modules/next/dist/docs/01-app/02-guides/json-ld.md
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

type PageSeo = { title: string; description: string; path: string; absoluteTitle?: boolean };

// Metadata halaman publik. openGraph dan twitter ditulis lengkap di tiap halaman karena metadata antar segmen digabung
// dangkal. Gambar OG sengaja tidak disebut di sini: tiap folder halaman punya opengraph-image.tsx sendiri, dan menulis
// images di sini akan mengalahkan berkas itu.
export function pageMetadata({ title, description, path, absoluteTitle }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "id_ID", siteName: SITE_NAME, url: path, title: fullTitle, description },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

type Kantor = Pick<
  LandingKantor,
  "companyName" | "address" | "whatsapp" | "whatsapp2" | "email" | "socials" | "googleMapsUrl" | "foundedYear"
>;

// Tautan Google Maps biasa (bukan embed) untuk hasMap dan tombol "Buka di Google Maps".
export function mapsLink(kantor: Pick<Kantor, "googleMapsUrl" | "address">) {
  let query = kantor.address;
  try {
    query = new URL(kantor.googleMapsUrl).searchParams.get("q") || query;
  } catch {}
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Rujukan ringkas ke simpul yang definisi lengkapnya hanya ada di Beranda. Tipe, nama, dan url ikut ditulis karena
// mesin pencari membaca tiap halaman sendiri-sendiri.
export const orgRef = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: SITE_URL };
export const siteRef = { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, url: SITE_URL };

export function breadcrumbLd(name: string, path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: absoluteUrl(path) },
    ],
  };
}

// Beranda: profil usaha lokal dan nama situs, satu-satunya tempat kedua simpul ini ditulis lengkap. Tipe EventPlanner
// tidak ada di schema.org, jadi dipakai LocalBusiness. geo dan postalCode belum ditulis sampai pemilik memberi angkanya.
// photos: dua atau tiga foto acara atau tim (path di situs), bukan logo.
export function homeLd(kantor: Kantor, description: string, photos: string[]) {
  const phones = [kantor.whatsapp, kantor.whatsapp2].filter((n): n is string => Boolean(n));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": ORG_ID,
        name: kantor.companyName,
        alternateName: "D'Production Event Organizer",
        description,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-dpro.png`,
        image: photos.map(absoluteUrl),
        telephone: `+${kantor.whatsapp}`,
        email: kantor.email,
        foundingDate: String(kantor.foundedYear),
        address: {
          "@type": "PostalAddress",
          // Alamat Setting Kantor ditulis utuh; bagian kecamatan, kabupaten, dan provinsi dipisah ke kolomnya sendiri.
          streetAddress: kantor.address.replace(`, ${ADDRESS_LOCALITY}, ${ADDRESS_REGION}`, ""),
          addressLocality: ADDRESS_LOCALITY,
          addressRegion: ADDRESS_REGION,
          addressCountry: "ID",
        },
        hasMap: mapsLink(kantor),
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: OPEN_DAYS, opens: OPENS, closes: CLOSES },
        ],
        contactPoint: phones.map((n) => ({
          "@type": "ContactPoint",
          telephone: `+${n}`,
          contactType: "customer service",
          availableLanguage: "id",
        })),
        areaServed: [
          { "@type": "City", name: "Malang" },
          { "@type": "AdministrativeArea", name: "Jawa Timur" },
        ],
        sameAs: Object.values(kantor.socials).filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: ["D'Production Event Organizer", "D'Pro", "dpro.events"],
        url: SITE_URL,
        inLanguage: "id-ID",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}
