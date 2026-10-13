import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

// display "browser": situs profil perusahaan tidak perlu ditawarkan untuk dipasang sebagai aplikasi.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Event organizer, wedding organizer, dan persewaan alat event di Malang.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#FFFFFF",
    theme_color: "#0B2144",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
