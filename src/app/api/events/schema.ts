import { z } from 'zod';
import { zName, zText, zUrl } from '@/lib/api';

const fields = {
  name: zName('Nama event'),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  photo: zUrl('URL foto').nullable().optional(),
  year: z
    .number({ error: 'Tahun harus berupa angka.' })
    .int('Tahun harus berupa angka bulat.')
    .min(2000, 'Tahun paling awal 2000.')
    .max(2100, 'Tahun paling akhir 2100.')
    .nullable()
    .optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();
