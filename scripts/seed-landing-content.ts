// Mengisi database dengan konten landing yang tampil sekarang (FALLBACK di src/lib/landing-content.ts),
// supaya tampilan tidak berubah dan konten tinggal diedit dari dashboard.
//
//   npx tsx --env-file=.env.local scripts/seed-landing-content.ts          (hanya mengisi yang kosong)
//   npx tsx --env-file=.env.local scripts/seed-landing-content.ts --awal      (juga menimpa Setting Kantor dengan data resmi)
//   npx tsx --env-file=.env.local scripts/seed-landing-content.ts --perbarui  (menyamakan Master Event, hero, foto Wedding,
//                                                                             dan galeri hasil seed dengan FALLBACK terbaru)
//
// Database selain localhost ditolak kecuali ALLOW_REMOTE_SEED=1 (produksi, hanya dijalankan orang yang berwenang).
// Aman dijalankan berulang: tabel yang sudah berisi tidak disentuh.
import prisma from '../src/lib/prisma'
import { FALLBACK } from '../src/lib/landing-content'
import { assertLocalDatabase } from './assert-local-db'

const AWAL = process.argv.includes('--awal')

const PERBARUI = process.argv.includes('--perbarui')

// Kolom Event dari FALLBACK.events; foto dan deskripsi hanya dimiliki event Masterpiece.
const eventData = (e: (typeof FALLBACK.events)[number]) => ({
  name: e.name,
  client: e.client,
  year: e.year,
  featured: e.featured ?? false,
  photo: e.photo ?? null,
  description: e.description ?? null,
  active: true,
})

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
  const { kantor, hero, events, weddingPoints, rentals, photos } = FALLBACK

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
    async () => (await prisma.event.createMany({ data: events.map(eventData) })).count,
  )

  if (PERBARUI) await perbarui()
}

// --perbarui: menyamakan konten hasil seed dengan FALLBACK terbaru (foto terbaik, Masterpiece, daftar event).
// Event dicocokkan per nama; event lain yang ditambah admin tidak disentuh. Hanya foto galeri hasil seed
// (path /assets/portfolio/) yang diganti, foto unggahan admin tetap.
async function perbarui() {
  const { hero, events, weddingPhoto, photos } = FALLBACK
  let created = 0
  let updated = 0
  for (const e of events) {
    const data = eventData(e)
    const res = await prisma.event.updateMany({ where: { name: e.name }, data })
    if (res.count) updated += res.count
    else {
      await prisma.event.create({ data })
      created++
    }
  }
  const featured = await prisma.event.count({ where: { active: true, featured: true } })
  const active = await prisma.event.count({ where: { active: true } })
  console.log(`Event: ${updated} diperbarui, ${created} ditambah. Aktif ${active}, Masterpiece ${featured}.`)

  const first = await prisma.headHome.findFirst({ orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }] })
  if (first) {
    await prisma.headHome.update({ where: { id: first.id }, data: { image: hero.image, title: hero.title, caption: hero.caption, active: true } })
    console.log('HeadHome: gambar hero pertama diganti.')
  }

  const wedding = await prisma.wedding.findFirst({ where: { active: true }, orderBy: { id: 'asc' } })
  if (wedding) {
    await prisma.wedding.update({ where: { id: wedding.id }, data: { photo: weddingPhoto.src } })
    console.log(`Wedding: foto dipasang di poin "${wedding.name}".`)
  }

  const galeri = await prisma.$transaction(async (tx) => {
    const removed = await tx.galeriFoto.deleteMany({ where: { image: { startsWith: '/assets/portfolio/' } } })
    await tx.galeriAlbum.deleteMany({ where: { photos: { none: {} } } })
    const albumId = new Map<string, number>()
    for (const [i, name] of [...new Set(photos.map((p) => p.album))].entries()) {
      const album = await tx.galeriAlbum.upsert({ where: { name }, update: { active: true, sortIndex: i }, create: { name, sortIndex: i } })
      albumId.set(name, album.id)
    }
    const { count } = await tx.galeriFoto.createMany({
      data: photos.map((p, sortIndex) => ({ albumId: albumId.get(p.album) as number, image: p.image, caption: p.caption, sortIndex })),
    })
    return { removed: removed.count, count }
  })
  console.log(`Galeri: ${galeri.removed} foto lama diganti ${galeri.count} foto terbaik.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
