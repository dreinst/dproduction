import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, likeLiteral, zName, zSortIndex, zText } from '@/lib/api';

const fields = {
  name: zName('Nama kategori'),
  // Satu kalimat di bawah judul kategori pada halaman katalog.
  description: zText(300, 'Deskripsi kategori').nullable().optional(),
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
  sortIndex: zSortIndex,
};

// sortIndex yang tidak dikirim diisi route supaya kategori baru masuk di urutan paling akhir.
export const createSchema = z.object({ ...fields, active: fields.active.default(true), sortIndex: fields.sortIndex.optional() });
export const updateSchema = z.object(fields).partial();

export const MESSAGES = { P2025: 'Kategori tidak ditemukan.', P2002: 'Kategori dengan nama ini sudah ada.' };

// Jumlah item ikut dikirim supaya halaman admin bisa menampilkannya dan tahu kategori mana yang belum bisa dihapus.
export const includeCount = { _count: { select: { rentals: true } } } as const;

// Nama dicek dulu tanpa membedakan huruf besar dan kecil supaya pesan 400-nya jelas. Cek ini tidak dikunci. Kalau dua
// permintaan bernama sama datang bersamaan, indeks unik di tabel hanya menolak nama yang sama persis (P2002, dijawab
// 409 dengan pesan yang sama). Nama yang hanya berbeda huruf besar dan kecil lolos keduanya, karena indeks itu
// membedakan huruf.
export async function assertNameFree(name: string | undefined, exceptId?: number) {
  if (name === undefined) return;
  const taken = await prisma.rentalCategory.findFirst({
    where: { name: { equals: likeLiteral(name), mode: 'insensitive' }, id: exceptId ? { not: exceptId } : undefined },
    select: { id: true },
  });
  if (taken) throw new HttpError(400, MESSAGES.P2002);
}
