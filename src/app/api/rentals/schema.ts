import { z } from 'zod';
import { zName, zRupiah, zText, zUrl } from '@/lib/api';

const fields = {
  name: zName('Nama rental'),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  // Kosong (null) tampil "Hubungi Kami" di website.
  price: zRupiah('Harga mulai').nullable().optional(),
  unit: zText(50, 'Satuan').nullable().optional(),
  waCart: zUrl('Link WA Cart').nullable().optional(),
  photo: zUrl('Foto').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();
