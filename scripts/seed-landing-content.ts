// Mengisi database dengan konten landing yang tampil sekarang (FALLBACK di src/lib/landing-content.ts),
// supaya tampilan tidak berubah dan konten tinggal diedit dari dashboard.
//
//   npx tsx --env-file=.env.local scripts/seed-landing-content.ts          (hanya mengisi yang kosong)
//   npx tsx --env-file=.env.local scripts/seed-landing-content.ts --awal   (juga menimpa Setting Kantor dengan data resmi
//                                                                          dan menonaktifkan 4 event dokumentasi)
//
// Database selain localhost ditolak kecuali ALLOW_REMOTE_SEED=1 (produksi, hanya dijalankan orang yang berwenang).
// Aman dijalankan berulang: tabel yang sudah berisi tidak disentuh.
import prisma from '../src/lib/prisma'
import { FALLBACK } from '../src/lib/landing-content'
import { assertLocalDatabase } from './assert-local-db'

const AWAL = process.argv.includes('--awal')

// 4 event dengan foto asli dari Google Drive. Dicatat di Master Event tetapi nonaktif, jadi tidak tampil di Masterpiece.
const DOCUMENTED_EVENTS = [
  {
    name: 'Program Hebitren Bank Indonesia (Bandung)',
    description: 'Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Bandung selama 5 hari, termasuk kunjungan ke Masjid Raya Al Jabbar.',
    photo: '/assets/portfolio/hebitren-bandung-masjid.jpg',
    year: 2026,
  },
  {
    name: 'Program Hebitren Bank Indonesia (Yogyakarta)',
    description: 'Rangkaian kunjungan lapangan program Hebitren Bank Indonesia di Yogyakarta selama 4 hari.',
    photo: '/assets/portfolio/hebitren-jogja-bandara.jpg',
    year: 2026,
  },
  {
    name: 'Temu Responden Bank Indonesia (Magelang)',
    description: 'Gala dinner malam puncak Temu Responden Bank Indonesia di Magelang dengan panggung taman bertema dan live music.',
    photo: '/assets/portfolio/temres-magelang-gala-malam.jpg',
    year: 2026,
  },
  {
    name: 'Peresmian Gedung Ekstensi PT. Ustegra',
    description: 'Seremoni peresmian gedung pabrik baru PT. Ustegra Malang pada 24 Agustus 2026, dari tur pabrik bersama tamu VIP hingga hiburan live band.',
    photo: '/assets/portfolio/ustegra-peresmian-aerial.jpg',
    year: 2026,
  },
]

// Tabel tanpa kunci tetap (nama bisa diganti di dashboard) hanya diisi kalau benar-benar kosong.
async function fillIfEmpty(table: string, count: () => Promise<number>, fill: () => Promise<number>) {
  const rows = await count()
  if (rows) {
    console.log(`${table}: dilewati, sudah berisi ${rows} baris.`)
    return
  }
  console.log(`${table}: ${await fill()} baris dibuat.`)
}

async function main() {
  assertLocalDatabase()
  const { kantor, hero, masterpieces, weddingPoints, rentals, photos } = FALLBACK

  const hasKantor = await prisma.kantorSetting.findUnique({ where: { id: 1 }, select: { id: true } })
  if (!hasKantor) {
    await prisma.kantorSetting.create({ data: { id: 1, ...kantor } })
    console.log('KantorSetting: baris id 1 dibuat dengan data resmi.')
  } else if (AWAL) {
    await prisma.kantorSetting.update({ where: { id: 1 }, data: kantor })
    console.log('KantorSetting: baris id 1 ditimpa dengan data resmi (--awal).')
  } else {
    console.log('KantorSetting: baris id 1 sudah ada, tidak diubah. Pakai --awal untuk menimpanya dengan data resmi.')
  }

  await fillIfEmpty(
    'HeadHome',
    () => prisma.headHome.count(),
    async () => {
      await prisma.headHome.create({ data: { image: hero.image, title: hero.title, caption: hero.caption, sortIndex: 0 } })
      return 1
    },
  )

  await fillIfEmpty(
    'Wedding',
    () => prisma.wedding.count(),
    async () => (await prisma.wedding.createMany({ data: weddingPoints.map((name) => ({ name })) })).count,
  )

  await fillIfEmpty(
    'Rental',
    () => prisma.rental.count(),
    async () => (await prisma.rental.createMany({ data: rentals })).count,
  )

  // Album dan foto diisi bersamaan, hanya kalau keduanya kosong.
  await fillIfEmpty(
    'GaleriAlbum dan GaleriFoto',
    async () => (await prisma.galeriAlbum.count()) + (await prisma.galeriFoto.count()),
    () =>
      prisma.$transaction(async (tx) => {
        const names = [...new Set(photos.map((p) => p.album))]
        const albums = await tx.galeriAlbum.createManyAndReturn({
          data: names.map((name, sortIndex) => ({ name, sortIndex })),
          select: { id: true, name: true },
        })
        const albumId = new Map(albums.map((a) => [a.name, a.id]))
        const { count } = await tx.galeriFoto.createMany({
          data: photos.map((p, sortIndex) => ({ albumId: albumId.get(p.album) as number, image: p.image, caption: p.caption, sortIndex })),
        })
        return albums.length + count
      }),
  )

  await fillIfEmpty(
    'Event',
    () => prisma.event.count(),
    async () =>
      (
        await prisma.event.createMany({
          data: [...masterpieces, ...DOCUMENTED_EVENTS.map((e) => ({ ...e, active: false }))],
        })
      ).count,
  )

  if (AWAL) {
    const { count } = await prisma.event.updateMany({
      where: { name: { in: DOCUMENTED_EVENTS.map((e) => e.name) }, active: true },
      data: { active: false },
    })
    console.log(`Event: ${count} event dokumentasi dinonaktifkan (--awal).`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
