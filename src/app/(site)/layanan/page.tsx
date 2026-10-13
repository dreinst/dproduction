import type { ReactNode } from "react";
import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import PenandaKonten from "@/components/PenandaKonten";
import Ajakan from "@/components/halaman/Ajakan";
import KepalaHalaman from "@/components/halaman/KepalaHalaman";
import KartuPutih from "@/components/site/KartuPutih";
import KepalaSection from "@/components/site/KepalaSection";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";
import { getLandingAngka, getLandingKantor, getLandingKatalog, getLandingWedding } from "@/lib/landing-content";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { type Layanan, layananLd } from "./ld";

// Isi dari database dirender ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Layanan Event, Wedding, dan Sewa Alat Malang",
  description:
    "Tiga layanan D'Production di Malang: event organizer untuk perusahaan dan instansi, wedding organizer, dan persewaan alat event. Tanya lewat WhatsApp.",
  path: "/layanan",
});

// Tiga layanan. id menjadi jangkar yang dituju Beranda dan URL situs lama, dan deskripsinya dipakai halaman serta
// JSON-LD.
const EO: Layanan = {
  id: "event-organizer",
  nama: "Event Organizer",
  jenis: "Event organizer",
  deskripsi: "Kami merencanakan dan menjalankan acara perusahaan dan instansi di Malang, dari konsep sampai hari H.",
};
const WO: Layanan = {
  id: "wedding-organizer",
  nama: "Wedding Organizer",
  jenis: "Wedding organizer",
  deskripsi: "Kami mendampingi persiapan pernikahan Anda di Malang sampai acara selesai di hari H.",
};
const SEWA: Layanan = {
  id: "persewaan-alat",
  nama: "Persewaan Alat",
  jenis: "Sewa alat event",
  deskripsi:
    "Sound system, lighting, tenda, efek panggung, dan fireworks bisa Anda sewa tanpa memakai jasa event organizer kami.",
};

const JENIS_ACARA = ["Gathering perusahaan", "Peresmian", "Fun run", "Peluncuran produk", "Seminar dan workshop", "Gala dinner"];

const daftar = "mt-7 grid w-full gap-x-kisi sm:grid-cols-2";
const butir = "border-t border-garis py-3.5 text-isi font-medium";
const aksi = "mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-8";
const tautan = "inline-flex min-h-11 items-center text-tombol text-navy underline-offset-4 hover:underline";
const catatan = "mt-3 text-sm/[1.6] text-mute";

type BlokProps = { layanan: Layanan; label: string; foto: { src: string; alt: string }; children: ReactNode };

// Satu layanan: kartu putih dengan teks di kiri dan foto di kanan. Di layar sempit foto turun ke bawah teks.
function Blok({ layanan, label, foto, children }: BlokProps) {
  return (
    <section id={layanan.id} aria-labelledby={`judul-${layanan.id}`}>
      <KartuPutih besar className="lg:grid lg:grid-cols-2">
        <div className="flex flex-col items-start p-6 md:p-10 xl:p-14">
          <KepalaSection id={`judul-${layanan.id}`} label={label} judul={layanan.nama} keterangan={layanan.deskripsi} />
          {children}
        </div>
        <div className="relative aspect-[16/10] bg-kosong lg:aspect-auto lg:min-h-[480px]">
          <LandingImage
            src={foto.src}
            alt={foto.alt}
            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </KartuPutih>
    </section>
  );
}

export default async function LayananPage() {
  const [kantor, angka, wedding, katalog] = await Promise.all([
    getLandingKantor(),
    getLandingAngka(),
    getLandingWedding(),
    getLandingKatalog(),
  ]);

  return (
    <>
      <KepalaHalaman
        label="Layanan"
        judul="Event, wedding, dan sewa alat di Malang."
        keterangan="Tiga layanan dari satu tim. Pakai layanan penuh atau hanya bagian yang Anda butuhkan."
      />

      {/* Varian [&_a] memberi semua tautan dan tombol di dalamnya jarak gulir, supaya yang mendapat fokus papan ketik
          tidak berhenti di belakang bilah navigasi. */}
      <div
        className="px-tepi pt-12 pb-section lg:pt-16 [&_a]:scroll-mt-(--nav-ruang)"
        style={{ background: "linear-gradient(180deg, #f5f5f7, #e9f0fb)" }}
      >
        <div className="mx-auto flex max-w-konten flex-col gap-kisi">
          <Blok
            layanan={EO}
            label="Acara perusahaan dan instansi"
            foto={{
              src: "/assets/portfolio/temres-magelang-gala-kostum.jpg",
              alt: "Gala dinner berkostum di Temu Responden Bank Indonesia, Magelang",
            }}
          >
            <ul className={daftar}>
              {JENIS_ACARA.map((jenis) => (
                <li key={jenis} className={butir}>
                  {jenis}
                </li>
              ))}
            </ul>
            <div className={aksi}>
              <TautanWhatsApp
                nomor={kantor.whatsapp}
                teks="Halo D'Production, saya ingin konsultasi acara perusahaan atau instansi."
                className={tombol("navy")}
              >
                Konsultasi acara
              </TautanWhatsApp>
              <Link href="/portofolio" className={tautan}>
                {angka.events.value > 0 ? `Lihat semua ${angka.events.text} event` : "Lihat portofolio"}
              </Link>
            </div>
            <p className={catatan}>Konsultasi lewat WhatsApp. Sesi awal tanpa biaya.</p>
          </Blok>

          <Blok layanan={WO} label="Pernikahan" foto={wedding.photo}>
            {/* Poin layanan dari Master Wedding. Kalau semuanya disembunyikan admin, daftarnya tidak ditampilkan. */}
            {wedding.points.length > 0 && (
              <ul className={daftar}>
                {wedding.points.map((point, index) => (
                  <li key={index} className={butir}>
                    {point.name}
                    {point.description && <span className="mt-1 block text-isi-sm font-normal text-mute">{point.description}</span>}
                  </li>
                ))}
              </ul>
            )}
            <div className={aksi}>
              <TautanWhatsApp
                nomor={kantor.whatsapp}
                teks="Halo D'Production, saya ingin konsultasi pernikahan."
                className={tombol("navy")}
              >
                Konsultasi pernikahan
              </TautanWhatsApp>
            </div>
            <p className={catatan}>Konsultasi lewat WhatsApp. Sesi awal tanpa biaya.</p>
          </Blok>

          <Blok
            layanan={SEWA}
            label="Sewa alat"
            foto={{
              src: "/assets/portfolio/pekan-qris-nasional-panggung.jpg",
              alt: "Penampilan di panggung utama Pekan QRIS Nasional 2024 dengan layar LED dan pengeras suara",
            }}
          >
            {/* Kategori dari katalog harga. Tautannya membuka halaman katalog dengan kategori itu terpilih. */}
            {katalog.categories.length > 0 && (
              <ul className={daftar}>
                {katalog.categories.map((category) => (
                  <li key={category.slug} className="border-t border-garis">
                    <Link
                      href={`/katalog#${category.slug}`}
                      className="flex min-h-12 items-center justify-between gap-3 py-2 text-isi font-medium underline-offset-4 hover:underline"
                    >
                      {category.name}{" "}
                      <span className="shrink-0 text-label text-mute">{category.items.length} item</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className={aksi}>
              <Link href="/katalog" className={tombol("navy")}>
                Lihat katalog harga
              </Link>
              <TautanWhatsApp
                nomor={kantor.whatsapp}
                teks="Halo D'Production, saya ingin bertanya ketersediaan sewa alat."
                className={tautan}
              >
                Tanya ketersediaan
              </TautanWhatsApp>
            </div>
            <p className={catatan}>Item yang harganya belum tercantum bisa ditanyakan lewat WhatsApp.</p>
          </Blok>
        </div>
      </div>

      <Ajakan
        judul="Bingung mulai dari mana?"
        keterangan="Ceritakan jenis acara, tanggal, dan kebutuhan Anda. Sesi awal tanpa biaya."
        nomor={kantor.whatsapp}
        className="pt-12 lg:pt-18"
      />

      <JsonLd data={layananLd([EO, WO, SEWA], SEWA.id)} />
      <PenandaKonten sumber={[kantor.sumber, angka.sumber, wedding.sumber, katalog.sumber]} />
    </>
  );
}
