import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dproduction-iota.vercel.app";

// Situs ini masih satu halaman (section pakai anchor: #tentang-kami, #layanan, dst).
// Tambahkan baris baru di sini kalau nanti ada halaman terpisah (mis. /layanan, /masterpiece).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
