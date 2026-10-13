import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import FotoKosong from "@/components/site/FotoKosong";
import KepalaSection from "@/components/site/KepalaSection";
import { tombol } from "@/components/site/tombol";
import type { KatalogCuplikan, LandingKatalog } from "@/lib/landing-content";
import { hargaKatalog } from "@/lib/site";

type Props = { items: KatalogCuplikan[]; categories: LandingKatalog["categories"] };

// Empat kartu harga dari katalog. Tiap kartu membuka halaman katalog di kategorinya (slug kategori menjadi hash).
export default function CuplikanKatalog({ items, categories }: Props) {
  return (
    <section aria-labelledby="judul-katalog" className="bg-white px-tepi py-section">
      <div className="mx-auto max-w-konten">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <KepalaSection
            id="judul-katalog"
            label="Katalog harga"
            judul="Sewa peralatan, harga terbuka."
            keterangan="Efek panggung, fireworks, sound system, lighting, tenda, dan lainnya."
          />
          <Link href="/katalog" className={tombol("navy")}>
            Buka katalog
          </Link>
        </div>
        {items.length > 0 && (
          <ul className="mt-kepala grid gap-kisi xs:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => {
              // Hanya harga utama yang tampil di sini. Tanpa harga berarti harganya lewat WhatsApp saja.
              const harga = item.prices[0] && hargaKatalog(item.prices[0], item.priceFrom);
              const slug = categories.find((c) => c.name === item.category)?.slug;
              return (
                <li key={index} className="relative flex flex-col overflow-hidden rounded-kartu bg-latar">
                  <div className="relative aspect-[302/220]">
                    {item.photo ? (
                      <LandingImage
                        src={item.photo}
                        alt={item.name}
                        sizes="(min-width: 1280px) 302px, (min-width: 1024px) 25vw, (min-width: 480px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <FotoKosong />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-4 md:p-[22px]">
                    <p className="text-label text-mute">{item.category}</p>
                    <h3 className="text-kartu-sm">
                      {/* after: membuat seluruh kartu bisa diklik. */}
                      <Link href={slug ? `/katalog#${slug}` : "/katalog"} className="after:absolute after:inset-0">
                        {item.name}
                      </Link>
                    </h3>
                    {/* Keterangan yang tidak diawali "per" turun ke baris kedua. */}
                    <p className="text-isi-sm">
                      {harga ? harga.nominal : "Harga lewat WhatsApp"}
                      {harga?.keterangan && <span className={harga.sebaris ? "" : "block"}> {harga.keterangan}</span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
