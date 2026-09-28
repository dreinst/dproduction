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
    statClients: 17,
    statEvents: 47,
    statRentalCategories: 4,
    statMembers: 179,
    statYears: 10,
  },
  hero: {
    image: "/assets/portfolio/temres-magelang-jeep-warna.jpg",
    title: "Corporate Event",
    caption: "Jeep adventure peserta Temu Responden Bank Indonesia di Magelang.",
    alt: "Iring-iringan jeep dengan asap warna-warni di acara Temu Responden Bank Indonesia, Magelang",
  },
  // Semua event yang pernah ditangani (portofolio resmi, dokumentasi Drive, dan daftar situs lama), tahun terbaru dulu.
  // featured = event terbesar dari sisi skala, tampil sebagai kartu berfoto di Masterpiece.
  events: [
    { name: "Peresmian Gedung Ekstensi PT. Ustegra", client: "PT. Ustegra", year: 2026, featured: true,
      photo: "/assets/portfolio/ustegra-perayaan-karyawan.jpg",
      description: "Seremoni peresmian gedung pabrik baru PT. Ustegra Malang pada 24 Agustus 2026, dari tur pabrik bersama tamu VIP hingga perayaan bersama ratusan karyawan." },
    { name: "Temu Responden Bank Indonesia (Magelang)", client: "KPw Bank Indonesia Malang", year: 2026, featured: true,
      photo: "/assets/portfolio/temres-magelang-drone-silancur.jpg",
      description: "Empat hari evaluasi surveyor KPw Bank Indonesia Malang di Magelang, dengan jeep adventure, kunjungan wisata, dan gala dinner bertema." },
    { name: "MS Glow Run Malang Half Marathon", client: "MS Glow", year: 2026, featured: true,
      photo: "/assets/portfolio/half-marathon-flag-off.jpg",
      description: "Lomba lari half marathon di Kota Malang, dari flag off subuh, rute kota, sampai race village di garis finish." },
    { name: "Emba JetBus Run Malang 10K", client: "Emba", year: 2026 },
    { name: "Smartfren Fun Run Malang", client: "Smartfren", year: 2026 },
    { name: "Program Hebitren Bank Indonesia (Bandung)", client: "KPw Bank Indonesia Kalimantan Barat", year: 2026 },
    { name: "Program Hebitren Bank Indonesia (Yogyakarta)", client: "Bank Indonesia", year: 2026 },
    { name: "Gathering 10 Tahun Aice Malang", client: "Aice", year: 2026 },
    { name: "Serambi Bank Indonesia Malang dan Pasuruan", client: "Bank Indonesia", year: 2026 },
    { name: "Pasar Santri Sidogiri", client: "Bank Indonesia", year: 2026 },
    { name: "Wedding di Ijen Suites Malang", client: null, year: 2026 },
    { name: "Pekan QRIS Nasional dan QRIS Jelajah Indonesia", client: "KPw Bank Indonesia Malang", year: 2025, featured: true,
      photo: "/assets/portfolio/qris-jelajah-indonesia-coban-rondo.jpg",
      description: "Rangkaian Pekan QRIS Nasional bersama QRIS Jelajah Indonesia, termasuk perjalanan peserta ke Coban Rondo." },
    { name: "Emba Run Malang 10K", client: "Emba", year: 2025, featured: true,
      photo: "/assets/portfolio/emba-run-finish.jpg",
      description: "Lomba lari 10K di Malang, dari persiapan rute sampai perayaan pelari dan sponsor di garis finish." },
    { name: "Gathering Bank Indonesia Kalimantan Barat di Bromo", client: "KPw Bank Indonesia Kalimantan Barat", year: 2025 },
    { name: "Temu Responden Bank Indonesia Malang", client: "KPw Bank Indonesia Malang", year: 2025 },
    { name: "Starlink BRI Bromo", client: "BRI", year: 2025 },
    { name: "Employee Gathering Cuddle Me 2025", client: "Cuddle Me", year: 2025 },
    { name: "BINS Goes To Campus", client: null, year: 2025 },
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
    { name: "QRIS Fun Run Bank Indonesia", client: "KPw Bank Indonesia Malang", year: 2024, featured: true,
      photo: "/assets/portfolio/qris-fun-run-start.jpg",
      description: "Fun run kampanye QRIS Bank Indonesia dengan ribuan pelari, rangkaian Pekan QRIS Nasional 2024 di Malang." },
    { name: "Malang BI-Youth-Tiful Festival", client: "Bank Indonesia", year: 2024 },
    { name: "Employee Excellence Award G4S", client: "G4S", year: 2024 },
    { name: "Pesta Demokrasi KPU Kab. Malang", client: "KPU Kab. Malang", year: 2024 },
    { name: "Gebyar QRIS Ngalam Bank Indonesia", client: "Bank Indonesia", year: 2023 },
    { name: "HUT Prov. Jawa Timur Ke-78", client: "Pemerintah Provinsi Jawa Timur", year: 2023 },
    { name: "Digifest BI Ngalam 2023", client: "KPw Bank Indonesia Malang", year: 2023 },
    { name: "Kemenkeu Goes To Bromo", client: "Kementerian Keuangan", year: null },
    { name: "Sekartaji Bank Indonesia", client: "Bank Indonesia", year: null },
    { name: "Rupiah Championship", client: "Bank Indonesia", year: null },
  ] as EventEntry[],
  weddingPoints: ["Konsep & Tema", "Dekorasi Premium", "Manajemen Vendor", "Koordinasi Hari-H"],
  weddingPhoto: { src: "/assets/portfolio/wedding-ijen-suites.jpg", alt: "Dokumentasi pernikahan di Ijen Suites Malang" },
  rentals: [
    { name: "Tenda Premium", price: 200000, unit: "hari" },
    { name: "Sound System Pro", price: 1000000, unit: "hari" },
    { name: "Lighting Stage", price: 500000, unit: "hari" },
    { name: "Kursi & Meja", price: null, unit: "hari" },
  ] as { name: string; price: number | null; unit: string | null }[],
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
  rentals: typeof FALLBACK.rentals;
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

function toLandingKantor(row: KantorSetting | null): LandingKantor {
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
    stats: {
      clients: row?.statClients ?? f.statClients,
      events: row?.statEvents ?? f.statEvents,
      rentalCategories: row?.statRentalCategories ?? f.statRentalCategories,
      members: row?.statMembers ?? f.statMembers,
      years: row?.statYears ?? f.statYears,
    },
  };
}

export const getLandingKantor = cache(async (): Promise<LandingKantor> => {
  const row = await query("Setting Kantor", () => prisma.kantorSetting.findUnique({ where: { id: 1 } }));
  return toLandingKantor(row);
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
        orderBy: { id: "asc" },
        select: { name: true, price: true, unit: true },
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
    rentals: rentals?.length ? rentals : FALLBACK.rentals,
    photos: dbPhotos.length ? dbPhotos : FALLBACK.photos,
    // Video tidak punya cadangan: baris video hanya tampil kalau ada video aktif yang valid.
    videos: (videos ?? []).flatMap((v) => {
      const id = youtubeId(v.url);
      return id ? [{ id, title: text(v.title) ?? "Video YouTube D'Production" }] : [];
    }),
  };
});
