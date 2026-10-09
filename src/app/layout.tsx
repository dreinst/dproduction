import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SITE_NAME } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Inter variabel: satu berkas woff2 subset latin mencakup semua ketebalan yang dipakai desain v2 dan halaman admin.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  // Isi NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION dari Search Console (Pengaturan > Verifikasi kepemilikan > tag HTML).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = { themeColor: "#0B2144" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="motion-safe:scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
