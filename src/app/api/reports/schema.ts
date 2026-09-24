import { z } from 'zod';
import { zText } from '@/lib/api';
import { ADMIN_STATUS } from '@/lib/rbac';

export const patchSchema = z
  .object({
    adminStatus: z.enum(ADMIN_STATUS, { error: 'Status administrasi harus Belum, Invoice Terkirim, Lunas, atau Selesai.' }),
    adminNote: zText(2000, 'Catatan').nullable(),
  })
  .partial()
  .strict();

export const reportSelect = {
  id: true,
  name: true,
  client: true,
  startAt: true,
  status: true,
  adminStatus: true,
  adminNote: true,
} as const;
