import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import KepalaSection from "@/components/site/KepalaSection";
import { tombol } from "@/components/site/tombol";
import type { Angka, LandingEvents } from "@/lib/landing-content";

type Props = { items: LandingEvents["masterpieces"]; total: Angka };

// Tiga event Masterpiece terbaru (Master Event bertanda Masterpiece dan berfoto). total = angka event dari
// getLandingAngka, sama dengan yang tampil di pita hero.
export default function Masterpiece({ items, total }: Props) {
  return (
    <section
      id="masterpiece"
      aria-labelledby="judul-masterpiece"
      className="px-tepi py-section text-white"
      style={{ background: "linear-gradient(180deg, #0b2144, #0a2c63)" }}
    >
      <div className="mx-auto max-w-konten">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <KepalaSection
            navy
            id="judul-masterpiece"
            label="Masterpiece"
            judul="Event terbesar yang pernah kami tangani."
            keterangan="Dari fun run ribuan pelari sampai program multi hari Bank Indonesia."
          />
          {total.value > 0 && (
            <Link href="/portofolio" className={tombol("garis")}>
              Lihat semua {total.text} event
            </Link>
          )}
        </div>
        {items.length > 0 && (
          <ul className="mt-kepala grid gap-x-kisi gap-y-10 md:grid-cols-3">
            {items.map((event) => (
              <li key={event.name}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-besar md:aspect-[410.67/460]">
                  <LandingImage
                    src={event.photo}
                    alt={`Dokumentasi ${event.name}`}
                    sizes="(min-width: 1280px) 411px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-[22px] flex flex-col gap-2">
                  <p className="text-sm/[1.2] font-medium text-white/72">{[event.year, event.client].filter(Boolean).join(" · ")}</p>
                  <h3 className="text-kartu-md">{event.name}</h3>
                  {/* Deskripsi di data lebih panjang dari ruang kartu, jadi dipotong dua baris. */}
                  {event.description && <p className="line-clamp-2 text-isi text-white/72">{event.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
