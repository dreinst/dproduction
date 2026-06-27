import prisma from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)
  
  await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      alias: 'Owner',
      role: 'owner',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      alias: 'Administrator',
      role: 'admin',
      passwordHash,
    },
  })

  await prisma.user.upsert({
    where: { username: 'tester' },
    update: {},
    create: {
      username: 'tester',
      alias: 'Tester',
      role: 'admin',
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
