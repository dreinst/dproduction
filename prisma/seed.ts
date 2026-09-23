import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import prisma from '../src/lib/prisma'
import { assertLocalDatabase } from '../scripts/assert-local-db'

const USERS = [
  { username: 'owner', alias: 'Owner', role: 'owner' },
  { username: 'superadmin', alias: 'Super Admin', role: 'superadmin' },
  { username: 'admin', alias: 'Administrator', role: 'admin' },
  { username: 'staff', alias: 'Staff', role: 'staff' },
  { username: 'tester', alias: 'Tester', role: 'tester' },
]

async function main() {
  assertLocalDatabase()

  const existing = await prisma.user.findMany({
    where: { username: { in: USERS.map((u) => u.username) } },
    select: { username: true },
  })
  const taken = new Set(existing.map((u) => u.username))
  const toCreate = USERS.filter((u) => !taken.has(u.username))

  if (taken.size) console.log(`Akun sudah ada, password tidak diubah: ${[...taken].join(', ')}`)
  if (!toCreate.length) return

  const generated = !process.env.SEED_PASSWORD
  const password = process.env.SEED_PASSWORD || randomBytes(18).toString('base64url')
  if (password.trim().length < 12) {
    throw new Error('SEED_PASSWORD minimal 12 karakter, sama dengan aturan password di dashboard.')
  }
  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.createMany({
    data: toCreate.map((u) => ({ ...u, passwordHash })),
    skipDuplicates: true,
  })

  console.log(`Akun baru dibuat: ${toCreate.map((u) => u.username).join(', ')}`)
  if (generated) {
    console.log(`Password acak untuk akun baru (hanya ditampilkan sekali, simpan sekarang): ${password}`)
  } else {
    console.log('Password akun baru diambil dari SEED_PASSWORD.')
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
