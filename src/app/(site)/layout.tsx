import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAdsTag from "@/components/GoogleAdsTag";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dproduction-iota.vercel.app";
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
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EventPlanner",
  name: "D'Production",
  alternateName: "D'Production Event Organizer",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-dpro.svg`,
  image: `${SITE_URL}/logo-dpro.png`,
  telephone: "+6281938938800",
  email: "dproductionorganizer@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Raya Pandanlandung No. 16, Bandulan",
    addressLocality: "Wagir, Kab. Malang",
    addressRegion: "Jawa Timur",
    addressCountry: "ID",
  },
  areaServed: "Malang, Jawa Timur",
  sameAs: [
    "https://www.instagram.com/dpro.duction",
    "https://youtube.com/@dproductionzone",
  ],
  hasOfferCatalog: {
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
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MotionConfig reducedMotion="user">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GoogleAdsTag />
      <Navbar />
      <main className="flex-grow pt-24 pb-12 overflow-x-clip">{children}</main>
      <Footer />
    </MotionConfig>
  );
}
