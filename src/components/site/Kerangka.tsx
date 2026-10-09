import type { ReactNode } from "react";
import Footer from "@/components/site/Footer";
import Navigasi from "@/components/site/Navigasi";
import type { LandingKantor } from "@/lib/landing-content";

type Props = { kantor: Pick<LandingKantor, "companyName" | "whatsapp" | "socials">; children: ReactNode };

// Kerangka semua halaman publik: tautan lompat, navigasi, isi, dan footer. Dipakai layout grup (site) dan halaman 404
// di akar app (yang berada di luar grup itu).
export default function Kerangka({ kantor, children }: Props) {
  return (
    // id "atas" melayani tautan lama /#atas.
    <div id="atas" className="situs flex min-h-screen flex-col">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-tombol-sm focus:text-white"
      >
        Langsung ke konten
      </a>
      <Navigasi whatsapp={kantor.whatsapp} />
      <main id="konten" tabIndex={-1} className="grow overflow-x-clip focus:outline-hidden">
        {children}
      </main>
      <Footer kantor={kantor} />
    </div>
  );
}
