"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type KategoriKatalog = {
  // Hash penyaring dan id kelompoknya, misalnya /katalog#fireworks.
  slug: string;
  name: string;
  jumlah: number;
  // Judul, deskripsi, dan kisi kartu kategori ini, dirender di server.
  isi: ReactNode;
};

// id wadah katalog: tujuan butir "Semua" tanpa JavaScript dan jangkar daftar di JSON-LD (/katalog#katalog).
const ID_WADAH = "katalog";

// Kategori yang dipilih disimpan di hash alamat dan selalu dibaca dari sana, supaya tombol mundur, muat ulang, dan
// tautan yang dibagikan menampilkan saringan yang sama. history.pushState tidak memicu peristiwa apa pun, jadi pemilih
// memanggil pelanggan sendiri lewat kabari().
const pelanggan = new Set<() => void>();
const kabari = () => pelanggan.forEach((panggil) => panggil());

function langganan(panggil: () => void) {
  pelanggan.add(panggil);
  window.addEventListener("popstate", panggil);
  window.addEventListener("hashchange", panggil);
  return () => {
    pelanggan.delete(panggil);
    window.removeEventListener("popstate", panggil);
    window.removeEventListener("hashchange", panggil);
  };
}

const hashAlamat = () => window.location.hash.slice(1);
// HTML dari server selalu memuat semua kategori.
const hashServer = () => "";

// Skrip sebaris yang dijalankan peramban saat HTML dibaca, sebelum lukisan pertama dan sebelum hidrasi (pola di
// node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md). Halaman yang dibuka dengan hash
// kategori langsung tampil tersaring, jadi isinya tidak bergeser saat hidrasi. Hasilnya harus sama dengan yang dirender
// komponen di bawah untuk hash yang sama. Kalau skrip ini tidak jalan, saringan baru terpasang saat hidrasi.
const SARING_AWAL = `(function(){var h=location.hash.slice(1),w=document.getElementById("${ID_WADAH}"),k=w.querySelectorAll("section"),t=w.querySelectorAll("nav a"),i,ada;for(i=0;i<k.length;i++)ada=ada||k[i].id===h;if(!ada)return;for(i=0;i<k.length;i++)k[i].hidden=k[i].id!==h;for(i=0;i<t.length;i++)t[i].dataset.slug===h?t[i].setAttribute("aria-current","true"):t[i].removeAttribute("aria-current")})()`;

// Di bawah 1024 px butir berupa pil sebaris, mulai 1024 px berupa baris sidebar yang namanya boleh turun baris.
// relative: teks sr-only di dalam butir berposisi absolut. Tanpa balok penampung di sini teks itu lolos dari potongan
// deret pil yang bergulir dan melebarkan halaman di layar sempit.
const butir =
  "relative flex min-h-11 items-center justify-between gap-3 rounded-kotak px-4 py-2 text-isi-sm whitespace-nowrap text-ink transition-colors duration-200 focus-visible:-outline-offset-2 aria-[current=true]:bg-white aria-[current=true]:font-semibold lg:whitespace-normal [&:not([aria-current])]:hover:bg-white/60";

// Sidebar kategori dan kelompok item katalog. Semua kelompok ada di HTML. Memilih kategori menyembunyikan kelompok lain
// di peramban dan menulis pilihannya ke hash alamat. Tanpa JavaScript semua kelompok tetap tampil dan butir sidebar
// bekerja sebagai tautan lompat ke kelompoknya.
export default function PenyaringKatalog({ kategori }: { kategori: KategoriKatalog[] }) {
  const hash = useSyncExternalStore(langganan, hashAlamat, hashServer);
  // Hash lain (kosong, #katalog, #item-3) berarti semua kategori.
  const aktif = kategori.find((k) => k.slug === hash);
  const total = kategori.reduce((jumlah, k) => jumlah + k.jumlah, 0);
  const wadah = useRef<HTMLDivElement>(null);
  const deret = useRef<HTMLUListElement>(null);

  // Di bawah 1024 px daftar kategori berupa deret pil yang digeser mendatar. Pil yang aktif dibawa ke dalam pandangan
  // tanpa menggulir halaman.
  useEffect(() => {
    const kotak = deret.current?.getBoundingClientRect();
    const pil = deret.current?.querySelector("[aria-current]")?.getBoundingClientRect();
    if (!deret.current || !kotak || !pil) return;
    if (pil.left < kotak.left) deret.current.scrollLeft += pil.left - kotak.left;
    else if (pil.right > kotak.right) deret.current.scrollLeft += pil.right - kotak.right;
  }, [aktif?.slug]);

  // slug kosong berarti "Semua".
  const pilih = (event: MouseEvent, slug: string) => {
    // Klik dengan tombol pengubah membuka tab baru seperti tautan biasa.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Diukur sebelum daftar berganti: begitu kelompok lain hilang, peramban bisa menggeser halaman sendiri (scroll
    // anchoring), dan hasilnya berbeda antar peramban.
    const el = wadah.current;
    const tergulir = !!el && el.getBoundingClientRect().top < parseFloat(getComputedStyle(el).scrollMarginTop);
    if (slug !== hashAlamat()) {
      // "Semua" kembali ke alamat tanpa hash.
      window.history.pushState(null, "", slug ? `#${slug}` : window.location.pathname + window.location.search);
      // Kelompok lain disembunyikan sekarang juga, supaya gulir di bawah memakai tata letak yang baru.
      flushSync(kabari);
    }
    // Kalau awal katalog sudah tergulir ke balik navigasi, halaman dibawa ke awal daftar yang baru.
    if (tergulir) el.scrollIntoView({ behavior: "instant" });
  };

  return (
    // wrap-anywhere: nama kategori dan item diisi admin. Kata yang lebih panjang dari kotaknya dipatahkan supaya tetap
    // terbaca di dalam kartu dan butir sidebar.
    <div ref={wadah} id={ID_WADAH} className="mx-auto flex max-w-konten flex-col gap-6 wrap-anywhere lg:flex-row lg:items-start lg:gap-11">
      <nav
        aria-label="Kategori katalog"
        className="rounded-kartu bg-latar p-1.5 lg:sticky lg:top-(--nav-ruang) lg:max-h-[calc(100dvh-var(--nav-ruang)-1.5rem)] lg:w-[272px] lg:shrink-0 lg:overflow-y-auto lg:p-4"
      >
        <ul ref={deret} className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible">
          {[{ slug: "", name: "Semua", jumlah: total }, ...kategori].map((k) => (
            <li key={k.slug} className="shrink-0">
              <a
                href={`#${k.slug || ID_WADAH}`}
                data-slug={k.slug}
                aria-current={k.slug === (aktif?.slug ?? "") ? "true" : undefined}
                onClick={(event) => pilih(event, k.slug)}
                suppressHydrationWarning
                className={butir}
              >
                {k.name}
                <span className="shrink-0 text-[0.8125rem]/[1.2] font-medium text-mute">
                  {k.jumlah}
                  <span className="sr-only"> item</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-1 hidden px-4 py-3.5 text-[0.8125rem]/[1.5] text-mute lg:block">Kategori baru akan terus ditambahkan.</p>
      </nav>

      {/* Dibacakan pembaca layar tiap saringan berganti. */}
      <p role="status" className="sr-only">
        {aktif ? `Menampilkan ${aktif.jumlah} item ${aktif.name}.` : `Menampilkan semua ${total} item.`}
      </p>

      <div className="flex min-w-0 grow flex-col gap-12 lg:gap-16">
        {kategori.map((k) => (
          // Di bawah 1024 px jangkar kelompok menyisakan ruang untuk deret pil di atasnya.
          <section
            key={k.slug}
            id={k.slug}
            hidden={aktif !== undefined && aktif !== k}
            suppressHydrationWarning
            className="max-lg:scroll-mt-[calc(var(--nav-ruang)+5rem)]"
          >
            {k.isi}
          </section>
        ))}
      </div>

      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: SARING_AWAL }}
      />
    </div>
  );
}
