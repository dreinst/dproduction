import Link from "next/link";
import type { LandingKantor } from "@/lib/landing-content";

const MENU = [
  { href: "/layanan", label: "Layanan" },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/katalog", label: "Katalog Harga" },
  { href: "/tentang", label: "Tentang" },
  { href: "/tentang#faq", label: "FAQ" },
  { href: "/#kontak", label: "Kontak" },
];

// Acara yang dikelola D'Production, masing-masing punya situs sendiri.
const ACARA = [
  { href: "https://drivetech.dpro.events", label: "Drive Tech" },
  { href: "https://kuwera.dpro.events", label: "KUWERA Fun Run 5K" },
];

const SOSIAL = [
  {
    kunci: "instagram",
    nama: "Instagram",
    ikon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    kunci: "youtube",
    nama: "YouTube",
    ikon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    kunci: "facebook",
    nama: "Facebook",
    ikon: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    kunci: "tiktok",
    nama: "TikTok",
    ikon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
] as const;

// Warna teks footer diwarisi dari <footer>; saat disorot tautan memakai warna penuh. Di layar sentuh tinggi tautan
// dinaikkan sampai 44 px dan lebarnya minimal 44 px (tautan pendek seperti FAQ).
const tautan =
  "text-center transition-colors duration-200 hover:text-ink pointer-coarse:min-w-11 pointer-coarse:py-3.5 footer-navy:hover:text-white";

type Props = { kantor: Pick<LandingKantor, "companyName" | "socials"> };

// Footer semua halaman publik. Bawaan varian putih; di halaman ber-hero Beranda menjadi navy lewat awalan
// footer-navy: (lihat globals.css).
export default function Footer({ kantor }: Props) {
  // Link sosial yang kosong di Setting Kantor tidak ditampilkan.
  const sosial = SOSIAL.flatMap((item) => {
    const href = kantor.socials[item.kunci];
    return href ? [{ ...item, href }] : [];
  });

  return (
    <footer className="bg-white px-tepi py-8 text-mute lg:pt-9 footer-navy:bg-navy footer-navy:text-white/72">
      <div className="mx-auto flex max-w-konten flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-between">
            <nav aria-label="Menu footer">
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm/[1.2] pointer-coarse:gap-y-0 md:gap-x-7">
                {MENU.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={`${tautan} inline-block`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="text-[13px]/[1.4]">
              © {new Date().getFullYear()} {kantor.companyName}, Malang
            </p>
          </div>

          <div className="flex flex-col items-center gap-x-6 gap-y-2 text-[13px] lg:flex-row lg:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-x-5">
              <p id="footer-acara" className="font-medium">
                Acara kami
              </p>
              <ul aria-labelledby="footer-acara" className="flex flex-wrap justify-center gap-x-5">
                {ACARA.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={`${tautan} inline-block`}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {sosial.length > 0 && (
              <ul className="-my-2 flex items-center lg:-mr-2.5">
                {sosial.map((item) => (
                  <li key={item.kunci}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.nama} ${kantor.companyName}`}
                      className="flex size-9 items-center justify-center rounded-full transition-colors duration-200 hover:text-ink pointer-coarse:size-11 footer-navy:hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden="true">
                        <path d={item.ikon} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="h-px bg-ink/10 footer-navy:bg-white/14" />

        {/* Kredit berbahasa Inggris, jadi diberi lang supaya pembaca layar melafalkannya dengan benar. Di bawah 384 px
            huruf, jarak, dan logonya dikecilkan supaya tetap sebaris. */}
        <div
          lang="en"
          className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[13px] max-[384px]:gap-x-2 max-[384px]:text-xs"
        >
          <p>Made by dreinst</p>
          <span aria-hidden="true" className="h-4 w-px bg-ink/25 footer-navy:bg-white/25" />
          <p className="flex items-center gap-2.5 max-[384px]:gap-1.5">
            Organized by
            {/* Logo vektor satu warna: biru di varian putih, diputihkan lewat filter di varian navy. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dpro.svg"
              alt="D'PRO"
              width={523}
              height={106}
              loading="lazy"
              className="h-[23px] w-auto max-[384px]:h-[17px] footer-navy:brightness-0 footer-navy:invert"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
