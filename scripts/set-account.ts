// Membuat, mengganti, atau menghapus akun dashboard langsung di database. Hanya untuk orang yang berwenang
// memegang database (misalnya saat menyalin akun Produksia ke produksi atau memulihkan akses owner).
//
// Pemakaian:
//   npx tsx --env-file=.env.local scripts/set-account.ts simpan <username> <role> "<Nama lengkap>"
//     Password diminta dua kali lewat terminal tanpa ditampilkan, lalu dicek dengan aturan password dashboard.
//   npx tsx --env-file=.env.local scripts/set-account.ts simpan <username> <role> "<Nama lengkap>" --hash-stdin
//     Membaca satu baris hash scrypt format Produksia dari stdin, untuk menyalin akun superadmin, owner,
//     dan owner2 dari Produksia sehingga password-nya sama.
//   npx tsx --env-file=.env.local scripts/set-account.ts hapus <username>
//
// role: owner, superadmin, admin, staff, atau tester. Akun yang sudah ada ditimpa (level, nama, password),
// diaktifkan, dan semua sesinya dicabut. Minimal satu akun owner atau superadmin aktif selalu dijaga.
// Kalau host database bukan localhost atau 127.0.0.1, tambahkan --yakin setelah memastikan database-nya benar.
import { Writable } from 'node:stream'
import { createInterface } from 'node:readline/promises'
import { Prisma } from '@prisma/client'
import prisma from '../src/lib/prisma'
import { zText, zUsername } from '../src/lib/api'
import { audit } from '../src/lib/audit'
import { checkPasswordStrength, hashPassword } from '../src/lib/password'
import { OWNERS, ROLES, isRole } from '../src/lib/rbac'

const ACTOR = { id: null, username: 'skrip set-account' }
const SCRYPT_HASH = /^scrypt\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/
const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
const TOP_LEFT = 'Dibatalkan: harus tersisa minimal satu akun Pemilik atau Super Admin yang aktif.'
const USAGE = [
  'Pemakaian:',
  '  scripts/set-account.ts simpan <username> <role> "<Nama lengkap>" [--hash-stdin] [--yakin]',
  '  scripts/set-account.ts hapus <username> [--yakin]',
  `role: ${ROLES.join(', ')}`,
].join('\n')

// Pesan untuk manusia. Error lain hanya dicetak nama dan kodenya karena error Prisma bisa memuat isi query (hash).
class StopError extends Error {}

function databaseHosts() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new StopError('DATABASE_URL belum diisi. Jalankan dengan --env-file=.env.local atau isi env-nya.')
  const url = URL.parse(raw)
  if (!url) throw new StopError('DATABASE_URL tidak valid.')
  // pg memakai parameter ?host= kalau ada, menggantikan host di URL.
  const hosts = url.searchParams.getAll('host')
  return { hosts: hosts.length ? hosts : [url.hostname], name: url.pathname.slice(1) }
}

async function askHidden(prompt: string) {
  let muted = false
  const output = new Writable({
    write(chunk, _encoding, done) {
      if (!muted) process.stdout.write(chunk)
      done()
    },
  })
  const rl = createInterface({ input: process.stdin, output, terminal: true })
  rl.on('SIGINT', () => {
    rl.close()
    console.log('\nDibatalkan.')
    process.exit(130)
  })
  try {
    process.stdout.write(prompt)
    muted = true
    return await rl.question('')
  } finally {
    rl.close()
    process.stdout.write('\n')
  }
}

async function readPasswordHash(fromStdin: boolean) {
  if (fromStdin) {
    let line = ''
    if (process.stdin.isTTY) {
      line = await askHidden('Tempel hash scrypt dari Produksia: ')
    } else {
      for await (const chunk of process.stdin) line += chunk
    }
    const hash = line.split(/\r?\n/)[0].trim()
    if (!SCRYPT_HASH.test(hash)) throw new StopError('Hash tidak dikenali. Yang diterima hanya format Produksia scrypt$garam$hash.')
    return hash
  }
  if (!process.stdin.isTTY) {
    throw new StopError('Password harus diketik di terminal. Untuk menyalin hash dari Produksia pakai --hash-stdin.')
  }
  const password = await askHidden('Password baru: ')
  const weak = checkPasswordStrength(password)
  if (weak) throw new StopError(weak)
  if ((await askHidden('Ulangi password: ')) !== password) throw new StopError('Kedua password tidak sama.')
  return hashPassword(password)
}

async function ensureTopAccountLeft(tx: Prisma.TransactionClient) {
  if ((await tx.user.count({ where: { role: { in: [...OWNERS] }, active: true } })) === 0) throw new StopError(TOP_LEFT)
}

function parseUsername(raw: string | undefined) {
  const parsed = zUsername.safeParse(raw)
  if (!parsed.success) throw new StopError(parsed.error.issues[0]?.message ?? 'Username tidak valid.')
  return parsed.data
}

async function save(args: string[], fromStdin: boolean) {
  const [rawUsername, role, rawAlias, ...extra] = args
  if (extra.length || rawAlias === undefined) throw new StopError(USAGE)
  const username = parseUsername(rawUsername)
  if (!isRole(role)) throw new StopError(`Role harus salah satu dari: ${ROLES.join(', ')}.`)
  const alias = zText(100, 'Nama lengkap').min(1, 'Nama lengkap wajib diisi.').safeParse(rawAlias)
  if (!alias.success) throw new StopError(alias.error.issues[0]?.message ?? 'Nama lengkap tidak valid.')

  const passwordHash = await readPasswordHash(fromStdin)
  const data = { alias: alias.data, role, passwordHash, active: true }
  const { user, before } = await prisma.$transaction(async (tx) => {
    const before = await tx.user.findUnique({ where: { username }, select: { role: true, active: true } })
    const user = await tx.user.upsert({
      where: { username },
      create: { username, ...data },
      update: { ...data, tokenVersion: { increment: 1 } },
      select: { id: true },
    })
    await ensureTopAccountLeft(tx)
    return { user, before }
  }, SERIALIZABLE)

  if (before) {
    const changes = [
      before.role !== role && `level ${before.role} menjadi ${role}`,
      !before.active && 'diaktifkan',
      'password diganti',
      'sesi dicabut',
    ].filter(Boolean)
    await audit(ACTOR, 'ubah', 'User', user.id, `akun ${username}: ${changes.join(', ')}`)
    console.log(`Akun ${username} diperbarui (level ${role}, aktif, semua sesi lama dicabut).`)
  } else {
    await audit(ACTOR, 'tambah', 'User', user.id, `akun ${username} level ${role}`)
    console.log(`Akun ${username} dibuat (level ${role}, aktif).`)
  }
}

async function remove(args: string[]) {
  if (args.length !== 1) throw new StopError(USAGE)
  const username = parseUsername(args[0])
  const deleted = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { username }, select: { id: true, role: true } })
    if (!user) throw new StopError(`Akun ${username} tidak ditemukan.`)
    await tx.user.delete({ where: { id: user.id } })
    await ensureTopAccountLeft(tx)
    return user
  }, SERIALIZABLE)
  await audit(ACTOR, 'hapus', 'User', deleted.id, `akun ${username} level ${deleted.role}`)
  console.log(`Akun ${username} dihapus.`)
}

async function main() {
  const argv = process.argv.slice(2)
  const flags = new Set(argv.filter((a) => a.startsWith('--')))
  const [command, ...args] = argv.filter((a) => !a.startsWith('--'))
  const unknown = [...flags].filter((f) => f !== '--yakin' && f !== '--hash-stdin')
  if (unknown.length) throw new StopError(`Flag tidak dikenal: ${unknown.join(' ')}\n${USAGE}`)
  if (command !== 'simpan' && command !== 'hapus') throw new StopError(USAGE)
  if (command === 'hapus' && flags.has('--hash-stdin')) throw new StopError(USAGE)

  const { hosts, name } = databaseHosts()
  console.log(`Database: ${name} di host ${hosts.join(', ')}`)
  if (hosts.some((h) => h !== 'localhost' && h !== '127.0.0.1') && !flags.has('--yakin')) {
    throw new StopError('Host database bukan localhost atau 127.0.0.1. Pastikan database-nya benar, lalu ulangi dengan --yakin.')
  }

  if (command === 'simpan') await save(args, flags.has('--hash-stdin'))
  else await remove(args)
}

main()
  .catch((error) => {
    if (error instanceof StopError) {
      console.error(error.message)
    } else {
      const { name, code } = (error ?? {}) as { name?: unknown; code?: unknown }
      console.error(`Gagal: ${typeof name === 'string' ? name : 'error'} ${code ?? ''}`.trim())
    }
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
