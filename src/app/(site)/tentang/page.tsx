import type { Metadata } from "next";
import Link from "next/link";
import LandingImage from "@/components/LandingImage";
import PenandaKonten from "@/components/PenandaKonten";
import Ajakan from "@/components/halaman/Ajakan";
import KepalaHalaman from "@/components/halaman/KepalaHalaman";
import VideoFasad from "@/components/halaman/VideoFasad";
import KartuPutih from "@/components/site/KartuPutih";
import KepalaSection from "@/components/site/KepalaSection";
import { daftarFaq } from "@/lib/faq";
import { getLandingAngka, getLandingGaleri, getLandingKantor } from "@/lib/landing-content";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { tentangLd } from "./ld";

// Isi dari database dirender ulang paling lama tiap 5 menit, atau segera setelah admin menyimpan (revalidateLanding).
export const revalidate = 300;

// Tahun berdiri mengikuti Setting Kantor, sama seperti label angka di Beranda.
export async function generateMetadata(): Promise<Metadata> {
  const { foundedYear } = await getLandingKantor();
  return pageMetadata({
    title: `Tentang D'Production | Event Organizer Malang sejak ${foundedYear}`,
    description: `D'Production berdiri di Malang pada ${foundedYear} dan berkantor di Wagir, Kabupaten Malang. Lihat tim, galeri foto dan video, serta jawaban pertanyaan umum.`,
    path: "/tentang",
    absoluteTitle: true,
  });
}

// Foto kru dari folder aset situs. Tanpa nama, dan tidak diambil dari data kru di database.
const FOTO_TIM = [
  { src: "/assets/portfolio/tim-dpro-rompi.jpg", alt: "Kru D'Production berpose bersama memakai rompi merah biru" },
  { src: "/assets/portfolio/kru-half-marathon-gerbang.jpg", alt: "Kru acara berpose di gerbang Malang Half Marathon" },
  {
    src: "/assets/portfolio/tim-dpro-penyambutan.jpg",
    alt: "Kru D'Production memegang papan penyambutan peserta Capacity Building Hebitren Bank Indonesia Kalimantan Barat",
  },
];

export default async function TentangPage() {
  const [kantor, angka, galeri] = await Promise.all([getLandingKantor(), getLandingAngka(), getLandingGaleri()]);
  const faqs = daftarFaq(kantor);
  // Angka dan labelnya sama dengan pita angka di hero Beranda.
  const statistik = [
    { label: `Tahun berkarya sejak ${angka.foundedYear}`, nilai: angka.years.text },
    { label: "Event tercatat", nilai: angka.events.text },
    { label: "Klien perusahaan dan instansi", nilai: angka.clients.text },
    { label: "Anggota kru", nilai: angka.members.text },
  ];

  return (
    <>
      <KepalaHalaman label="Tentang kami" judul="Tentang D'Production." keterangan={kantor.description} />

      <section aria-labelledby="judul-profil" className="bg-latar px-tepi py-section">
        <div className="mx-auto grid max-w-konten gap-x-16 gap-y-10 lg:grid-cols-2">
          <div>
            <KepalaSection id="judul-profil" label="Profil" judul="Dari konsep sampai hari H." />
            <div className="mt-6 flex max-w-[640px] flex-col gap-4 text-isi text-mute">
              {kantor.aboutUs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-kisi self-start">
            {statistik.map((butir) => (
              <KartuPutih key={butir.label} className="gap-2 p-6 lg:p-7">
                <dt className="text-isi-sm text-mute">{butir.label}</dt>
                <dd className="order-first text-angka tabular-nums">{butir.nilai}</dd>
              </KartuPutih>
            ))}
          </dl>
        </div>
      </section>

      <section id="tim" aria-labelledby="judul-tim" className="px-tepi py-section">
        <div className="mx-auto max-w-konten">
          <KepalaSection
            id="judul-tim"
            label="Tim"
            judul="Tim lapangan kami."
            keterangan="Mereka menjalankan acara sampai selesai, lalu menyerahkan dokumentasi."
          />
          <div className="mt-kepala grid gap-kisi sm:grid-cols-3">
            {FOTO_TIM.map((foto) => (
              <div key={foto.src} className="relative aspect-[4/3] overflow-hidden rounded-besar bg-kosong">
                <LandingImage
                  src={foto.src}
                  alt={foto.alt}
                  sizes="(min-width: 1280px) 411px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="galeri" aria-labelledby="judul-galeri" className="bg-latar px-tepi py-section">
        <div className="mx-auto max-w-konten">
          <KepalaSection id="judul-galeri" label="Galeri" judul="Dokumentasi acara kami." />
          <div className="mt-kepala flex flex-col gap-16">
            {/* Galeri bisa kosong kalau semua foto dan video disembunyikan admin. */}
            {galeri.photos.length === 0 && galeri.videos.length === 0 && (
              <p className="text-sub text-mute">
                Belum ada foto atau video yang ditampilkan. Daftar acara kami ada di halaman{" "}
                <Link href="/portofolio" className="font-medium text-navy underline underline-offset-4">
                  Portofolio
                </Link>
                .
              </p>
            )}

            {galeri.photos.length > 0 && (
              <ul className="grid grid-cols-2 gap-x-kisi gap-y-8 lg:grid-cols-3 lg:gap-y-12">
                {galeri.photos.map((photo, index) => (
                  <li key={index}>
                    <figure>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-produk bg-kosong">
                        <LandingImage
                          src={photo.image}
                          alt={photo.caption ? `${photo.album}, ${photo.caption}` : photo.album}
                          sizes="(min-width: 1280px) 411px, (min-width: 1024px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="mt-3">
                        <span className="block text-label text-mute">{photo.album}</span>
                        {photo.caption && <span className="mt-0.5 block text-isi-sm">{photo.caption}</span>}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            )}

            {galeri.videos.length > 0 && (
              <div>
                <h3 className="text-kategori">Video</h3>
                <ul className="mt-6 grid gap-kisi md:grid-cols-2">
                  {galeri.videos.map((video, index) => (
                    <li key={index}>
                      <VideoFasad id={video.id} title={video.title} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="judul-faq" className="px-tepi py-section">
        <div className="mx-auto grid max-w-konten gap-x-16 gap-y-8 lg:grid-cols-[2fr_3fr]">
          <KepalaSection id="judul-faq" label="Pertanyaan umum" judul="Yang sering ditanyakan." />
          {/* details dan summary: bisa dibuka dengan papan ketik, dan jawabannya tetap ada di HTML tanpa JavaScript. */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="group rounded-kartu bg-latar">
                {/* Garis fokus digambar di dalam kotak pertanyaan supaya tidak menimpa baris pertama jawabannya, dan
                    scroll-mt menjaga pertanyaan yang difokus tidak berhenti di belakang bilah navigasi. */}
                <summary className="flex cursor-pointer scroll-mt-(--nav-ruang) list-none items-center justify-between gap-4 rounded-kartu px-6 py-5 text-kartu-sm -outline-offset-2 lg:px-7 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-mute transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </summary>
                <p className="px-6 pb-6 text-isi text-mute lg:px-7">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Ajakan
        judul="Masih ada pertanyaan?"
        keterangan="Tanyakan lewat WhatsApp. Jam operasional kami Senin sampai Sabtu, 09.00 sampai 17.00 WIB."
        nomor={kantor.whatsapp}
      />

      <JsonLd data={tentangLd(faqs)} />
      <PenandaKonten sumber={[kantor.sumber, angka.sumber, galeri.sumber]} />
    </>
  );
}
