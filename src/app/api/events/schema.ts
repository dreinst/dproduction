import { z } from 'zod';
import { zName, zText, zUrl } from '@/lib/api';

const fields = {
  name: zName('Nama event'),
  client: zText(120, 'Klien').nullable().optional(),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  photo: zUrl('Foto').nullable().optional(),
  year: z
    .number({ error: 'Tahun harus berupa angka.' })
    .int('Tahun harus berupa angka bulat.')
    .min(2000, 'Tahun paling awal 2000.')
    .max(2100, 'Tahun paling akhir 2100.')
    .nullable()
    .optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
  featured: z.boolean({ error: 'Tanda Masterpiece harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true), featured: fields.featured.default(false) });
export const updateSchema = z.object(fields).partial();
