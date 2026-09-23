import { z } from 'zod';
import { zIsoDate, zName, zText, zUrl } from '@/lib/api';

const fields = {
  album: zName('Album'),
  keterangan: zText(500, 'Keterangan').nullable().optional(),
  tanggal: zIsoDate('Tanggal').nullable().optional(),
  image: zUrl('URL foto').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z
  .object({
    ...fields,
    sortIndex: z
      .number({ error: 'Urutan harus berupa angka.' })
      .int('Urutan harus bilangan bulat.')
      .min(0, 'Urutan tidak boleh negatif.')
      .max(2147483647, 'Urutan terlalu besar.'),
  })
  .partial();

export const MESSAGES = {
  P2025: 'Album tidak ditemukan.',
  P2002: 'Urutan bentrok dengan perubahan lain yang terjadi bersamaan. Coba lagi.',
};
