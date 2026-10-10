import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, likeLiteral, zName, zUrl } from '@/lib/api';

const fields = {
  name: zName('Nama klien'),
  logo: zUrl('Logo').nullable().optional(),
  // Klien aktif dihitung di angka beranda. Yang aktif dan berlogo tampil di pita logo.
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();

// Kolom address dan phone berisi kontak narahubung dari situs lama. Keduanya tidak dikirim dan tidak diterima API ini,
// jadi isinya tetap di tabel tanpa pernah sampai ke peramban.
export const klienSelect = { id: true, name: true, logo: true, active: true, createdAt: true, updatedAt: true } as const;

export const MESSAGES = { P2025: 'Klien tidak ditemukan.', P2002: 'Klien dengan nama ini sudah ada.' };

// Nama dicek dulu tanpa membedakan huruf besar dan kecil supaya pesan 400-nya jelas dan satu klien tidak terhitung dua
// kali. Cek ini tidak dikunci. Kalau dua permintaan bernama sama datang bersamaan, indeks unik di tabel hanya menolak
// nama yang sama persis (P2002, dijawab 409 dengan pesan yang sama). Nama yang hanya berbeda huruf besar dan kecil
// lolos keduanya, karena indeks itu membedakan huruf.
export async function assertNameFree(name: string | undefined, exceptId?: number) {
  if (name === undefined) return;
  const taken = await prisma.klien.findFirst({
    where: { name: { equals: likeLiteral(name), mode: 'insensitive' }, id: exceptId ? { not: exceptId } : undefined },
    select: { id: true },
  });
  if (taken) throw new HttpError(400, MESSAGES.P2002);
}
