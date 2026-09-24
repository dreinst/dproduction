import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAdsTag from "@/components/GoogleAdsTag";
import { getLandingKantor } from "@/lib/landing-content";
import { SITE_URL } from "@/lib/site";

const SITE_DESCRIPTION =
  "Event organizer dan wedding planner Malang sejak 2016. D'Production melayani acara korporat, pemerintahan, pernikahan, serta sewa tenda dan sound system.";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  keywords: [
    "event organizer malang",
    "wedding organizer malang",
    "wedding planner malang",
    "jasa event organizer",
    "sewa tenda malang",
    "sewa sound system malang",
    "d'production",
    "dproduction malang",
  ],
  authors: [{ name: "D'Production" }],
  creator: "D'Production",
  publisher: "D'Production",
  // Isi NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION dari Search Console (Pengaturan > Verifikasi kepemilikan > tag HTML).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

const offerCatalog = {
  "@type": "OfferCatalog",
  name: "Layanan D'Production",
  itemListElement: [
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Event Organizer", areaServed: "Malang" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Wedding Organizer", areaServed: "Malang" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Sewa Peralatan Event (Tenda, Sound System, Lighting, Kursi & Meja)", areaServed: "Malang" },
    },
  ],
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kantor = await getLandingKantor();
  const { companyName, address, whatsapp, whatsappDisplay, email, socials, foundedYear } = kantor;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventPlanner",
    name: companyName,
    alternateName: "D'Production Event Organizer",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-dpro.svg`,
    image: `${SITE_URL}/logo-dpro.png`,
    telephone: `+${whatsapp}`,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    areaServed: "Malang, Jawa Timur",
    sameAs: Object.values(socials).filter(Boolean),
    hasOfferCatalog: offerCatalog,
  };

  return (
    <MotionConfig reducedMotion="user">
      <script
        type="application/ld+json"
        // Isi dari database, jadi "<" di-escape supaya teks tidak bisa menutup tag script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <GoogleAdsTag />
      <Navbar whatsapp={whatsapp} />
      <main className="flex-grow pt-24 pb-12 overflow-x-clip">
        {/* Anchor cadangan untuk tautan lama /#atas, di puncak halaman. */}
        <div id="atas" aria-hidden="true" className="absolute top-0" />
        {children}
      </main>
      <Footer kantor={{ companyName, address, whatsapp, whatsappDisplay, email, socials, foundedYear }} />
    </MotionConfig>
  );
}
