import { z } from 'zod';
import { zName, zText, zUrl } from '@/lib/api';

const fields = {
  name: zName('Nama wedding'),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  photo: zUrl('Foto').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();
