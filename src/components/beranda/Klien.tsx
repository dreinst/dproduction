import type { CSSProperties } from "react";
import LandingImage from "@/components/LandingImage";
import type { Angka, LandingKlien } from "@/lib/landing-content";
import gaya from "./Klien.module.css";
import { rasioGambar } from "./rasio-gambar";

// Ukuran kotak logo di layar lebar (lihat Klien.module.css), untuk menghitung lebar satu daftar.
const TINGGI = 56;
const LEBAR_MAKS = 168;
const JARAK = 80;
// Pita paling lebar 1920 px, jadi satu daftar harus paling sedikit selebar itu supaya putarannya tidak berlubang.
const LEBAR_PITA = 1920;
// Di bawah jumlah ini pita tidak berjalan.
const MIN_BERJALAN = 6;
const DETIK_PER_LOGO = 5;

type Props = { logos: LandingKlien["logos"]; total: Angka };

// Judul dengan jumlah klien (dari getLandingAngka, termasuk klien yang belum berlogo) dan pita logo klien aktif.
export default async function Klien({ logos, total }: Props) {
  const daftar = await Promise.all(logos.map(async (klien) => ({ ...klien, rasio: await rasioGambar(klien.logo) })));
  const jalan = daftar.length >= MIN_BERJALAN;
  const lebar = daftar.reduce((jumlah, k) => jumlah + Math.min(LEBAR_MAKS, TINGGI * (k.rasio ?? 3)) + JARAK, 0);
  // Daftar diulang sampai cukup lebar, lalu digandakan untuk putaran. Hanya daftar pertama yang dibaca pembaca layar.
  const ulang = jalan ? 2 * Math.ceil(LEBAR_PITA / lebar) : 1;
  const butir = Array.from({ length: ulang }, () => daftar).flat();

  return (
    <section id="klien" aria-labelledby="judul-klien" className="bg-langit py-14 md:py-[88px]">
      <h2 id="judul-klien" className="px-tepi text-center text-klien">
        Dipercaya {total.text} perusahaan dan instansi
      </h2>
      {daftar.length > 0 && (
        // Pita yang berjalan bisa difokus, supaya pengguna papan ketik juga bisa menghentikan gerakannya dan menggesernya
        // saat gerak dikurangi.
        <div
          {...(jalan && { role: "group", "aria-label": "Logo klien", tabIndex: 0 })}
          className={`${gaya.pita} ${jalan ? gaya.berjalan : ""} mt-8 md:mt-11`}
        >
          <ul className={gaya.jalur} style={{ "--durasi": `${(butir.length / 2) * DETIK_PER_LOGO}s` } as CSSProperties}>
            {butir.map((klien, index) => (
              <li
                key={index}
                aria-hidden={index >= daftar.length || undefined}
                className={gaya.logo}
                style={klien.rasio ? ({ "--rasio": klien.rasio } as CSSProperties) : undefined}
              >
                {/* multiply: latar putih berkas logo menyatu dengan latar section. */}
                <LandingImage
                  src={klien.logo}
                  alt={index < daftar.length ? `Logo ${klien.name}` : ""}
                  sizes="168px"
                  className="object-contain mix-blend-multiply"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
