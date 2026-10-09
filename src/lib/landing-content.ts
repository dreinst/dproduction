// Khusus server: konten landing dari database, dengan cadangan konten kode kalau DB kosong atau tidak bisa dijangkau.
// Jangan diimpor komponen klien kecuali lewat `import type`.
import { cache } from "react";
import type { KantorSetting } from "@prisma/client";
import prisma from "@/lib/prisma";
import { WHATSAPP_NUMBER, waNumber, youtubeId } from "@/lib/site";

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
  hero: {
    image: "/assets/portfolio/temres-magelang-jeep-warna.jpg",
    title: "Corporate Event",
    caption: "Jeep adventure peserta Temu Responden Bank Indonesia di Magelang.",
    alt: "Iring-iringan jeep dengan asap warna-warni di acara Temu Responden Bank Indonesia, Magelang",
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

export type LandingKantor = {
  companyName: string;
  address: string;
  whatsapp: string; // 62xxx untuk wa.me
  whatsappDisplay: string; // +62 819 3893 8800
  email: string;
  socials: { instagram: string | null; youtube: string | null; facebook: string | null; tiktok: string | null };
  googleMapsUrl: string;
  description: string;
  aboutUs: string[];
  foundedYear: number;
  stats: { clients: number; events: number; rentalCategories: number; members: number; years: number };
};

export type LandingContent = {
  hero: { image: string; title: string | null; caption: string | null; alt: string };
  masterpieces: { name: string; client: string | null; year: number | null; photo: string; description: string | null }[];
  eventList: { name: string; client: string | null; year: number | null }[];
  wedding: { points: string[]; photo: { src: string; alt: string } };
  rentals: { name: string; price: number | null; unit: string | null; priceFrom: boolean }[];
  photos: typeof FALLBACK.photos;
  videos: { id: string; title: string }[];
};

// Hanya nama dan kode error yang dicatat, karena pesan error Prisma bisa memuat isi data.
async function query<T>(label: string, run: () => Promise<T>): Promise<T | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await run();
  } catch (error) {
    const { name, code, cause } = (error ?? {}) as { name?: unknown; code?: unknown; cause?: { code?: unknown; kind?: unknown } };
    const detail = code ?? cause?.code ?? cause?.kind ?? "";
    console.error(`Landing memakai konten cadangan, gagal membaca ${label}: ${String(name ?? "Error")} ${String(detail)}`.trim());
    return null;
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

function formatWhatsapp(number: string) {
  const rest = number.slice(2);
  return `+62 ${rest.slice(0, 3)} ${rest.slice(3, 7)} ${rest.slice(7)}`.trim();
}

type Counts = { events: number | null; clients: number | null; crews: number | null };

function toLandingKantor(row: KantorSetting | null, counts?: Counts): LandingKantor {
  const f = FALLBACK.kantor;
  // Tanpa baris Setting Kantor semua link cadangan dipakai; kalau baris ada, link kosong berarti ikonnya disembunyikan.
  const social = (value: string | null | undefined, fallback: string | null) => (row ? httpsUrl(value) : fallback);
  const whatsapp = waNumber(row?.whatsapp) ?? waNumber(f.whatsapp) ?? WHATSAPP_NUMBER;
  const maps = text(row?.googleMapsUrl);

  return {
    companyName: text(row?.companyName) ?? f.companyName,
    address: text(row?.address) ?? f.address,
    whatsapp,
    whatsappDisplay: formatWhatsapp(whatsapp),
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
    // Angka yang dikosongkan di Setting Kantor dihitung dari baris aktif tabelnya. Tabel yang kosong atau tidak terbaca
    // memakai konten cadangan, sama seperti daftar yang tampil di halaman.
    stats: {
      clients: row?.statClients ?? (counts?.clients || FALLBACK.klien.length),
      events: row?.statEvents ?? (counts?.events || FALLBACK.events.length),
      rentalCategories: row?.statRentalCategories ?? f.statRentalCategories,
      members: row?.statMembers ?? (counts?.crews || f.statMembers),
      years: row?.statYears ?? f.statYears,
    },
  };
}

// Data kantor dari konten kode, tanpa menyentuh database. Dipakai halaman 404 supaya tetap tampil saat database mati
// atau lambat.
export const KANTOR_CADANGAN: LandingKantor = toLandingKantor(null);

export const getLandingKantor = cache(async (): Promise<LandingKantor> => {
  const active = { where: { active: true } };
  const [row, events, clients, crews] = await Promise.all([
    query("Setting Kantor", () => prisma.kantorSetting.findUnique({ where: { id: 1 } })),
    query("jumlah Master Event", () => prisma.event.count(active)),
    query("jumlah Master Klien", () => prisma.klien.count(active)),
    query("jumlah Crew", () => prisma.crew.count(active)),
  ]);
  return toLandingKantor(row, { events, clients, crews });
});

export const getLandingContent = cache(async (): Promise<LandingContent> => {
  const [heroRow, events, weddings, rentals, photos, videos] = await Promise.all([
    query("Head Home", () =>
      prisma.headHome.findFirst({
        where: { active: true },
        orderBy: [{ sortIndex: "asc" }, { id: "asc" }],
        select: { image: true, title: true, caption: true },
      }),
    ),
    query("Master Event", () =>
      prisma.event.findMany({
        where: { active: true },
        orderBy: [{ year: { sort: "desc", nulls: "last" } }, { id: "asc" }],
        select: { name: true, client: true, year: true, featured: true, photo: true, description: true },
      }),
    ),
    query("Master Wedding", () =>
      prisma.wedding.findMany({ where: { active: true }, orderBy: { id: "asc" }, select: { name: true, photo: true } }),
    ),
    query("Master Rental", () =>
      prisma.rental.findMany({
        where: { active: true },
        orderBy: [{ sortIndex: "asc" }, { id: "asc" }],
        select: { name: true, price: true, unit: true, priceFrom: true, priceHidden: true },
      }),
    ),
    query("Galeri Foto", () =>
      prisma.galeriFoto.findMany({
        where: { active: true, album: { active: true } },
        orderBy: [{ sortIndex: "asc" }, { id: "asc" }],
        select: { image: true, caption: true, album: { select: { name: true } } },
      }),
    ),
    query("Galeri Video", () =>
      prisma.galeriVideo.findMany({
        where: { active: true },
        orderBy: [{ sortIndex: "asc" }, { id: "asc" }],
        select: { url: true, title: true },
      }),
    ),
  ]);

  const heroImage = imageSrc(heroRow?.image);
  const heroTitle = text(heroRow?.title);
  const heroCaption = text(heroRow?.caption);
  // Judul dan keterangan sudah tampil di kartu di atas gambar, jadi tidak diulang di alt. Gambar cadangan memakai alt
  // deskriptifnya; gambar lain dianggap dekoratif kalau kartunya berisi teks.
  const hero = heroImage
    ? {
        image: heroImage,
        title: heroTitle,
        caption: heroCaption,
        alt:
          heroImage === FALLBACK.hero.image
            ? FALLBACK.hero.alt
            : heroTitle || heroCaption
              ? ""
              : "Dokumentasi acara D'Production",
      }
    : FALLBACK.hero;

  const weddingPhoto = weddings
    ?.map((w) => ({ src: imageSrc(w.photo), name: w.name }))
    .find((w) => w.src);

  const dbPhotos = (photos ?? []).flatMap((p) => {
    const image = imageSrc(p.image);
    return image ? [{ image, album: p.album.name, caption: text(p.caption) }] : [];
  });

  const eventRows = events?.length ? events : FALLBACK.events;
  // Masterpiece hanya event featured yang fotonya valid.
  const masterpieces = eventRows.flatMap((e) => {
    const photo = e.featured ? imageSrc(e.photo) : null;
    return photo ? [{ name: e.name, client: text(e.client), year: e.year, photo, description: text(e.description) }] : [];
  });

  return {
    hero,
    masterpieces,
    eventList: eventRows.map((e) => ({ name: e.name, client: text(e.client), year: e.year })),
    wedding: {
      points: weddings?.length ? weddings.map((w) => w.name) : FALLBACK.weddingPoints,
      photo: weddingPhoto?.src
        ? { src: weddingPhoto.src, alt: `Dokumentasi layanan Wedding Planner, ${weddingPhoto.name}` }
        : FALLBACK.weddingPhoto,
    },
    // Harga yang disembunyikan (harga lewat WhatsApp) tidak ikut dikirim ke halaman.
    rentals: (rentals?.length ? rentals : FALLBACK.rentals).map((r) => ({
      name: r.name,
      price: r.priceHidden ? null : r.price,
      unit: r.unit,
      priceFrom: r.priceFrom ?? false,
    })),
    photos: dbPhotos.length ? dbPhotos : FALLBACK.photos,
    // Video tidak punya cadangan: baris video hanya tampil kalau ada video aktif yang valid.
    videos: (videos ?? []).flatMap((v) => {
      const id = youtubeId(v.url);
      return id ? [{ id, title: text(v.title) ?? "Video YouTube D'Production" }] : [];
    }),
  };
});
