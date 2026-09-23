import { z } from 'zod';
import { zName, zText } from '@/lib/api';

const fields = {
  waktu: zName('Waktu'),
  klien: zName('Klien'),
  event: zName('Event'),
  deskripsi: zText(2000, 'Deskripsi').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });

export const updateSchema = z.object(fields).partial();
