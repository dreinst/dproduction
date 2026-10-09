"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import TautanWhatsApp from "@/components/site/TautanWhatsApp";
import { tombol } from "@/components/site/tombol";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/katalog", label: "Katalog Harga" },
  { href: "/tentang", label: "Tentang" },
  { href: "/#kontak", label: "Kontak" },
];

const ID_LEMBAR = "menu-hp";

// Warna berganti antara varian terang dan varian kaca lewat awalan nav-kaca: (lihat globals.css).
const tautanBilah =
  "py-2 text-tombol-sm text-ink/72 transition-colors duration-200 hover:text-ink aria-[current=page]:text-ink nav-kaca:text-white/85 nav-kaca:hover:text-white nav-kaca:aria-[current=page]:text-white";
const tombolBulat = "flex size-11 items-center justify-center rounded-full";

// whatsapp: nomor WhatsApp 1 berformat 62xxx dari Setting Kantor.
export default function Navigasi({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const lembar = useRef<HTMLDialogElement>(null);

  // Selama foto hero (elemen bertanda data-hero-beranda) masih di bawah bilah, navigasi berwujud kaca. Begitu foto
  // lewat, data-terang="true" mengembalikannya ke varian terang. Atribut ditulis langsung ke DOM karena hanya dibaca
  // CSS, jadi tidak perlu render ulang.
  useEffect(() => {
    // Pindah halaman lewat tombol kembali peramban ikut menutup lembar menu.
    lembar.current?.close();
    const el = header.current;
    const hero = document.querySelector("[data-hero-beranda]");
    if (!el || !hero) return;
    // Tepi bawah bilah di posisi kacanya. Saat datang dari halaman lain bilah masih bergerak turun, jadi transisi top
    // dimatikan sebentar supaya yang terukur posisi akhirnya.
    el.style.transition = "none";
    const tepiBawah = el.offsetTop + el.offsetHeight;
    el.style.transition = "";
    const pengamat = new IntersectionObserver(
      ([entri]) => {
        el.dataset.terang = String(!entri.isIntersecting);
      },
      { rootMargin: `-${tepiBawah}px 0px 0px 0px` },
    );
    pengamat.observe(hero);
    return () => {
      pengamat.disconnect();
      delete el.dataset.terang;
    };
  }, [pathname]);

  const aktif = (href: string) => (href === pathname ? "page" : undefined);
  const tutup = () => lembar.current?.close();

  return (
    <>
      <header ref={header} className="nav-situs pointer-events-none inset-x-0 z-50 px-tepi">
        <nav
          aria-label="Menu utama"
          className="nav-bilah kaca kaca-biru kaca-biru--diam pointer-events-auto mx-auto flex h-(--nav-tinggi) max-w-nav items-center justify-between rounded-full pr-1.5 pl-5 text-ink lg:pr-2.5 lg:pl-7 nav-kaca:text-white"
        >
          <Link href="/" className="shrink-0">
            {/* Logo vektor satu warna: biru di varian terang, diputihkan lewat filter di varian kaca. fetchPriority
                rendah supaya React tidak memuatnya lebih dulu dari foto hero. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dpro.svg"
              alt="D'Production"
              width={523}
              height={106}
              fetchPriority="low"
              className="h-[22px] w-auto lg:h-[27.5px] nav-kaca:brightness-0 nav-kaca:invert"
            />
          </Link>

          <ul className="hidden items-center gap-6 lg:flex xl:gap-[34px]">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={aktif(item.href)} className={tautanBilah}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <TautanWhatsApp
              nomor={whatsapp}
              className={`${tombol("navy", "kecil")} nav-kaca:bg-white nav-kaca:text-ink nav-kaca:outline-white nav-kaca:hover:bg-latar`}
            >
              Konsultasi Gratis
            </TautanWhatsApp>
          </div>

          {/* Dengan skrip, lembar dibuka sebagai dialog modal: fokus terkurung, Esc menutup, fokus kembali ke tombol
              ini. Tanpa skrip, popoverTarget membuka elemen yang sama sebagai popover. */}
          <button
            type="button"
            popoverTarget={ID_LEMBAR}
            aria-haspopup="dialog"
            aria-label="Buka menu"
            onClick={(e) => {
              e.preventDefault();
              lembar.current?.showModal();
            }}
            className={`${tombolBulat} text-ink hover:bg-ink/6 lg:hidden nav-kaca:text-white nav-kaca:hover:bg-white/12`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>
      </header>

      <dialog
        ref={lembar}
        id={ID_LEMBAR}
        popover="auto"
        aria-label="Menu"
        className="nav-lembar kaca fixed inset-0 hidden h-dvh max-h-none w-full max-w-none flex-col gap-6 overflow-y-auto overscroll-contain p-6 text-white backdrop:bg-transparent open:flex"
      >
        {/* Tombol tutup lebih dulu di DOM supaya menjadi tujuan fokus pertama saat lembar dibuka. */}
        <div className="flex flex-row-reverse items-center justify-between">
          <button
            type="button"
            popoverTarget={ID_LEMBAR}
            popoverTargetAction="hide"
            aria-label="Tutup menu"
            onClick={tutup}
            className={`${tombolBulat} -mr-2.5 hover:bg-white/12`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <Link href="/" onClick={tutup}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dpro.svg" alt="D'Production" width={523} height={106} loading="lazy" className="h-[22px] w-auto brightness-0 invert" />
          </Link>
        </div>

        <nav aria-label="Menu utama">
          <ul className="divide-y divide-white/14 border-y border-white/14">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={aktif(item.href)}
                  onClick={tutup}
                  className="flex h-14 items-center text-[1.75rem] font-semibold tracking-[-0.02em] text-white/85 hover:text-white aria-[current=page]:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <TautanWhatsApp nomor={whatsapp} className={`${tombol("putih")} mt-auto w-full`}>
          Konsultasi Gratis
        </TautanWhatsApp>
      </dialog>
    </>
  );
}
