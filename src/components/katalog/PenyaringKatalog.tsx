"use client";

import { type MouseEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";

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
// tautan yang dibagikan menampilkan saringan yang sama. history.pushState dan replaceState tidak memicu peristiwa apa
// pun, jadi pelanggan dikabari sendiri lewat kabari().
const pelanggan = new Set<() => void>();
const kabari = () => pelanggan.forEach((panggil) => panggil());

// Router Next juga mengganti alamat lewat pushState dan replaceState, misalnya saat tautan Katalog Harga di menu diklik
// ketika sebuah kategori sedang dipilih. Supaya saringan ikut berganti, kedua fungsi itu dibungkus satu kali. Kabarnya
// ditunda satu mikrotugas, karena Next memanggil keduanya dari useInsertionEffect dan di sana React melarang pembaruan
// dijadwalkan. Bungkusnya tidak dilepas lagi: Next ikut membungkus kedua fungsi itu dan menyimpan versi yang sedang
// terpasang, jadi mengembalikan fungsi asli dari sini bisa ikut membuang bungkus milik Next. Tanpa pelanggan, bungkus
// ini tidak berbuat apa-apa.
let riwayatDipantau = false;
function pantauRiwayat() {
  if (riwayatDipantau) return;
  riwayatDipantau = true;
  for (const nama of ["pushState", "replaceState"] as const) {
    const asli = window.history[nama];
    window.history[nama] = function (this: History, ...argumen) {
      asli.apply(this, argumen);
      queueMicrotask(kabari);
    };
  }
}

function langganan(panggil: () => void) {
  pantauRiwayat();
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

// Menulis saringan menurut hash alamat ke halaman: kelompok lain disembunyikan dan aria-current pindah ke butirnya.
// Hash yang bukan kategori (kosong, #katalog, #item-3, #konten) berarti semua kategori. Kedua atribut itu hanya ditulis
// di sini dan di SARING_AWAL, tidak lewat render. React hanya menulis atribut yang nilainya berganti di antara dua
// render, jadi atribut yang sudah diubah skrip sebaris sebelum hidrasi tidak pernah dibetulkannya.
function saring(wadah: HTMLElement) {
  const hash = hashAlamat();
  const kelompok = [...wadah.querySelectorAll("section")];
  const slug = kelompok.some((k) => k.id === hash) ? hash : "";
  for (const k of kelompok) k.hidden = slug !== "" && k.id !== slug;
  for (const tautan of wadah.querySelectorAll<HTMLElement>("nav a")) {
    if (tautan.dataset.slug === slug) tautan.setAttribute("aria-current", "true");
    else tautan.removeAttribute("aria-current");
  }
}

// Skrip sebaris yang dijalankan peramban saat HTML dibaca, sebelum lukisan pertama dan sebelum hidrasi (pola di
// node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md). Halaman yang dibuka dengan hash
// kategori langsung tampil tersaring, jadi isinya tidak bergeser saat hidrasi. Sampai komponen di bawah mengambil alih
// (window.onhashchange dikosongkan saat hidrasi), skrip ini juga menjaga butir kategori tetap bekerja, termasuk saat
// berkas JS gagal dimuat. Di jalur itu klik butir adalah lompatan tautan biasa, jadi fungsi s menyaring dua kali:
// saat butir diklik, sebelum peramban melompat, supaya lompatannya dihitung pada daftar yang sudah tersaring, lalu saat
// hashchange (juga untuk tombol mundur). Klik didengar di window pada fase capture, karena sebelum hidrasi selesai React
// bisa menghentikan peristiwa klik di document. Isinya harus sejalan dengan saring() di atas. Kalau skrip ini tidak
// jalan, saringan baru terpasang saat hidrasi.
const SARING_AWAL = `(function(){var w=document.getElementById("${ID_WADAH}"),k=w.querySelectorAll("section"),t=w.querySelectorAll("nav a");function s(h){var g,i;if(typeof h!="string")h=location.hash.slice(1);for(i=0;i<k.length;i++)if(k[i].id===h)g=k[i];for(i=0;i<k.length;i++)k[i].hidden=!!g&&k[i]!==g;for(i=0;i<t.length;i++)t[i].dataset.slug===(g?h:"")?t[i].setAttribute("aria-current","true"):t[i].removeAttribute("aria-current")}function c(e){var a=e.target;if(window.onhashchange!==s)return removeEventListener("click",c,!0);a=a.closest&&!(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)&&a.closest("#${ID_WADAH} nav a");if(a)s(a.dataset.slug)}s();window.onhashchange=s;addEventListener("click",c,!0)})()`;

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

  // Saringan ditulis ulang ke halaman tiap hash atau daftar kategori berganti, dan satu kali saat hidrasi. saring()
  // membaca alamat sendiri, karena saat hidrasi `hash` masih mengikuti HTML server. Sejak hidrasi itu skrip sebaris
  // berhenti menangani klik dan hashchange: tandanya window.onhashchange yang dikosongkan di sini.
  useLayoutEffect(() => {
    window.onhashchange = null;
    if (wadah.current) saring(wadah.current);
  }, [hash, kategori]);

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
    const el = wadah.current;
    // Klik dengan tombol pengubah membuka tab baru seperti tautan biasa.
    if (!el || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Diukur sebelum daftar berganti: begitu kelompok lain hilang, peramban bisa menggeser halaman sendiri (scroll
    // anchoring), dan hasilnya berbeda antar peramban.
    const tergulir = el.getBoundingClientRect().top < parseFloat(getComputedStyle(el).scrollMarginTop);
    // "Semua" kembali ke alamat tanpa hash. Butir yang alamatnya sedang dibuka tidak menambah entri riwayat.
    if (slug !== hashAlamat()) window.history.pushState(null, "", slug ? `#${slug}` : window.location.pathname + window.location.search);
    // Kelompok lain disembunyikan sekarang juga, supaya gulir di bawah memakai tata letak yang baru. Pelanggan selalu
    // dikabari, juga kalau alamatnya tidak berganti, supaya yang tampil tidak pernah tertinggal dari alamat.
    saring(el);
    kabari();
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
                // Keadaan di HTML server: "Semua" aktif. Sesudah itu aria-current ditulis saring().
                aria-current={k.slug ? undefined : "true"}
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
          // Di bawah 1024 px jangkar kelompok menyisakan ruang untuk deret pil di atasnya. Atribut hidden ditulis
          // saring(), jadi di HTML server semua kelompok tampil.
          <section key={k.slug} id={k.slug} suppressHydrationWarning className="max-lg:scroll-mt-[calc(var(--nav-ruang)+5rem)]">
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
