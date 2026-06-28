import prisma from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const passwordHash = await bcrypt.hash('DproSecure123!', 10)
  
  await prisma.user.upsert({
    where: { username: 'owner' },
    update: { passwordHash }, // Update password hash if already exists
    create: {
      username: 'owner',
      alias: 'Owner',
      role: 'owner',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { passwordHash },
    create: {
      username: 'superadmin',
      alias: 'Super Admin',
      role: 'superadmin',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      alias: 'Administrator',
      role: 'admin',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: { passwordHash },
    create: {
      username: 'staff',
      alias: 'Staff',
      role: 'staff',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'tester' },
    update: { role: 'tester', passwordHash }, // Update role if already exists as 'admin'
    create: {
      username: 'tester',
      alias: 'Tester',
      role: 'tester',
      passwordHash,
    },
  })
  
  console.log('Seeded users!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
