import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";
import type { LandingAngka, LandingHero } from "@/lib/landing-content";

// Lapisan navy di atas foto, dari Figma: alfa 0,35 di atas, 0,55 di 45%, 0,92 di dasar.
const LAPIS = "linear-gradient(180deg, rgb(11 33 68 / .35), rgb(11 33 68 / .55) 45%, rgb(11 33 68 / .92))";
// Tambahan di belakang blok teks (sisi kiri tengah), memudar ke kanan dan ke atas. Dengan lapisan Figma saja label kecil
// di atas judul hanya berkontras 3,4 sampai 3,7 di atas tenda dan kerumunan yang terang.
const LAPIS_TEKS = "radial-gradient(ellipse 110% 85% at 0% 60%, rgb(11 33 68 / .26) 0, rgb(11 33 68 / .26) 45%, rgb(11 33 68 / 0) 100%)";
// Tambahan di belakang navigasi (bilahnya berakhir 88 px dari tepi atas foto), lalu memudar.
const LAPIS_ATAS = "linear-gradient(180deg, rgb(11 33 68 / .26) 0, rgb(11 33 68 / .26) 96px, rgb(11 33 68 / 0))";

type Props = { hero: LandingHero; angka: LandingAngka; whatsapp: string };

// Hero Beranda: foto Head Home selebar kartu, judul, dua tombol, dan pita angka. Atribut data-hero-beranda pada kartu
// foto membuat navigasi berwujud kaca di atasnya dan footer menjadi navy (lihat globals.css).
export default function Hero({ hero, angka, whatsapp }: Props) {
  const pita = [
    [angka.years.text, `Tahun berkarya sejak ${angka.foundedYear}`],
    [angka.events.text, "Event tercatat"],
    [angka.clients.text, "Klien perusahaan dan instansi"],
    [angka.members.text, "Anggota kru"],
  ];

  return (
    <section id="beranda" className="bg-white p-3 md:p-4 lg:p-6">
      {/* pt menyisakan tempat untuk navigasi yang menumpang di atas foto. */}
      <div
        data-hero-beranda
        className="relative isolate mx-auto flex min-h-[620px] max-w-[1392px] flex-col justify-end gap-[19px] overflow-hidden rounded-hero px-5 pt-28 pb-5 text-white md:px-8 md:pt-32 md:pb-8 lg:h-[852px] lg:px-12 xl:px-20"
      >
        <LandingImage
          src={hero.image}
          alt={hero.alt}
          navy
          loading="eager"
          fetchPriority="high"
          quality={60}
          sizes="(min-width: 1440px) 1392px, calc(100vw - 24px)"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10" style={{ background: `${LAPIS_TEKS}, ${LAPIS}` }} />
        {/* Di bawah 1366 px foto terpotong mendatar dan bagian langitnya jatuh di belakang menu, jadi bagian atas lapisan
            digelapkan sedikit supaya teks menu tetap kontras. Mulai 1366 px menu sudah kontras tanpa pita ini. */}
        <div className="absolute inset-x-0 top-0 -z-10 h-48 min-[1366px]:hidden" style={{ background: LAPIS_ATAS }} />

        <div className="flex max-w-[900px] flex-col items-start gap-6">
          <h1 className="flex flex-col gap-6">
            {/* Spasi di antara kedua span memisahkan "Malang" dari "Acara" bagi pembaca tanpa CSS. Di layar spasi itu tidak
                tampil karena keduanya butir flex. */}
            <span className="text-base/[1.2] font-medium text-white/85">Event Organizer dan Wedding Organizer Malang</span>{" "}
            <span className="text-display">
              Acara Anda,
              <br />
              kami yang urus.
            </span>
          </h1>
          <p className="max-w-[600px] text-lead text-white/90">
            Dari konsep sampai hari H. Acara perusahaan, pernikahan, dan sewa peralatan event di Malang sejak {angka.foundedYear}.
          </p>
          <div className="flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
            <TautanWhatsApp nomor={whatsapp} className={tombol("putih")}>
              Konsultasi Gratis
            </TautanWhatsApp>
            <Link href="/katalog" className={tombol("kaca")}>
              Lihat Katalog Harga
            </Link>
          </div>
        </div>

        {/* Di dalam dl istilah (dt) harus mendahului nilainya (dd), jadi urutan tampilnya dibalik lewat flex. justify-end
            merapatkan isi ke awal arah yang dibalik itu: angka sejajar di atas (HP) atau di kiri (mulai md). */}
        <dl className="kaca kaca-biru kaca-biru--diam grid grid-cols-2 gap-x-4 gap-y-5 rounded-besar p-5 md:gap-x-8 md:p-7 lg:flex lg:h-28 lg:items-center lg:justify-between lg:px-8 lg:py-0 xl:px-12">
          {pita.map(([nilai, label]) => (
            <div key={label} className="flex flex-col-reverse justify-end gap-1 md:flex-row-reverse md:items-center md:gap-3.5">
              <dt className="text-[13px]/[1.3] text-white/90 md:text-isi-sm/[1.3] lg:max-xl:max-w-[8.5em]">{label}</dt>
              <dd className="text-angka tabular-nums">{nilai}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
