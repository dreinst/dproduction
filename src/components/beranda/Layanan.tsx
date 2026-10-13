import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import KartuPutih from "@/components/site/KartuPutih";
import KepalaSection from "@/components/site/KepalaSection";
import type { LandingWedding } from "@/lib/landing-content";

// Tiga kartu layanan. fotoPernikahan berasal dari Master Wedding.
export default function Layanan({ fotoPernikahan }: { fotoPernikahan: LandingWedding["photo"] }) {
  const layanan = [
    {
      nama: "Event Organizer",
      keterangan: "Gathering perusahaan, peluncuran produk, seminar dan workshop, gala dinner.",
      href: "/layanan#event-organizer",
      foto: { src: "/assets/portfolio/temres-magelang-gala-kostum.jpg", alt: "Gala dinner bertema Temu Responden Bank Indonesia di Magelang" },
    },
    {
      nama: "Wedding Organizer",
      keterangan: "Konsep dan tema, dekorasi premium, pengelolaan vendor, koordinasi hari H.",
      href: "/layanan#wedding-organizer",
      foto: fotoPernikahan,
    },
    {
      nama: "Persewaan Alat",
      keterangan: "Sound system, lighting, tenda, efek panggung, dan fireworks.",
      href: "/katalog",
      foto: { src: "/assets/portfolio/pekan-qris-nasional-panggung.jpg", alt: "Penampilan di panggung utama Pekan QRIS Nasional" },
    },
  ];

  return (
    <section id="layanan" aria-labelledby="judul-layanan" className="px-tepi py-section" style={{ background: "linear-gradient(180deg, #f5f5f7, #e9f0fb)" }}>
      <div className="mx-auto max-w-konten">
        <KepalaSection
          id="judul-layanan"
          label="Layanan"
          judul="Tiga layanan, satu tim."
          keterangan="Pakai layanan penuh atau hanya bagian yang Anda butuhkan."
        />
        <ul className="mt-kepala grid gap-kisi md:grid-cols-3">
          {layanan.map((l) => (
            <li key={l.nama}>
              <KartuPutih besar className="relative">
                <div className="flex flex-col items-start gap-2.5 p-6 lg:p-8">
                  <h3 className="text-kartu-xl">{l.nama}</h3>
                  <p className="text-isi text-mute">{l.keterangan}</p>
                  {/* Tiga tautan berteks sama dibedakan lewat aria-label. after: membuat seluruh kartu bisa diklik. */}
                  <Link
                    href={l.href}
                    aria-label={`Selengkapnya tentang ${l.nama}`}
                    className="text-tombol text-navy underline-offset-4 after:absolute after:inset-0 hover:underline"
                  >
                    Selengkapnya
                  </Link>
                </div>
                <div className="relative mt-auto aspect-[16/10] md:aspect-auto md:h-[220px] lg:h-[280px]">
                  <LandingImage src={l.foto.src} alt={l.foto.alt} sizes="(min-width: 1280px) 411px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
              </KartuPutih>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
