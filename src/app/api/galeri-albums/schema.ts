import { z } from 'zod';
import { zName, zSortIndex, zText } from '@/lib/api';

const fields = {
  name: zName('Nama album'),
  description: zText(500, 'Keterangan').nullable().optional(),
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
  sortIndex: zSortIndex,
};

export const createSchema = z.object({
  ...fields,
  active: fields.active.default(true),
  sortIndex: fields.sortIndex.default(0),
});
export const updateSchema = z.object(fields).partial();

export const MESSAGES = {
  P2025: 'Album tidak ditemukan.',
  P2002: 'Album dengan nama ini sudah ada.',
  P2003: 'Album masih berisi foto. Hapus atau pindahkan fotonya dulu.',
};
