"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VendorInit() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const w = window as any;

      // 1. Initialize AOS (Animasi)
      if (w.AOS) {
        w.AOS.init({
          duration: 600,
          easing: "ease-in-out",
          once: true,
          mirror: false,
        });
        w.AOS.refresh();
      }

      // 2. Initialize Swiper (Slider Klien)
      if (w.Swiper) {
        document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
          // Hindari inisialisasi ulang jika sudah ada
          if ((swiperElement as any).swiper) {
            (swiperElement as any).swiper.destroy();
          }
          
          let configElement = swiperElement.querySelector(".swiper-config");
          if (!configElement) return;
          
          let config = JSON.parse(configElement.innerHTML.trim());
          new w.Swiper(swiperElement, config);
        });
      }

      // 3. Initialize GLightbox (Popup Video/Galeri)
      if (w.GLightbox) {
        w.GLightbox({
          selector: ".glightbox",
        });
      }

      // 4. Initialize PureCounter (Statistik Angka)
      if (w.PureCounter) {
        new w.PureCounter();
      }

    }, 300); // Jeda sedikit untuk memastikan DOM & Script Vendor termuat

    return () => clearTimeout(timer);
  }, [pathname]); // Akan dijalankan ulang setiap kali pindah halaman

  return null;
}
