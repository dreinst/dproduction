import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, zSortIndex, zText, zUrl } from '@/lib/api';

const ALBUM_NOT_FOUND = 'Album tidak ditemukan.';

const fields = {
  albumId: z
    .number({ error: 'Album wajib dipilih.' })
    .int(ALBUM_NOT_FOUND)
    .positive(ALBUM_NOT_FOUND)
    .max(2147483647, ALBUM_NOT_FOUND),
  image: zUrl('Gambar'),
  caption: zText(200, 'Keterangan foto').nullable().optional(),
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
  sortIndex: zSortIndex,
};

export const createSchema = z.object({
  ...fields,
  active: fields.active.default(true),
  sortIndex: fields.sortIndex.default(0),
});
export const updateSchema = z.object(fields).partial();

// Album dicek dulu supaya pesan 400-nya jelas. Kalau album terhapus di antara cek dan simpan, foreign key menolak
// dengan P2003 yang dipetakan ke pesan yang sama.
export const MESSAGES = { P2025: 'Foto tidak ditemukan.', P2003: ALBUM_NOT_FOUND };

export async function assertAlbumExists(albumId: number | undefined) {
  if (albumId === undefined) return;
  const album = await prisma.galeriAlbum.findUnique({ where: { id: albumId }, select: { id: true } });
  if (!album) throw new HttpError(400, ALBUM_NOT_FOUND);
}

export const includeAlbum = { album: { select: { id: true, name: true } } } as const;
