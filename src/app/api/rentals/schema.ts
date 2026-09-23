import { z } from 'zod';
import { zName, zText, zUrl } from '@/lib/api';

// Kolom harga dan tarif di DB masih teks, jadi format lama seperti "Rp 1.500.000" tetap diterima.
export const zAmount = (label: string) =>
  zText(30, label).regex(
    /^(rp\.?\s*)?\d[\d.,]*$/i,
    `${label} harus berupa angka rupiah yang tidak negatif, misalnya 1500000 atau Rp 1.500.000.`,
  );

const fields = {
  name: zName('Nama rental'),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  price: zAmount('Harga').nullable().optional(),
  unit: zText(50, 'Satuan').nullable().optional(),
  waCart: zUrl('Link WA Cart').nullable().optional(),
  photo: zUrl('URL foto').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();
