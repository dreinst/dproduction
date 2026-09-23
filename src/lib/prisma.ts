import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function getClient() {
  if (!globalThis.prismaGlobal) {
    const connectionString = process.env.DATABASE_URL
    // Tanpa ini pg diam-diam tersambung ke Postgres bawaan mesin (localhost:5432).
    if (!connectionString) {
      throw new Error('DATABASE_URL belum diisi. Isi di .env.local (contoh di .env.example) atau di environment hosting.')
    }
    globalThis.prismaGlobal = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString })) })
  }
  return globalThis.prismaGlobal
}

// Dibuat saat pertama dipakai, supaya build tanpa DATABASE_URL tetap jalan.
const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export default prisma
