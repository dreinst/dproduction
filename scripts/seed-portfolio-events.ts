import prisma from '../src/lib/prisma'
import { assertLocalDatabase } from './assert-local-db'

type PortfolioEvent = {
  name: string
  year: number
  description?: string
  photo?: string
  oldNames?: string[]
}

// 10 event resmi dari dokumen "Portofolio D'Pro 2026 Presentation" (PDF dari Donny, 2026-09-20).
const officialPortfolio: PortfolioEvent[] = [
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
]

// 4 event dengan foto asli dari Google Drive, dicatat di database walau tidak tampil di Masterpiece.
// oldNames berisi nama lama (dengan em-dash) supaya baris yang sudah ada tidak dibuat ulang.
const documentedEvents: PortfolioEvent[] = [
  {
    name: "Program Hebitren Bank Indonesia (Bandung)",
    oldNames: ["Program Hebitren Bank Indonesia \u2014 Bandung"],
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Bandung selama 5 hari, termasuk kunjungan ke Masjid Raya Al Jabbar.",
    photo: "/assets/portfolio/hebitren-bandung-masjid.jpg",
    year: 2026,
  },
  {
    name: "Program Hebitren Bank Indonesia (Yogyakarta)",
    oldNames: ["Program Hebitren Bank Indonesia \u2014 Yogyakarta"],
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Yogyakarta selama 4 hari.",
    photo: "/assets/portfolio/hebitren-jogja-bandara.jpg",
    year: 2026,
  },
  {
    name: "Temu Responden Bank Indonesia (Magelang)",
    oldNames: ["Temu Responden Bank Indonesia \u2014 Magelang"],
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
]

async function main() {
  assertLocalDatabase()

  let created = 0
  let skipped = 0
  for (const ev of [...officialPortfolio, ...documentedEvents]) {
    // Baris yang sudah dihapus (soft delete) ikut dicocokkan supaya tidak muncul lagi.
    const existing = await prisma.event.findFirst({
      where: {
        OR: [
          { name: { in: [ev.name, ...(ev.oldNames ?? [])] } },
          ...(ev.photo ? [{ photo: ev.photo }] : []),
        ],
      },
    })
    if (existing) {
      skipped++
      continue
    }
    await prisma.event.create({
      data: {
        name: ev.name,
        description: ev.description ?? null,
        photo: ev.photo ?? null,
        year: ev.year,
        active: true,
      },
    })
    created++
  }

  const total = await prisma.event.count({ where: { deletedAt: null } })
  console.log(`Selesai: ${created} event baru dibuat, ${skipped} sudah ada (dilewati).`)
  console.log(`Jumlah event yang belum dihapus di tabel Event: ${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
