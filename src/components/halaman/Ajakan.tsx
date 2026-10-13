import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";

// nomor: WhatsApp 1 dari Setting Kantor (format 62xxx). teks: pesan awal WhatsApp, bawaannya salam umum di
// src/lib/site.ts. className: jarak atas, untuk halaman yang section sebelumnya tidak punya jarak bawah sendiri.
type Props = { judul: string; keterangan: string; nomor: string; teks?: string; className?: string };

// Kartu ajakan di akhir halaman Layanan, Portofolio, Katalog Harga, dan Tentang. Bentuknya mengikuti kartu ajakan
// halaman Katalog Harga di Figma.
export default function Ajakan({ judul, keterangan, nomor, teks, className = "" }: Props) {
  return (
    <section aria-labelledby="judul-ajakan" className={`px-tepi pb-12 lg:pb-18 ${className}`}>
      <div className="mx-auto flex max-w-konten flex-col items-start justify-between gap-6 rounded-pintu bg-latar p-7 md:flex-row md:items-center md:gap-10 lg:px-14 lg:py-12">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2 id="judul-ajakan" className="text-h3 leading-[1.15]">
            {judul}
          </h2>
          <p className="text-[17px]/[1.5] text-mute">{keterangan}</p>
        </div>
        {/* scroll-mt: saat fokus papan ketik menggulir ke tombol ini, ia tidak berhenti di belakang bilah navigasi. */}
        <TautanWhatsApp nomor={nomor} teks={teks} className={`${tombol("navy")} scroll-mt-(--nav-ruang) max-md:w-full`}>
          Chat lewat WhatsApp
        </TautanWhatsApp>
      </div>
    </section>
  );
}
