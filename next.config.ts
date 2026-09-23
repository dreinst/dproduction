import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// URL situs PHP lama yang masih terindeks Google dan tersebar di materi promosi.
const legacyRedirects: [string, string][] = [
  ["/tentang_kami", "/#tentang-kami"],
  ["/team", "/#tentang-kami"],
  ["/masterpiece", "/#masterpiece"],
  ["/rental", "/#layanan"],
  ["/rental/detail", "/#layanan"],
  ["/event", "/#layanan"],
  ["/wedding", "/#layanan"],
  ["/galeri_foto", "/#galeri"],
  ["/galeri_video", "/#galeri"],
  ["/kontak", "/#kontak"],
  ["/login", "/management/login"],
  // Sebagian klien lama meminta path ini langsung tanpa membaca tag link di head.
  ["/apple-touch-icon.png", "/apple-icon.png"],
  ["/apple-touch-icon-precomposed.png", "/apple-icon.png"],
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
