import prisma from '../src/lib/prisma'
import { assertLocalDatabase } from './assert-local-db'

type PortfolioEvent = {
  name: string
  year: number
  description?: string
  photo?: string
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
const documentedEvents: PortfolioEvent[] = [
  {
    name: "Program Hebitren Bank Indonesia (Bandung)",
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Bandung selama 5 hari, termasuk kunjungan ke Masjid Raya Al Jabbar.",
    photo: "/assets/portfolio/hebitren-bandung-masjid.jpg",
    year: 2026,
  },
  {
    name: "Program Hebitren Bank Indonesia (Yogyakarta)",
    description: "Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Yogyakarta selama 4 hari.",
    photo: "/assets/portfolio/hebitren-jogja-bandara.jpg",
    year: 2026,
  },
  {
    name: "Temu Responden Bank Indonesia (Magelang)",
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

  // Event tidak punya kunci tetap (nama bisa diganti di dashboard), jadi hanya tabel yang benar-benar kosong yang diisi.
  const rows = await prisma.event.count()
  if (rows) {
    const active = await prisma.event.count({ where: { deletedAt: null } })
    console.log(`Dilewati: tabel Event sudah berisi ${rows} baris (${active} belum dihapus). Kelola event lewat dashboard.`)
    return
  }

  const { count } = await prisma.event.createMany({ data: [...officialPortfolio, ...documentedEvents] })
  console.log(`Selesai: ${count} event dibuat di tabel Event yang sebelumnya kosong.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
