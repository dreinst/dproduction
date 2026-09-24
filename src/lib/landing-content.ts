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
    image: "/assets/portfolio/temres-magelang-gala-malam.jpg",
    title: "Corporate Event",
    caption: "Gathering sukses bersama 500+ peserta dari Bank Indonesia.",
    alt: "Gala malam Temu Responden Bank Indonesia di Magelang",
  },
  // Portofolio resmi dari dokumen "Portofolio D'Pro 2026 Presentation", tahun terbaru dulu.
  masterpieces: [
    { name: "Emba JetBus Run Malang 10K", year: 2026 },
    { name: "MS Glow Run Malang Half Marathon", year: 2026 },
    { name: "Smartfren Fun Run Malang", year: 2026 },
    { name: "Emba Run Malang 10K", year: 2025 },
    { name: "Malang BI-Youth-Tiful Festival", year: 2024 },
    { name: "Employee Excellence Award G4S", year: 2024 },
    { name: "QRIS Fun Run Bank Indonesia", year: 2024 },
    { name: "Pesta Demokrasi KPU Kab. Malang", year: 2024 },
    { name: "Gebyar QRIS Ngalam Bank Indonesia", year: 2023 },
    { name: "HUT Prov. Jawa Timur Ke-78", year: 2023 },
  ] as { name: string; year: number | null }[],
  weddingPoints: ["Konsep & Tema", "Dekorasi Premium", "Manajemen Vendor", "Koordinasi Hari-H"],
  // Belum ada foto pernikahan asli, jadi alt menyebut isi foto apa adanya.
  weddingPhoto: { src: "/assets/hero img 6.jpg", alt: "Panggung acara QRIS Fun Run Bank Indonesia" },
  rentals: [
    { name: "Tenda Premium", price: 200000, unit: "hari" },
    { name: "Sound System Pro", price: 1000000, unit: "hari" },
    { name: "Lighting Stage", price: 500000, unit: "hari" },
    { name: "Kursi & Meja", price: null, unit: "hari" },
  ] as { name: string; price: number | null; unit: string | null }[],
  photos: [
    { image: "/assets/portfolio/hebitren-bandung-aerial-desa.jpg", album: "Hebitren BI Bandung", caption: "Dokumentasi Udara" },
    { image: "/assets/portfolio/ustegra-panggung.jpg", album: "Peresmian Ustegra", caption: "Panggung & Dekorasi" },
    { image: "/assets/portfolio/hebitren-jogja-bandara.jpg", album: "Hebitren BI Jogja", caption: "Penjemputan Peserta" },
    { image: "/assets/portfolio/temres-magelang-penjemputan.jpg", album: "Temres BI Magelang", caption: "Kedatangan Peserta" },
    { image: "/assets/portfolio/ustegra-tur-vip.jpg", album: "Peresmian Ustegra", caption: "Tur Tamu VIP" },
    { image: "/assets/portfolio/hebitren-jogja-kunjungan-tani.jpg", album: "Hebitren BI Jogja", caption: "Kunjungan Lapangan" },
    { image: "/assets/portfolio/temres-magelang-gedung-bi.jpg", album: "Temres BI Magelang", caption: "Dokumentasi Udara" },
    { image: "/assets/portfolio/ustegra-pabrik-aerial.jpg", album: "Peresmian Ustegra", caption: "Dokumentasi Udara" },
    { image: "/assets/portfolio/temres-magelang-santai.jpg", album: "Temres BI Magelang", caption: "Momen Santai Peserta" },
  ] as { image: string; album: string; caption: string | null }[],
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
  masterpieces: typeof FALLBACK.masterpieces;
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
        select: { name: true, year: true },
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

  return {
    hero,
    masterpieces: events?.length ? events : FALLBACK.masterpieces,
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
