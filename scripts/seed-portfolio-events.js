const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 10 event resmi dari dokumen "Portofolio D'Pro 2026 Presentation" (PDF diberikan Donny,
// 2026-09-20). Ini daftar portofolio resmi perusahaan, terpisah dari 4 event yang
// didokumentasikan lewat foto Google Drive (BI Hebitren Bandung/Jogja, Temres Magelang,
// Peresmian Gedung PT. Ustegra) -- belum ada foto asli untuk 10 event ini.
const officialPortfolio = [
  { name: "Gebyar QRIS Ngalam Bank Indonesia", year: 2023 },
  { name: "HUT Prov. Jawa Timur Ke-78", year: 2023 },
  { name: "Malang BI-Youth-Tiful Festival", year: 2024 },
  { name: "Employee Excellence Award G4S", year: 2024 },
  { name: "QRIS Fun Run Bank Indonesia", year: 2024 },
  { name: "Pesta Demokrasi KPU Kab. Malang", year: 2024 },
  { name: "Emba Run Malang 10K", year: 2025 },
  { name: "Emba JetBus Run Malang 10K", year: 2026 },
  { name: "MS Glow Run Malang Half Marathon", year: 2026 },
  { name: "Smartfren Fun Run Malang", year: 2026 },
];

// 4 event yang sudah didokumentasikan dengan foto asli (diunduh dari Google Drive,
// 2026-09-20), dicatat di database walau tidak lagi ditampilkan di section Masterpiece
// pada landing page.
const documentedEvents = [
  {
    name: "Program Hebitren Bank Indonesia — Bandung",
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Bandung selama 5 hari, termasuk kunjungan ke Masjid Raya Al Jabbar.",
    photo: "/assets/portfolio/hebitren-bandung-masjid.jpg",
    year: 2026,
  },
  {
    name: "Program Hebitren Bank Indonesia — Yogyakarta",
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Yogyakarta selama 4 hari.",
    photo: "/assets/portfolio/hebitren-jogja-bandara.jpg",
    year: 2026,
  },
  {
    name: "Temu Responden Bank Indonesia — Magelang",
    description: "Gala dinner malam puncak Temu Responden Bank Indonesia di Magelang dengan panggung taman bertema dan live music.",
    photo: "/assets/portfolio/temres-magelang-gala-malam.jpg",
    year: 2026,
  },
  {
    name: "Peresmian Gedung Ekstensi PT. Ustegra",
    description: "Seremoni peresmian gedung pabrik baru PT. Ustegra Malang pada 24 Agustus 2026, dari tur pabrik bersama tamu VIP hingga hiburan live band.",
    photo: "/assets/portfolio/ustegra-peresmian-aerial.jpg",
    year: 2026,
  },
];

(async () => {
  let created = 0, skipped = 0;
  for (const ev of [...officialPortfolio, ...documentedEvents]) {
    const existing = await prisma.event.findFirst({ where: { name: ev.name } });
    if (existing) { skipped++; continue; }
    await prisma.event.create({
      data: {
        name: ev.name,
        description: ev.description ?? null,
        photo: ev.photo ?? null,
        year: ev.year,
        active: true,
      },
    });
    created++;
  }
  console.log(`Selesai: ${created} event baru dibuat, ${skipped} sudah ada (dilewati).`);
  const total = await prisma.event.count();
  console.log(`Total baris di tabel Event sekarang: ${total}`);
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
