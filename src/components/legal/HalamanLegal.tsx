import type { ReactElement } from "react";
import Link from "next/link";
import PenandaKonten from "@/components/PenandaKonten";
import KepalaHalaman from "@/components/halaman/KepalaHalaman";
import { getLandingKantor } from "@/lib/landing-content";
import { JsonLd, absoluteUrl, breadcrumbLd, orgRef, siteRef } from "@/lib/seo";
import { formatTanggal, formatWhatsapp, whatsappUrl } from "@/lib/site";

// Tanggal isi ketiga halaman legal terakhir diperbarui (YYYY-MM-DD). Dipakai teks halaman, JSON-LD, dan sitemap.
export const DIPERBARUI = "2026-10-11";

// Kontak untuk pertanyaan privasi dan permintaan hapus data. Nomor ini lain dari WhatsApp 1 dan 2 di Setting Kantor.
export const WHATSAPP_LEGAL = "6282232999900";
export const EMAIL_LEGAL = "customerservice@dpro.events";

// Alamat ini didaftarkan di aplikasi Meta, jadi jangan diganti.
export const HALAMAN_LEGAL = [
  { path: "/privasi", nama: "Kebijakan Privasi" },
  { path: "/syarat", nama: "Ketentuan Layanan" },
  { path: "/hapus-data", nama: "Penghapusan Data Pengguna" },
] as const;

// Tautan yang berdiri sendiri di dalam isi, setinggi 44 px supaya mudah disentuh.
export const tautan = "inline-flex min-h-11 items-center font-medium text-navy underline underline-offset-4";

// Isi satu bagian: teks menjadi paragraf, larik menjadi daftar berbutir, langkah menjadi daftar bernomor, dan elemen
// dirender apa adanya. Teksnya ditulis sebagai string supaya tanda petik di "D'Production" tidak perlu di-escape.
type Blok = string | string[] | { langkah: string[] } | ReactElement;
// id menjadi jangkar bagian (misalnya /privasi#penyimpanan). Jangan memakai id milik kerangka situs: atas dan konten.
export type Bagian = { id: string; judul: string; isi: Blok[] };

function Isi({ blok }: { blok: Blok }) {
  if (typeof blok === "string") return <p>{blok}</p>;
  if (Array.isArray(blok)) {
    return (
      <ul className="list-disc space-y-2 pl-6">
        {blok.map((butir) => (
          <li key={butir}>{butir}</li>
        ))}
      </ul>
    );
  }
  if ("langkah" in blok) {
    return (
      <ol className="list-decimal space-y-2 pl-6 marker:font-medium marker:text-ink">
        {blok.langkah.map((butir) => (
          <li key={butir}>{butir}</li>
        ))}
      </ol>
    );
  }
  return blok;
}

// Baris kontak. teks adalah pesan awal WhatsApp. Tautannya ditulis lewat whatsappUrl, tanpa TautanWhatsApp, supaya
// pertanyaan privasi dan permintaan hapus data tidak tercatat sebagai konversi iklan. Di bawah 640 px label dan
// nilainya bertumpuk, supaya alamat email tidak terpotong di tengah kata.
export function Kontak({ teks, email = false }: { teks: string; email?: boolean }) {
  return (
    <dl className="grid items-center gap-x-6 text-mute sm:grid-cols-[auto_1fr]">
      <dt>WhatsApp</dt>
      <dd>
        <a href={whatsappUrl(teks, WHATSAPP_LEGAL)} target="_blank" rel="noopener noreferrer" className={tautan}>
          {formatWhatsapp(WHATSAPP_LEGAL)}
        </a>
      </dd>
      {email && (
        <>
          <dt className="max-sm:mt-2">Email</dt>
          <dd>
            <a href={`mailto:${EMAIL_LEGAL}`} className={`${tautan} break-all`}>
              {EMAIL_LEGAL}
            </a>
          </dd>
        </>
      )}
    </dl>
  );
}

type Props = {
  path: (typeof HALAMAN_LEGAL)[number]["path"];
  // Judul h1, ditulis dengan titik seperti kepala halaman lain.
  judul: string;
  keterangan: string;
  bagian: Bagian[];
};

// Kerangka ketiga halaman legal: kepala halaman, daftar isi berjangkar, bagian-bagiannya, tautan ke dua halaman legal
// lain, dan JSON-LD. Seluruhnya dirender di server dan terbaca tanpa JavaScript.
export default async function HalamanLegal({ path, judul, keterangan, bagian }: Props) {
  // Halaman ini memakai data kantor lewat layout (navigasi dan footer), jadi sumbernya ikut ditandai.
  const kantor = await getLandingKantor();
  const nama = HALAMAN_LEGAL.find((halaman) => halaman.path === path)?.nama ?? "";

  return (
    <>
      <KepalaHalaman label="Legal" judul={judul} keterangan={keterangan} />

      {/* Varian [&_a] memberi semua tautan jarak gulir, supaya yang mendapat fokus papan ketik tidak berhenti di
          belakang bilah navigasi. */}
      <div className="px-tepi pb-16 lg:pb-24 [&_a]:scroll-mt-(--nav-ruang)">
        <div className="mx-auto flex max-w-konten flex-col gap-10 lg:flex-row lg:items-start lg:gap-11">
          <div className="rounded-kartu bg-latar p-4 lg:sticky lg:top-(--nav-ruang) lg:max-h-[calc(100dvh-var(--nav-ruang)-1.5rem)] lg:w-[272px] lg:shrink-0 lg:overflow-y-auto">
            <p className="px-2 text-label text-mute">
              Terakhir diperbarui <time dateTime={DIPERBARUI}>{formatTanggal(DIPERBARUI)}</time>
            </p>
            <nav aria-labelledby="judul-isi" className="mt-4">
              <p id="judul-isi" className="px-2 text-label">
                Isi halaman
              </p>
              {/* Di bawah 1024 px butir berupa pil yang turun baris, mulai 1024 px berupa daftar tegak. */}
              <ul className="mt-2 flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
                {bagian.map((b) => (
                  <li key={b.id}>
                    <a
                      href={`#${b.id}`}
                      className="flex min-h-11 items-center rounded-kotak px-3.5 py-2 text-isi-sm transition-colors duration-200 focus-visible:-outline-offset-2 max-lg:bg-white lg:px-2 lg:hover:bg-white"
                    >
                      {b.judul}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex max-w-[680px] min-w-0 flex-col gap-12 text-[1.0625rem]/[1.65] marker:text-mute">
            {bagian.map((b) => (
              <section key={b.id} id={b.id} className="flex flex-col gap-4">
                <h2 className="text-kategori">{b.judul}</h2>
                {b.isi.map((blok, index) => (
                  <Isi key={index} blok={blok} />
                ))}
              </section>
            ))}

            <nav aria-labelledby="judul-legal-lain" className="border-t border-garis pt-8">
              <p id="judul-legal-lain" className="text-label text-mute">
                Halaman terkait
              </p>
              <ul className="mt-1">
                {HALAMAN_LEGAL.filter((halaman) => halaman.path !== path).map((halaman) => (
                  <li key={halaman.path}>
                    <Link href={halaman.path} className={tautan}>
                      {halaman.nama}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbLd(nama, path),
            {
              "@type": "WebPage",
              "@id": absoluteUrl(`${path}#halaman`),
              name: nama,
              url: absoluteUrl(path),
              inLanguage: "id-ID",
              dateModified: DIPERBARUI,
              isPartOf: siteRef,
              publisher: orgRef,
            },
          ],
        }}
      />
      <PenandaKonten sumber={[kantor.sumber]} />
    </>
  );
}
