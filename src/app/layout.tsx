import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import ConditionalLayout from "@/components/ConditionalLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

// Ganti ke domain sendiri lewat env NEXT_PUBLIC_SITE_URL begitu domain baru dibeli
// (lihat percakapan soal alternatif domain) -- tidak perlu ubah kode ini lagi.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dproduction-iota.vercel.app";
const SITE_NAME = "D'Production";
const SITE_TITLE = "D'Production - Event Organizer & Wedding Planner Malang";
const SITE_DESCRIPTION =
  "D'Production adalah Event Organizer terpercaya di Malang sejak 2016. Kami merancang, mengelola, dan menyukseskan acara korporat, pemerintahan, hingga pernikahan Anda dengan konsep kreatif dan layanan profesional.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
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
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
  image: `${SITE_URL}/opengraph-image`,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans min-h-screen flex flex-col bg-slate-50`}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
