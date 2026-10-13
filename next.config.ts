import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Nilai host dibaca Next sebagai regex yang dijangkar penuh, jadi titiknya di-escape.
const officialHost = [{ type: "host" as const, value: "www\\.dpro\\.events" }];

// URL situs PHP lama yang masih terindeks Google dan tersebar di materi promosi. Bagian setelah "#" ikut terkirim di
// header Location dan dipakai browser. Query permintaan ikut terbawa.
const legacyRedirects: [string, string][] = [
  ["/tentang_kami", "/tentang"],
  ["/team", "/tentang#tim"],
  ["/masterpiece", "/portofolio"],
  // Termasuk /rental sendiri dan turunannya seperti /rental/detail/12.
  ["/rental/:path*", "/katalog"],
  ["/event", "/layanan#event-organizer"],
  ["/wedding", "/layanan#wedding-organizer"],
  ["/galeri_foto", "/tentang#galeri"],
  ["/galeri_video", "/tentang#galeri"],
  ["/kontak", "/#kontak"],
  // Folder gambar situs lama tidak dibawa ke situs baru.
  ["/gbr/:path*", "/"],
  ["/images/:path*", "/"],
  // Sebagian klien lama meminta path ini langsung tanpa membaca tag link di head.
  ["/apple-touch-icon.png", "/apple-icon.png"],
  ["/apple-touch-icon-precomposed.png", "/apple-icon.png"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Domain review sslip.io, apex, vercel.app, dan localhost tidak boleh diindeks.
      { source: "/:path*", missing: officialHost, headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      // max-age pendek dulu, dinaikkan lewat ops setelah domain resmi stabil.
      { source: "/:path*", has: officialHost, headers: [{ key: "Strict-Transport-Security", value: "max-age=86400" }] },
      // Respons API memuat data pribadi (lead, user), jangan disimpan cache browser atau proxy.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
