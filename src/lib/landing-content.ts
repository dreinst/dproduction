// Khusus server: isi halaman publik dari database. Kalau database tidak bisa dijangkau, dipakai salinan data terakhir yang
// berhasil dibaca, dan kalau salinan belum ada, konten kode (FALLBACK). Konten kode juga mengisi bagian yang tabelnya
// belum punya baris sama sekali.
// Jangan diimpor komponen klien kecuali lewat `import type`.
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { KantorSetting, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { WHATSAPP_NUMBER, formatRibuan, formatWhatsapp, waNumber, wibDate, youtubeId } from "@/lib/site";

const MAPS_PREFIX = "https://www.google.com/maps";

// Konten yang tampil sebelum landing membaca database. Juga dipakai scripts/seed-landing-content.ts untuk mengisi DB.
// Kolom kantor memakai nama dan format kolom KantorSetting.
export const FALLBACK = {
  kantor: {
    companyName: "D'Production",
    address: "Jl. Raya Pandanlandung No. 16 Bandulan, Wagir, Kab. Malang, Jawa Timur",
    whatsapp: "081938938800",
    whatsapp2: "082132370811",
    email: "dproductionorganizer@gmail.com",
    website: "https://www.dpro.events",
    instagramUrl: "https://www.instagram.com/dpro.duction",
    youtubeUrl: "https://youtube.com/@dproductionzone",
    facebookUrl: null as string | null,
    tiktokUrl: null as string | null,
    googleMapsUrl: `${MAPS_PREFIX}?q=${encodeURIComponent(
      "D'Production Event & Wedding Planner, Jl. Raya Pandanlandung No.16, Bandulan, Wagir, Malang",
    )}&output=embed`,
    foundedYear: 2016,
    description:
      "D'Production adalah event organizer dan wedding organizer di Malang sejak 2016. Dari konsep hingga eksekusi, kami merancang acara korporat, pemerintahan, hingga pernikahan Anda dari awal sampai selesai.",
    aboutUs:
      "D'Production adalah mitra terpercaya Anda di Malang. Kami percaya bahwa setiap acara memiliki cerita dan tujuannya masing-masing. Oleh karena itu, kami tidak hanya menyelenggarakan acara, tapi kami merancang pengalaman.\n\n" +
      "Dengan tim yang berdedikasi tinggi, kreatif, dan berpengalaman, kami memastikan setiap detail, dari konsep hingga eksekusi, berjalan dengan sempurna.",
    // Kosong berarti dihitung: dari baris aktif di tabelnya, atau dari daftar klien dan events di bawah.
    statClients: null as number | null,
    statEvents: null as number | null,
    statRentalCategories: 4,
    statMembers: 200,
    statYears: 10,
  },
  // Foto hero desain v2. Lapisan gelap hero disetel untuk foto ini (src/components/beranda/Hero.tsx).
  hero: {
    image: "/assets/portfolio/qris-fun-run-start.jpg",
    title: "QRIS Fun Run Bank Indonesia",
    caption: "Pelari di garis start QRIS Fun Run Bank Indonesia di Malang.",
    alt: "Pelari berkumpul di gerbang start QRIS Fun Run Bank Indonesia di Malang, dipotret dari udara",
  },
  // Semua event yang pernah ditangani (portofolio resmi, dokumentasi Drive, dan daftar situs lama). Isi dan urutannya
  // sama dengan Master Event: tahun terbaru dulu, lalu urutan baris di tabel.
  // featured = event terbesar dari sisi skala, tampil sebagai kartu berfoto di Masterpiece.
  events: [
    { name: "Emba JetBus Run Malang 10K", client: "Emba", year: 2026 },
    { name: "MS Glow Run Malang Half Marathon", client: "MS Glow", year: 2026, featured: true,
      photo: "/assets/portfolio/half-marathon-flag-off.jpg",
      description: "Lomba lari half marathon di Kota Malang, dari flag off subuh, rute kota, sampai race village di garis finish." },
    { name: "Smartfren Fun Run Malang", client: "Smartfren", year: 2026 },
    { name: "Program Hebitren Bank Indonesia (Bandung)", client: "KPw Bank Indonesia Kalimantan Barat", year: 2026 },
    { name: "Program Hebitren Bank Indonesia (Yogyakarta)", client: "Bank Indonesia", year: 2026 },
    { name: "Temu Responden Bank Indonesia (Magelang)", client: "KPw Bank Indonesia Malang", year: 2026, featured: true,
      photo: "/assets/portfolio/temres-magelang-gala-kostum.jpg",
      description: "Empat hari evaluasi surveyor KPw Bank Indonesia Malang di Magelang, dengan jeep adventure, kunjungan wisata, dan gala dinner bertema." },
    { name: "Peresmian Gedung Ekstensi PT. Ustegra", client: "PT. Ustegra", year: 2026, featured: true,
      photo: "/assets/portfolio/ustegra-gedung-udara.jpg",
      description: "Seremoni peresmian gedung pabrik baru PT. Ustegra Malang pada 24 Agustus 2026, dari tur pabrik bersama tamu VIP hingga perayaan bersama ratusan karyawan." },
    { name: "Gathering 10 Tahun Aice Malang", client: "Aice", year: 2026 },
    { name: "Serambi Bank Indonesia Malang dan Pasuruan", client: "Bank Indonesia", year: 2026 },
    { name: "Booth Bank Indonesia di Pasar Santri Sidogiri", client: "Bank Indonesia", year: 2026 },
    { name: "Wedding di Ijen Suites Malang", client: null, year: 2026 },
    { name: "QrisMa", client: "Bank Indonesia", year: 2026 },
    { name: "Emba Run Malang 10K", client: "Emba", year: 2025, featured: true,
      photo: "/assets/portfolio/emba-run-finish.jpg",
      description: "Lomba lari 10K di Malang, dari persiapan rute sampai perayaan pelari dan sponsor di garis finish." },
    { name: "Pekan QRIS Nasional dan QRIS Jelajah Indonesia", client: "KPw Bank Indonesia Malang", year: 2025 },
    { name: "Gathering Bank Indonesia Kalimantan Barat di Bromo", client: "KPw Bank Indonesia Kalimantan Barat", year: 2025 },
    { name: "Temu Responden Bank Indonesia Malang", client: "KPw Bank Indonesia Malang", year: 2025 },
    { name: "Internet Starlink untuk BRI di Bromo", client: "BRI", year: 2025 },
    { name: "Employee Gathering Cuddle Me 2025", client: "Cuddle Me", year: 2025 },
    { name: "BINS Goes To Campus", client: "Bank Indonesia Institute", year: 2025 },
    { name: "Kuliah Kebangsaan bersama Sandiaga Uno dan Habib Ja'far", client: "Bank Indonesia dan Universitas Negeri Malang", year: 2025 },
    { name: "Forum Koordinasi Polhukam", client: "Kemenko Polhukam", year: 2025 },
    { name: "HUT ke-20 SSK", client: null, year: 2025 },
    { name: "Yubileum OMK Demako", client: null, year: 2025 },
    { name: "Capacity Building DSPK", client: "Bank Indonesia", year: 2025 },
    { name: "One Big Family BI Kalimantan Barat di Bogor", client: "KPw Bank Indonesia Kalimantan Barat", year: 2025 },
    { name: "Capacity Building Kopi dan Hebitren", client: "KPw Bank Indonesia Kalimantan Barat", year: 2025 },
    { name: "Capacity Building Pondok Pesantren", client: "Bank Indonesia Jakarta", year: 2025 },
    { name: "Capacity Building Petani Cabai dan Bawang Merah", client: "KPw Bank Indonesia Sulawesi Tengah", year: 2025 },
    { name: "Pesta Ulang Tahun ke-78 Bertema Arabian", client: null, year: 2025 },
    { name: "Reuni Teratai", client: null, year: 2025 },
    { name: "Malam Tahun Baru eL Hotel", client: "eL Hotel", year: 2025 },
    { name: "HUT Paroki Maria Ratu Damai Banyuwangi", client: "Gereja Katolik Paroki Maria Ratu Damai Banyuwangi", year: 2025 },
    { name: "Sound system untuk Jalan Sehat di Universitas Ma Chung", client: "Universitas Ma Chung", year: 2025 },
    { name: "Sound system untuk Peluncuran Album di The Grove", client: null, year: 2025 },
    { name: "Sound system untuk Bank Indonesia Malang", client: "Bank Indonesia", year: 2025 },
    { name: "Sound system untuk Ngajum Sae", client: null, year: 2025 },
    { name: "Sound system untuk acara di Tunjungsekar", client: null, year: 2025 },
    { name: "Sound system untuk acara di Double Tree", client: null, year: 2025 },
    { name: "Sound system untuk acara di Ijen Suites", client: null, year: 2025 },
    { name: "Sound system untuk acara di hotel ibis", client: null, year: 2025 },
    { name: "Malang BI-Youth-Tiful Festival", client: "Bank Indonesia", year: 2024 },
    { name: "Employee Excellence Award G4S", client: "G4S", year: 2024 },
    { name: "QRIS Fun Run Bank Indonesia", client: "KPw Bank Indonesia Malang", year: 2024, featured: true,
      photo: "/assets/portfolio/qris-fun-run-start.jpg",
      description: "Fun run kampanye QRIS Bank Indonesia dengan ribuan pelari, rangkaian Pekan QRIS Nasional 2024 di Malang." },
    { name: "Pesta Demokrasi KPU Kab. Malang", client: "KPU Kab. Malang", year: 2024 },
    { name: "Gebyar QRIS Ngalam Bank Indonesia", client: "Bank Indonesia", year: 2023 },
    { name: "HUT Prov. Jawa Timur Ke-78", client: "Pemerintah Provinsi Jawa Timur", year: 2023 },
    { name: "Digifes BI Ngalam 2023", client: "KPw Bank Indonesia Malang", year: 2023 },
    { name: "Kemenkeu Goes To Bromo", client: "Kementerian Keuangan", year: null },
    { name: "Sekartaji Bank Indonesia", client: "Bank Indonesia", year: null },
    { name: "Rupiah Championship", client: "Bank Indonesia", year: null },
  ] as EventEntry[],
  weddingPoints: ["Konsep & Tema", "Dekorasi Premium", "Manajemen Vendor", "Koordinasi Hari-H"],
  weddingPhoto: { src: "/assets/portfolio/wedding-ijen-suites.jpg", alt: "Dokumentasi pernikahan di Ijen Suites Malang" },
  // Katalog harga, sama dengan Kategori Katalog dan Master Rental. Urutan di kedua daftar menjadi urutan tampil.
  rentalCategories: [
    { name: "Efek Panggung", description: "Untuk momen pembuka, puncak acara, first dance, sampai penutupan." },
    { name: "Fireworks", description: "Harga awal. Jumlah shot menyesuaikan durasi dan lokasi acara." },
    { name: "Sound dan Lighting", description: "Menyesuaikan ukuran venue dan jumlah tamu." },
    { name: "Tenda dan Perlengkapan", description: "Untuk acara luar ruang maupun dalam ruang." },
  ],
  rentals: [
    { name: "Snow", category: "Efek Panggung", price: 400000, unit: "per mesin" },
    { name: "Bubble", category: "Efek Panggung", price: 300000, unit: "per mesin", photo: "/assets/katalog/bubble.jpg" },
    { name: "Smoke", category: "Efek Panggung", price: 300000, unit: "per mesin" },
    { name: "Dry Ice", category: "Efek Panggung", price: 1500000, unit: "per momen",
      extraPrices: [{ amount: 2000000, unit: "per 2 momen" }], photo: "/assets/katalog/dry-ice.jpg" },
    { name: "Confetti Mortar", category: "Efek Panggung", price: 300000, unit: "per mesin", photo: "/assets/katalog/confetti-mortar.jpg" },
    { name: "Giant Confetti", category: "Efek Panggung", price: 1500000, unit: "per 1 kg",
      extraPrices: [{ amount: 2500000, unit: "per 2 kg" }], photo: "/assets/katalog/giant-confetti.jpg" },
    { name: "Silver Jet", category: "Efek Panggung", price: 300000, unit: "per titik", photo: "/assets/katalog/silver-jet.jpg" },
    { name: "Single Jet Fire", category: "Efek Panggung", price: 900000, unit: "per mesin", photo: "/assets/katalog/single-jet-fire.jpg" },
    { name: "Rotary Sparkle", category: "Efek Panggung", price: 1200000, unit: "per mesin", photo: "/assets/katalog/rotary-sparkle.jpg" },
    { name: "Pyro", category: "Efek Panggung", price: 300000, unit: "per titik" },
    { name: "Pyro Wheel", category: "Efek Panggung", price: 2500000, unit: "per mesin", photo: "/assets/katalog/pyro-wheel.jpg" },
    { name: "CO2 Gun", category: "Efek Panggung", price: 1000000, unit: "per mesin", photo: "/assets/katalog/co2-gun.jpg" },
    { name: "CO2 Jet", category: "Efek Panggung", price: 1000000, unit: "per 8 kg",
      extraPrices: [{ amount: 2500000, unit: "per 25 kg" }], photo: "/assets/katalog/co2-jet.jpg" },
    { name: "Waterfall Fireworks", category: "Fireworks", price: 2500000, unit: "per 25 titik", priceFrom: true },
    { name: "Daylight Firework", category: "Fireworks", price: 4000000, unit: "per 100 shot", priceFrom: true,
      photo: "/assets/katalog/daylight-firework.jpg" },
    { name: "Paket Fireworks A", category: "Fireworks", price: 12000000, unit: "300 sampai 400 shot", priceFrom: true,
      photo: "/assets/katalog/paket-fireworks-a.jpg" },
    { name: "Paket Fireworks B", category: "Fireworks", price: 15000000, unit: "400 sampai 500 shot", priceFrom: true,
      photo: "/assets/katalog/paket-fireworks-b.jpg" },
    { name: "Paket Fireworks C", category: "Fireworks", price: 20000000, unit: "500 sampai 700 shot", priceFrom: true,
      photo: "/assets/katalog/paket-fireworks-c.jpg" },
    { name: "Sound System", category: "Sound dan Lighting", price: 1000000, unit: "per hari", priceHidden: true,
      photo: "/assets/portfolio/pekan-qris-nasional-panggung.jpg" },
    { name: "Lighting Stage", category: "Sound dan Lighting", price: 500000, unit: "per hari", priceHidden: true,
      photo: "/assets/portfolio/ustegra-panggung-peresmian.jpg" },
    { name: "Tenda", category: "Tenda dan Perlengkapan", price: 200000, unit: "per hari", priceHidden: true,
      photo: "/assets/portfolio/qris-fun-run-start.jpg" },
    { name: "Kursi dan Meja", category: "Tenda dan Perlengkapan", price: null, unit: "per hari", priceHidden: true,
      photo: "/assets/portfolio/ustegra-aula-perayaan.jpg" },
  ] as RentalEntry[],
  // Empat kartu harga di Beranda, sesuai desain. Kalau salah satunya tidak aktif lagi, item lain yang mengisi.
  cuplikanKatalog: ["Dry Ice", "Giant Confetti", "Paket Fireworks A", "Sound System"],
  // Klien yang dihitung, urut seperti Master Klien. Di situs hanya logo yang tampil, dengan nama sebagai teks alt.
  // Klien tanpa logo ikut dihitung, tetapi namanya tidak ditampilkan.
  klien: [
    { name: "OT Group", logo: "/assets/klien/klien-OTLogo1745712809048.png" },
    { name: "Bentoel Group", logo: "/assets/klien/klien-BENTOELGROUPlogo11745712794451.png" },
    { name: "Astra Group", logo: "/assets/klien/klien-imgbinb0ca992c32d7edb40c52751a2e616bed1745712778289.png" },
    { name: "Universitas Brawijaya", logo: "/assets/klien/klien-LogoUniversitasBrawijaya1745712898778.png" },
    { name: "Kementerian Dalam Negeri", logo: "/assets/klien/klien-Kemendagri1751908735230.png" },
    { name: "Bank Indonesia", logo: "/assets/klien/klien-BIBankIndonesiaLogoPNG240pFileVector691745712867351.png" },
    { name: "Kementerian Keuangan", logo: null },
    { name: "Pemerintah Provinsi Jawa Timur", logo: "/assets/klien/klien-logoJatim1751906923785.png" },
    { name: "Peksy 89", logo: null },
    { name: "Kemenko Polhukam", logo: "/assets/klien/klien-KemenkoPolhukam1751908823230.png" },
    { name: "Kemendikbud", logo: "/assets/klien/klien-Kemendikbud1751909062076.png" },
    { name: "Smara Wedding Organizer", logo: "/assets/klien/klien-LogoSmara1751909345542.png" },
    { name: "Emba", logo: "/assets/klien/klien-EmbaJetbusRun1751910236438.png" },
    { name: "Gereja Katolik Paroki Maria Ratu Damai Banyuwangi", logo: null },
    { name: "Cuddle Me", logo: null },
    { name: "Universitas Airlangga", logo: null },
    { name: "Universitas Ma Chung", logo: null },
    { name: "BRI", logo: null },
    { name: "MS Glow", logo: null },
    { name: "Aice", logo: null },
    { name: "G4S", logo: null },
    { name: "KPU Kabupaten Malang", logo: null },
    { name: "Smartfren", logo: null },
    { name: "PT. Ustegra", logo: null },
    { name: "eL Hotel", logo: null },
  ] as { name: string; logo: string | null }[],
  photos: [
    { image: "/assets/portfolio/hebitren-bandung-masjid-al-jabbar.jpg", album: "Hebitren BI Bandung", caption: "Masjid Raya Al Jabbar dari Udara" },
    { image: "/assets/portfolio/ustegra-aula-perayaan.jpg", album: "Peresmian Ustegra", caption: "Perayaan Bersama Karyawan" },
    { image: "/assets/portfolio/half-marathon-udara-malam.jpg", album: "MS Glow Run Half Marathon", caption: "Area Start Menjelang Flag Off" },
    { image: "/assets/portfolio/temres-magelang-peserta-ceria.jpg", album: "Temres BI Magelang", caption: "Wisata Bersama Peserta" },
    { image: "/assets/portfolio/hebitren-jogja-petani.jpg", album: "Hebitren BI Jogja", caption: "Bersama Petani Mitra" },
    { image: "/assets/portfolio/pekan-qris-nasional-panggung.jpg", album: "Pekan QRIS Nasional", caption: "Penampilan di Panggung Utama" },
    { image: "/assets/portfolio/ustegra-panggung-peresmian.jpg", album: "Peresmian Ustegra", caption: "Panggung Peresmian" },
    { image: "/assets/portfolio/hebitren-bandung-petik-stroberi.jpg", album: "Hebitren BI Bandung", caption: "Petik Stroberi" },
    { image: "/assets/portfolio/temres-magelang-peserta-senyum.jpg", album: "Temres BI Magelang", caption: "Keseruan Peserta" },
    { image: "/assets/portfolio/hebitren-jogja-yia-grup.jpg", album: "Hebitren BI Jogja", caption: "Penyambutan di Bandara YIA" },
    { image: "/assets/portfolio/kru-half-marathon.jpg", album: "MS Glow Run Half Marathon", caption: "Kru di Race Village" },
    { image: "/assets/portfolio/ustegra-gedung-udara.jpg", album: "Peresmian Ustegra", caption: "Gedung Baru dari Udara" },
  ] as { image: string; album: string; caption: string | null }[],
};

export type EventEntry = {
  name: string;
  client: string | null;
  year: number | null;
  featured?: boolean;
  photo?: string;
  description?: string;
};

// Item katalog dengan nama kolom Master Rental. category berisi nama kategorinya, dan kolom yang tidak ditulis memakai
// nilai bawaan tabel.
export type RentalEntry = {
  name: string;
  category: string;
  price: number | null;
  unit: string | null;
  priceFrom?: boolean;
  priceHidden?: boolean;
  extraPrices?: { amount: number; unit: string }[];
  photo?: string;
};

// Asal isi sebuah pembacaan: database, salinan data terakhir yang berhasil dibaca (saat database terganggu), atau konten kode.
export type Sumber = "db" | "salinan" | "bawaan";

export type LandingKantor = {
  companyName: string;
  address: string;
  whatsapp: string; // WhatsApp 1 dalam format 62xxx untuk wa.me, dipakai semua ajakan umum
  whatsappDisplay: string; // +62 819-3893-8800
  whatsapp2: string | null; // WhatsApp 2 dalam format 62xxx; null kalau dikosongkan di Setting Kantor
  whatsapp2Display: string | null;
  email: string;
  socials: { instagram: string | null; youtube: string | null; facebook: string | null; tiktok: string | null };
  googleMapsUrl: string;
  description: string;
  aboutUs: string[];
  foundedYear: number;
};

// Satu angka di pita hero. text siap tampil: angka yang diisi tangan di Setting Kantor diberi "+", angka hitungan tidak.
export type Angka = { value: number; text: string };

export type LandingAngka = { foundedYear: number; years: Angka; events: Angka; clients: Angka; members: Angka };

export type LandingHero = { image: string; title: string | null; caption: string | null; alt: string };

export type LandingEvents = {
  // Semua event aktif per tahun, tahun terbaru dulu. Event tanpa tahun ada di kelompok terakhir (year null).
  byYear: { year: number | null; label: string; events: { name: string; client: string | null }[] }[];
  // Event featured yang fotonya valid, tahun terbaru dulu lalu urutan tabel. Beranda memakai tiga yang pertama.
  masterpieces: { name: string; client: string | null; year: number | null; photo: string; description: string | null }[];
};

// Hanya klien aktif yang berlogo. Nama dipakai sebagai teks alt logo, tidak untuk daftar teks.
export type LandingKlien = { logos: { name: string; logo: string }[] };

export type KatalogItem = {
  name: string;
  photo: string | null;
  // Baris harga berurutan, yang pertama harga utama. Kosong berarti "Harga lewat WhatsApp": nominalnya tidak dikirim.
  prices: { amount: number; unit: string | null }[];
  priceFrom: boolean;
};

// slug dipakai sebagai hash penyaring di halaman katalog, misalnya /katalog#fireworks.
export type LandingKatalog = {
  categories: { name: string; slug: string; description: string | null; items: KatalogItem[] }[];
};

export type LandingWedding = {
  points: { name: string; description: string | null }[];
  photo: { src: string; alt: string };
};

export type LandingGaleri = {
  photos: { image: string; album: string; caption: string | null }[];
  videos: { id: string; title: string }[];
};

// Database dianggap gagal kalau belum menjawab dalam waktu ini, supaya pengunjung tidak menunggu koneksi yang menggantung.
const DB_TIMEOUT_MS = 2500;
// Naikkan kalau bentuk hasil salah satu pembaca berubah, supaya salinan lama tidak dipakai kode baru.
const SNAPSHOT_VERSION = 1;
// Folder yang sama dengan cache halaman bersama (CACHE_DIR), jadi salinan ikut dibagi antar instance dan bertahan
// melewati deploy.
const SNAPSHOT_DIR = path.join(
  /*turbopackIgnore: true*/ process.env.CACHE_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "cache", "dpro"),
  "data",
);
const lastSaved = new Map<string, string>();
let tmpCount = 0;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("Database terlalu lama menjawab."), { code: "ETIMEDOUT" })), ms);
  });
  // Kalau kalah cepat dari timeout, penolakan query yang datang belakangan tidak boleh menjadi unhandledRejection.
  promise.catch(() => {});
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Salinan hanya ditulis dari hasil baca database yang berhasil, jadi konten kode tidak pernah menimpanya.
async function saveSnapshot(name: string, data: unknown) {
  const body = JSON.stringify(data);
  const file = path.join(/*turbopackIgnore: true*/ SNAPSHOT_DIR, `${name}.json`);
  // Isi yang sama tidak ditulis ulang, kecuali berkasnya hilang (misalnya folder cache dikosongkan saat server jalan).
  if (lastSaved.get(name) === body && (await stat(/*turbopackIgnore: true*/ file).catch(() => null))) return;
  // Nama sementara unik per penulisan: dua halaman yang dirender bersamaan bisa menyimpan salinan yang sama, dan berkas
  // sementara yang dipakai berdua bisa tercampur isinya atau sudah dipindahkan penulis lain.
  const tmp = `${file}.${process.pid}.${tmpCount++}.tmp`;
  try {
    await mkdir(/*turbopackIgnore: true*/ SNAPSHOT_DIR, { recursive: true });
    await writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify({ v: SNAPSHOT_VERSION, savedAt: new Date().toISOString(), data }));
    await rename(/*turbopackIgnore: true*/ tmp, file);
    lastSaved.set(name, body);
  } catch (error) {
    await rm(/*turbopackIgnore: true*/ tmp, { force: true }).catch(() => {});
    console.error(`Gagal menyimpan salinan konten ${name}: ${String((error as { code?: unknown }).code ?? "")}`.trim());
  }
}

async function loadSnapshot<T>(name: string): Promise<T | null> {
  try {
    const raw = JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ SNAPSHOT_DIR, `${name}.json`), "utf8"));
    return raw?.v === SNAPSHOT_VERSION ? (raw.data as T) : null;
  } catch {
    return null;
  }
}

// Semua data database untuk halaman publik dibaca lewat fungsi ini. Database dibaca dengan batas waktu; kalau gagal
// dipakai salinan terakhir, lalu konten kode. Tidak pernah melempar galat, jadi halaman tetap 200. Yang dicatat hanya
// nama dan kode galat, karena pesan galat Prisma bisa memuat isi data.
// name menjadi nama berkas salinan, jadi harus unik dan tetap. Hasil fromDb harus selamat lewat JSON (tanpa Date,
// Decimal, atau BigInt) dan bentuknya sama dengan hasil builtIn. Satu query gagal berarti seluruh pembacaan gagal,
// supaya satu kelompok data tidak mencampur isi database dengan konten kode.
// Halaman yang memakainya wajib merender <PenandaKonten sumber={[...]} /> dengan sumber dari tiap hasil.
export async function readLanding<T extends object>(name: string, fromDb: () => Promise<T>, builtIn: () => T): Promise<T & { sumber: Sumber }> {
  // Build image berjalan tanpa DATABASE_URL.
  if (!process.env.DATABASE_URL) return { ...builtIn(), sumber: "bawaan" };
  try {
    const data = await withTimeout(fromDb(), DB_TIMEOUT_MS);
    void saveSnapshot(name, data);
    return { ...data, sumber: "db" };
  } catch (error) {
    const { name: errorName, code, cause } = (error ?? {}) as { name?: unknown; code?: unknown; cause?: { code?: unknown; kind?: unknown } };
    const detail = code ?? cause?.code ?? cause?.kind ?? "";
    const snapshot = await loadSnapshot<T>(name);
    console.error(
      `Landing memakai ${snapshot ? "salinan terakhir" : "konten bawaan"}, gagal membaca ${name}: ${String(errorName ?? "Error")} ${String(detail)}`.trim(),
    );
    return snapshot ? { ...snapshot, sumber: "salinan" } : { ...builtIn(), sumber: "bawaan" };
  }
}

const text = (value: string | null | undefined) => value?.trim() || null;

// Kolom gambar menerima path di situs ini atau URL https; selain itu diabaikan.
const imageSrc = (value: string | null | undefined) => {
  const src = value?.trim();
  return src && /^(\/(?!\/)|https:\/\/[^/])[^\s\\]*$/.test(src) ? src : null;
};

const httpsUrl = (value: string | null | undefined) => {
  const url = value?.trim();
  return url && /^https:\/\/[^\s\\]+$/i.test(url) ? url : null;
};

const BY_ORDER: [{ sortIndex: "asc" }, { id: "asc" }] = [{ sortIndex: "asc" }, { id: "asc" }];

function toLandingKantor(row: KantorSetting | null): LandingKantor {
  const f = FALLBACK.kantor;
  // Tanpa baris Setting Kantor semua link dan nomor cadangan dipakai; kalau baris ada, link atau WhatsApp 2 yang
  // kosong berarti sengaja disembunyikan.
  const social = (value: string | null | undefined, fallback: string | null) => (row ? httpsUrl(value) : fallback);
  const whatsapp = waNumber(row?.whatsapp) ?? waNumber(f.whatsapp) ?? WHATSAPP_NUMBER;
  const whatsapp2 = waNumber(row ? row.whatsapp2 : f.whatsapp2);
  const maps = text(row?.googleMapsUrl);

  return {
    companyName: text(row?.companyName) ?? f.companyName,
    address: text(row?.address) ?? f.address,
    whatsapp,
    whatsappDisplay: formatWhatsapp(whatsapp),
    whatsapp2,
    whatsapp2Display: whatsapp2 && formatWhatsapp(whatsapp2),
    email: text(row?.email) ?? f.email,
    socials: {
      instagram: social(row?.instagramUrl, f.instagramUrl),
      youtube: social(row?.youtubeUrl, f.youtubeUrl),
      facebook: social(row?.facebookUrl, f.facebookUrl),
      tiktok: social(row?.tiktokUrl, f.tiktokUrl),
    },
    // Dipakai sebagai src iframe, jadi hanya link Google Maps yang diterima.
    googleMapsUrl: maps && maps.startsWith(MAPS_PREFIX) && !/\s/.test(maps) ? maps : f.googleMapsUrl,
    description: text(row?.description) ?? f.description,
    aboutUs: (text(row?.aboutUs) ?? f.aboutUs)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    foundedYear: row?.foundedYear ?? f.foundedYear,
  };
}

// Data kantor dari konten kode, tanpa menyentuh database. Dipakai halaman 404 supaya tetap tampil saat database mati
// atau lambat.
export const KANTOR_CADANGAN: LandingKantor = toLandingKantor(null);

export const getLandingKantor = cache(
  (): Promise<LandingKantor & { sumber: Sumber }> =>
    readLanding(
      "kantor",
      async () => toLandingKantor(await prisma.kantorSetting.findUnique({ where: { id: 1 } })),
      () => toLandingKantor(null),
    ),
);

const counted = (value: number): Angka => ({ value, text: formatRibuan(value) });
const manual = (value: number): Angka => ({ value, text: `${formatRibuan(value)}+` });

type StatRow = Pick<KantorSetting, "foundedYear" | "statEvents" | "statClients" | "statMembers">;
type Counts = { events: number; eventRows: number; clients: number; klienRows: number; crews: number };

// Angka yang diisi di Setting Kantor tampil dengan "+". Yang dikosongkan dihitung dari baris aktif tabelnya, dan tabel
// yang belum punya baris memakai jumlah di konten kode, sama seperti daftar yang tampil di halaman.
function toAngka(row: StatRow | null, counts: Counts | null): Omit<LandingAngka, "years"> {
  const f = FALLBACK.kantor;
  const angka = (stat: number | null, count: number) => (stat != null ? manual(stat) : counted(count));
  return {
    foundedYear: row?.foundedYear ?? f.foundedYear,
    events: angka(row ? row.statEvents : f.statEvents, counts?.eventRows ? counts.events : FALLBACK.events.length),
    clients: angka(row ? row.statClients : f.statClients, counts?.klienRows ? counts.clients : FALLBACK.klien.length),
    members: row?.statMembers == null && counts?.crews ? counted(counts.crews) : manual(row?.statMembers ?? f.statMembers),
  };
}

// Sumber semua angka di situs: pita hero, tombol "Lihat semua N event", judul bagian Klien, dan teks di halaman lain.
export const getLandingAngka = cache(async (): Promise<LandingAngka & { sumber: Sumber }> => {
  const data = await readLanding(
    "angka",
    async () => {
      const active = { where: { active: true } };
      const [row, events, eventRows, clients, klienRows, crews] = await Promise.all([
        prisma.kantorSetting.findUnique({
          where: { id: 1 },
          select: { foundedYear: true, statEvents: true, statClients: true, statMembers: true },
        }),
        prisma.event.count(active),
        prisma.event.count(),
        prisma.klien.count(active),
        prisma.klien.count(),
        prisma.crew.count(active),
      ]);
      return toAngka(row, { events, eventRows, clients, klienRows, crews });
    },
    () => toAngka(null, null),
  );
  // Dihitung saat render dan tidak ikut salinan, supaya tetap benar kalau salinan lama dipakai melewati pergantian tahun.
  return { ...data, years: counted(Math.max(0, Number(wibDate().slice(0, 4)) - data.foundedYear)) };
});

function toLandingHero(row: { image: string; title: string | null; caption: string | null } | null): LandingHero {
  const image = imageSrc(row?.image);
  if (!image) return FALLBACK.hero;
  const title = text(row?.title);
  const caption = text(row?.caption);
  // alt selalu terisi. Halaman yang juga menampilkan title atau caption di dekat gambar boleh mengosongkan alt-nya
  // sendiri supaya teks yang sama tidak dibacakan dua kali.
  const alt = image === FALLBACK.hero.image ? FALLBACK.hero.alt : (caption ?? title ?? "Dokumentasi acara D'Production");
  return { image, title, caption, alt };
}

// Head Home: baris aktif pertama menurut urutan.
export const getLandingHero = cache(
  (): Promise<LandingHero & { sumber: Sumber }> =>
    readLanding(
      "hero",
      async () =>
        toLandingHero(
          await prisma.headHome.findFirst({
            where: { active: true },
            orderBy: BY_ORDER,
            select: { image: true, title: true, caption: true },
          }),
        ),
      () => FALLBACK.hero,
    ),
);

type EventRow = Pick<EventEntry, "name" | "client" | "year" | "featured"> & { photo?: string | null; description?: string | null };

function toLandingEvents(rows: EventRow[]): LandingEvents {
  const byYear: LandingEvents["byYear"] = [];
  for (const e of rows) {
    const entry = { name: e.name, client: text(e.client) };
    const group = byYear.find((g) => g.year === e.year);
    if (group) group.events.push(entry);
    else byYear.push({ year: e.year, label: e.year?.toString() ?? "Tahun belum dicatat", events: [entry] });
  }
  return {
    byYear,
    masterpieces: rows.flatMap((e) => {
      const photo = e.featured ? imageSrc(e.photo) : null;
      return photo ? [{ name: e.name, client: text(e.client), year: e.year, photo, description: text(e.description) }] : [];
    }),
  };
}

// Master Event. Konten kode hanya menggantikan tabel yang belum punya baris sama sekali: tabel yang berisi tetapi semua
// barisnya disembunyikan admin tetap tampil kosong. Aturan yang sama berlaku untuk pembaca lain di bawah.
export const getLandingEvents = cache(
  (): Promise<LandingEvents & { sumber: Sumber }> =>
    readLanding(
      "event",
      async () => {
        const rows = await prisma.event.findMany({
          where: { active: true },
          orderBy: [{ year: { sort: "desc", nulls: "last" } }, { id: "asc" }],
          select: { name: true, client: true, year: true, featured: true, photo: true, description: true },
        });
        return toLandingEvents(rows.length || (await prisma.event.count()) ? rows : FALLBACK.events);
      },
      () => toLandingEvents(FALLBACK.events),
    ),
);

function toLandingKlien(rows: { name: string; logo: string | null }[]): LandingKlien {
  return {
    logos: rows.flatMap((k) => {
      const logo = imageSrc(k.logo);
      return logo ? [{ name: k.name, logo }] : [];
    }),
  };
}

// Pita logo. Kueri sengaja hanya memilih name dan logo: kolom address dan phone di tabel Klien memuat kontak narahubung
// dan tidak boleh sampai ke halaman publik.
export const getLandingKlien = cache(
  (): Promise<LandingKlien & { sumber: Sumber }> =>
    readLanding(
      "klien",
      async () => {
        const rows = await prisma.klien.findMany({
          where: { active: true, logo: { not: null } },
          orderBy: { id: "asc" },
          select: { name: true, logo: true },
        });
        return toLandingKlien(rows.length || (await prisma.klien.count()) ? rows : FALLBACK.klien);
      },
      () => toLandingKlien(FALLBACK.klien),
    ),
);

const RENTAL_ARGS = {
  orderBy: BY_ORDER,
  select: { name: true, price: true, unit: true, priceFrom: true, priceHidden: true, extraPrices: true, photo: true },
} satisfies Prisma.RentalFindManyArgs;

type RentalRow = Pick<RentalEntry, "name" | "price" | "unit" | "priceFrom" | "priceHidden"> & {
  extraPrices?: unknown;
  photo?: string | null;
};

// extraPrices berupa JSON di tabel, jadi bentuknya diperiksa lagi di sini. Butir yang tidak sah dilewati.
const toExtraPrice = (value: unknown) => {
  const { amount, unit } = (value ?? {}) as { amount?: unknown; unit?: unknown };
  return typeof amount === "number" && Number.isSafeInteger(amount) && amount > 0
    ? [{ amount, unit: typeof unit === "string" ? text(unit) : null }]
    : [];
};

// Satu-satunya jalan item katalog menuju halaman. Kalau harga disembunyikan atau kosong, nominal utama dan harga
// tambahannya dibuang di sini, sebelum hasilnya disalin atau dirender.
function toKatalogItem(r: RentalRow): KatalogItem {
  const prices =
    r.priceHidden || !r.price
      ? []
      : [{ amount: r.price, unit: text(r.unit) }, ...(Array.isArray(r.extraPrices) ? r.extraPrices.flatMap(toExtraPrice) : [])];
  return { name: r.name, photo: imageSrc(r.photo), prices, priceFrom: prices.length > 0 && !!r.priceFrom };
}

// loose = item aktif tanpa kategori. Tetap ditampilkan di kelompok "Lainnya" supaya item yang ditandai tampil tidak
// hilang diam-diam. Kategori tanpa item aktif tidak ikut.
function toLandingKatalog(categories: { name: string; description: string | null; rentals: RentalRow[] }[], loose: RentalRow[]): LandingKatalog {
  const taken = new Set<string>();
  return {
    categories: [...categories, { name: "Lainnya", description: null, rentals: loose }]
      .filter((c) => c.rentals.length)
      .map((c) => {
        const base = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "kategori";
        let slug = base;
        for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
        taken.add(slug);
        return { name: c.name, slug, description: text(c.description), items: c.rentals.map(toKatalogItem) };
      }),
  };
}

const builtInKatalog = () =>
  toLandingKatalog(
    FALLBACK.rentalCategories.map((c) => ({ ...c, rentals: FALLBACK.rentals.filter((r) => r.category === c.name) })),
    [],
  );

// Katalog harga: kategori aktif berurutan, masing-masing dengan item aktifnya.
export const getLandingKatalog = cache(
  (): Promise<LandingKatalog & { sumber: Sumber }> =>
    readLanding(
      "katalog",
      async () => {
        const [categories, loose] = await Promise.all([
          prisma.rentalCategory.findMany({
            where: { active: true },
            orderBy: BY_ORDER,
            select: { name: true, description: true, rentals: { where: { active: true }, ...RENTAL_ARGS } },
          }),
          prisma.rental.findMany({ where: { active: true, categoryId: null }, ...RENTAL_ARGS }),
        ]);
        const filled = loose.length || categories.some((c) => c.rentals.length) || (await prisma.rental.count());
        return filled ? toLandingKatalog(categories, loose) : builtInKatalog();
      },
      builtInKatalog,
    ),
);

export type KatalogCuplikan = KatalogItem & { category: string };

// Empat kartu harga untuk Beranda, dari data katalog yang sama. Item di FALLBACK.cuplikanKatalog didahulukan, sisanya
// diisi item lain menurut urutan katalog dengan yang berfoto lebih dulu.
export const getLandingKatalogCuplikan = cache(async (): Promise<{ items: KatalogCuplikan[]; sumber: Sumber }> => {
  const { categories, sumber } = await getLandingKatalog();
  const all = categories.flatMap((c) => c.items.map((item) => ({ ...item, category: c.name })));
  const chosen = FALLBACK.cuplikanKatalog.flatMap((name) => all.find((item) => item.name === name) ?? []);
  const rest = all.filter((item) => !chosen.includes(item));
  return { items: [...chosen, ...rest.filter((item) => item.photo), ...rest.filter((item) => !item.photo)].slice(0, 4), sumber };
});

// rows null berarti tabel Master Wedding belum punya baris.
function toLandingWedding(rows: { name: string; description: string | null; photo: string | null }[] | null): LandingWedding {
  const photo = rows?.map((w) => ({ src: imageSrc(w.photo), name: w.name })).find((w) => w.src);
  return {
    points: rows
      ? rows.map((w) => ({ name: w.name, description: text(w.description) }))
      : FALLBACK.weddingPoints.map((name) => ({ name, description: null })),
    // Foto cadangan memakai alt deskriptifnya, juga kalau foto yang sama dipasang lewat Master Wedding.
    photo:
      photo?.src && photo.src !== FALLBACK.weddingPhoto.src
        ? { src: photo.src, alt: `Dokumentasi layanan Wedding Planner, ${photo.name}` }
        : FALLBACK.weddingPhoto,
  };
}

// Layanan pernikahan dari Master Wedding: poin layanan dan satu foto (baris aktif pertama yang berfoto).
export const getLandingWedding = cache(
  (): Promise<LandingWedding & { sumber: Sumber }> =>
    readLanding(
      "pernikahan",
      async () => {
        const rows = await prisma.wedding.findMany({
          where: { active: true },
          orderBy: { id: "asc" },
          select: { name: true, description: true, photo: true },
        });
        return toLandingWedding(rows.length || (await prisma.wedding.count()) ? rows : null);
      },
      () => toLandingWedding(null),
    ),
);

// Galeri foto (foto aktif di album aktif) dan video YouTube. Video tidak punya konten kode: tanpa video aktif yang
// valid daftarnya kosong.
export const getLandingGaleri = cache(
  (): Promise<LandingGaleri & { sumber: Sumber }> =>
    readLanding(
      "galeri",
      async () => {
        const [photos, videos] = await Promise.all([
          prisma.galeriFoto.findMany({
            where: { active: true, album: { active: true } },
            orderBy: BY_ORDER,
            select: { image: true, caption: true, album: { select: { name: true } } },
          }),
          prisma.galeriVideo.findMany({ where: { active: true }, orderBy: BY_ORDER, select: { url: true, title: true } }),
        ]);
        return {
          photos:
            photos.length || (await prisma.galeriFoto.count())
              ? photos.flatMap((p) => {
                  const image = imageSrc(p.image);
                  return image ? [{ image, album: p.album.name, caption: text(p.caption) }] : [];
                })
              : FALLBACK.photos,
          videos: videos.flatMap((v) => {
            const id = youtubeId(v.url);
            return id ? [{ id, title: text(v.title) ?? "Video YouTube D'Production" }] : [];
          }),
        };
      },
      () => ({ photos: FALLBACK.photos, videos: [] }),
    ),
);
