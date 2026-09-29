// Impor data situs PHP lama (hasil ekspor JSON dari dump MySQL dpro.sql) ke database baru.
//
//   npx tsx --env-file=.env.local scripts/impor-situs-lama.ts <file.json>
//
// Aman dijalankan berulang: baris dicocokkan lewat id lama (legacyId, legacyKey) atau nama.
// Password lama (crew dan admin) sengaja TIDAK diimpor. Database selain localhost butuh ALLOW_REMOTE_SEED=1.
import { readFileSync, existsSync } from 'node:fs'
import prisma from '../src/lib/prisma'
import { assertLocalDatabase } from './assert-local-db'

type Row = Record<string, string | number | null>
type Data = Record<
  'level' | 'jobdesc' | 'tarif' | 'klien' | 'pegawai' | 'kronik' | 'detail' | 'absen' | 'absenDetail' | 'history' | 'persewaan',
  Row[]
>

const file = process.argv[2]
if (!file) throw new Error('Pakai: scripts/impor-situs-lama.ts <file.json>')
const data = JSON.parse(readFileSync(file, 'utf8')) as Data

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
// Tanda pisah berspasi di nama lama diganti koma, tanda kutip miring diganti apostrof.
const clean = (v: unknown) => str(v).replace(/`/g, "'").replace(/\s+[-–—]\s+/g, ', ').replace(/\s+/g, ' ').trim()
const orNull = (v: string) => v || null
const stripHtml = (v: unknown) =>
  orNull(str(v).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').trim())
const https = (v: unknown) => (/^https:\/\/\S+$/.test(str(v).trim()) ? str(v).trim() : null)
// Waktu di database lama adalah waktu lokal WIB.
const wib = (v: unknown) => new Date(`${str(v).replace(' ', 'T')}+07:00`)
const num = (v: unknown) => {
  const n = Number.parseFloat(str(v))
  return Number.isFinite(n) ? n : null
}
function whatsapp(v: unknown) {
  const digits = str(v).replace(/\D/g, '').replace(/^62/, '0')
  return /^08\d{7,12}$/.test(digits) ? digits : null
}

async function main() {
  assertLocalDatabase()

  // Level event, JobDesc, dan tarif honor.
  const grade = new Map<number, number>()
  for (const l of data.level) {
    const g = await prisma.gradeEvent.upsert({ where: { grade: clean(l.nama) }, update: {}, create: { grade: clean(l.nama) } })
    grade.set(Number(l.id), g.id)
  }
  const job = new Map<number, number>()
  for (const j of data.jobdesc) {
    const r = await prisma.jobDesc.upsert({ where: { name: clean(j.nama) }, update: {}, create: { name: clean(j.nama) } })
    job.set(Number(j.id), r.id)
  }
  const tarif = new Map<string, number>()
  for (const t of data.tarif) {
    const jobDescId = job.get(Number(t.jobDescID))
    const gradeEventId = grade.get(Number(t.levelID))
    if (!jobDescId || !gradeEventId) continue
    const amount = Math.round(Number(t.salary))
    await prisma.tarif.upsert({
      where: { jobDescId_gradeEventId: { jobDescId, gradeEventId } },
      update: { amount },
      create: { jobDescId, gradeEventId, amount },
    })
    tarif.set(`${jobDescId}:${gradeEventId}`, amount)
  }
  console.log(`Master: ${grade.size} level, ${job.size} JobDesc, ${tarif.size} tarif.`)

  // Klien.
  const klien = new Map<number, string>()
  for (const k of data.klien) {
    const name = clean(k.nama)
    const logo = str(k.foto) && existsSync(`public/assets/klien/${str(k.foto)}`) ? `/assets/klien/${str(k.foto)}` : null
    const values = { address: stripHtml(k.alamat), phone: whatsapp(k.hp) ?? orNull(str(k.hp).trim()), logo, active: Number(k.aktif) !== 0 }
    await prisma.klien.upsert({ where: { name }, update: values, create: { name, ...values } })
    klien.set(Number(k.id), name)
  }
  console.log(`Klien: ${klien.size}.`)

  // Crew (tanpa password lama).
  const crew = new Map<number, number>()
  let waInvalid = 0
  for (const p of data.pegawai) {
    const wa = whatsapp(p.hp)
    if (!wa && str(p.hp)) waInvalid++
    const values = {
      name: clean(p.nama),
      whatsapp: wa,
      notes: orNull([clean(p.jabatan), clean(p.jenis)].filter(Boolean).join(', ')),
      bankAccount: orNull(str(p.rek).trim()),
      active: Number(p.aktif) !== 0,
    }
    const c = await prisma.crew.upsert({ where: { legacyId: Number(p.id) }, update: values, create: { ...values, legacyId: Number(p.id) } })
    crew.set(Number(p.id), c.id)
  }
  console.log(`Crew: ${crew.size} (nomor WhatsApp tidak valid dikosongkan: ${waInvalid}).`)

  // Workspace Event dari kronik; waktu mulai dan selesai dari sesi penugasan kalau ada.
  const details = data.detail.map((d) => {
    const awal = wib(d.awal)
    const akhir = wib(d.akhir)
    return { id: Number(d.id), kronikID: Number(d.kronikID), jobDescID: Number(d.jobDescID), pegawai: str(d.pegawai), awal, akhir: akhir < awal ? awal : akhir }
  })
  const event = new Map<number, { id: number; gradeEventId: number | null; endAt: Date }>()
  for (const k of data.kronik) {
    const sessions = details.filter((d) => Number(d.kronikID) === Number(k.id))
    const startAt = sessions.length
      ? new Date(Math.min(...sessions.map((s) => s.awal.getTime())))
      : wib(`${str(k.tgl)} ${str(k.jam) || '00:00:00'}`)
    const endAt = sessions.length ? new Date(Math.max(...sessions.map((s) => s.akhir.getTime()))) : startAt
    const gradeEventId = grade.get(Number(k.levelID)) ?? null
    const values = {
      name: clean(k.nama),
      client: klien.get(Number(k.klienID)) ?? "D'Production",
      startAt,
      endAt,
      gradeEventId,
      status: 'selesai' as const,
      adminStatus: Number(k.administrasi) === 2 ? ('selesai' as const) : ('belum' as const),
      photoUrl: https(k.link_image),
      videoUrl: https(k.link_video),
      notes: stripHtml(k.deskripsi),
    }
    const e = await prisma.workspaceEvent.upsert({ where: { legacyId: Number(k.id) }, update: values, create: { ...values, legacyId: Number(k.id) } })
    event.set(Number(k.id), { id: e.id, gradeEventId, endAt })
  }
  console.log(`Workspace Event: ${event.size}.`)

  // Penugasan: satu baris per crew per event per JobDesc, honor = tarif level event x jumlah sesi.
  // Data lama tidak mencatat pembayaran; event lama dianggap sudah dibayar pada tanggal selesai event.
  const sessionsPer = new Map<string, number>()
  let unknownCrew = 0
  for (const d of details) {
    for (const pid of str(d.pegawai).split(',').map((s) => Number(s.trim())).filter(Boolean)) {
      if (!crew.has(pid)) {
        unknownCrew++
        continue
      }
      const key = `${d.kronikID}:${d.jobDescID}:${pid}`
      sessionsPer.set(key, (sessionsPer.get(key) ?? 0) + 1)
    }
  }
  let assignments = 0
  for (const [key, sessions] of sessionsPer) {
    const [kronikID, jobDescID, pid] = key.split(':').map(Number)
    const ev = event.get(kronikID)
    const jobDescId = job.get(jobDescID)
    const crewId = crew.get(pid)
    if (!ev || !jobDescId || !crewId) continue
    const honor = (ev.gradeEventId ? tarif.get(`${jobDescId}:${ev.gradeEventId}`) ?? 0 : 0) * sessions
    await prisma.assignment.upsert({
      where: { workspaceEventId_crewId_jobDescId: { workspaceEventId: ev.id, crewId, jobDescId } },
      update: { honor, paid: true, paidAt: ev.endAt },
      create: { workspaceEventId: ev.id, crewId, jobDescId, honor, paid: true, paidAt: ev.endAt },
    })
    assignments++
  }
  console.log(`Penugasan: ${assignments} (id crew tidak dikenal dilewati: ${unknownCrew}).`)

  // Absensi.
  const detailById = new Map(details.map((d) => [Number(d.id), d]))
  const absenById = new Map<number, { workspaceEventId: number; crewId: number; jobDescId: number | null }>()
  const absenRows = []
  for (const a of data.absen) {
    const d = detailById.get(Number(a.detailID))
    const ev = d && event.get(Number(d.kronikID))
    const crewId = crew.get(Number(a.pegawaiID))
    if (!d || !ev || !crewId) continue
    const ref = { workspaceEventId: ev.id, crewId, jobDescId: job.get(Number(d.jobDescID)) ?? null }
    absenById.set(Number(a.id), ref)
    absenRows.push({
      ...ref,
      kind: 'absen',
      checkedAt: wib(a.tgl),
      lat: num(a.lat),
      lng: num(a.lng),
      photo: orNull(str(a.foto)),
      verified: Number(a.check) === 2,
      legacyKey: `absen:${a.id}`,
    })
  }
  const laporanRows = data.absenDetail.flatMap((x) => {
    const ref = absenById.get(Number(x.absenID))
    return ref
      ? [{ ...ref, kind: 'laporan', checkedAt: wib(x.tgl), lat: num(x.lat), lng: num(x.lng), photo: orNull(str(x.foto)), note: stripHtml(x.ket), legacyKey: `laporan:${x.id}` }]
      : []
  })
  let absensi = 0
  for (const rows of [absenRows, laporanRows]) {
    for (let i = 0; i < rows.length; i += 1000) {
      absensi += (await prisma.absensi.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true })).count
    }
  }
  console.log(`Absensi: ${absensi} baris baru (absen ${absenRows.length}, laporan ${laporanRows.length}, sisanya sudah ada atau tanpa event).`)

  // Riwayat aktivitas situs lama ke AuditLog, sekali saja.
  if (await prisma.auditLog.count({ where: { entity: 'SitusLama' } })) {
    console.log('AuditLog: riwayat situs lama sudah pernah diimpor, dilewati.')
  } else {
    const rows = data.history.map((h) => ({
      username: clean(h.username) || 'tanpa nama',
      action: clean(h.aksi) || 'lainnya',
      entity: 'SitusLama',
      summary: stripHtml(h.deskripsi)?.slice(0, 500) ?? null,
      createdAt: wib(h.waktu),
    }))
    let count = 0
    for (let i = 0; i < rows.length; i += 1000) count += (await prisma.auditLog.createMany({ data: rows.slice(i, i + 1000) })).count
    console.log(`AuditLog: ${count} riwayat situs lama.`)
  }

  // Link WhatsApp katalog rental lama dipasang ke Master Rental yang namanya mirip.
  for (const r of data.persewaan) {
    const link = https(r.link_wa)
    const word = clean(r.nama).split(' ')[0]
    if (!link || !word) continue
    const res = await prisma.rental.updateMany({ where: { name: { startsWith: word, mode: 'insensitive' }, waCart: null }, data: { waCart: link } })
    if (res.count) console.log(`Rental: link WhatsApp dipasang ke ${res.count} item "${word}".`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
