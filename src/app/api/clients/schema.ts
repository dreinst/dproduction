import { z } from 'zod';
import { zText } from '@/lib/api';
import { LEAD_STATUS } from '@/lib/rbac';
import { EVENT_VALUES } from '@/lib/site';

// Bentuk lead yang dikirim ke dashboard, sama untuk daftar dan detail.
export const leadSelect = {
  id: true,
  name: true,
  whatsapp: true,
  eventType: true,
  message: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  workspaceEventId: true,
  pic: { select: { id: true, alias: true, username: true } },
} as const;

export const MESSAGES = { P2025: 'Lead tidak ditemukan atau sudah dihapus.' };

const zStatus = z.enum(LEAD_STATUS, { error: 'Status lead harus Baru, Dihubungi, Penawaran, Deal, atau Batal.' });

const zQueryInt = (message: string, max: number) =>
  z.string().regex(/^[1-9]\d{0,6}$/, message).transform(Number).pipe(z.number().max(max, message));

export const listQuerySchema = z.object({
  page: zQueryInt('Halaman harus berupa angka bulat mulai dari 1.', 1_000_000).default(1),
  pageSize: zQueryInt('Jumlah baris per halaman harus angka bulat 1 sampai 100.', 100).default(20),
  status: zStatus.optional(),
  eventType: z.enum(EVENT_VALUES, { error: 'Jenis acara tidak dikenal.' }).optional(),
  q: zText(100, 'Kata pencarian').optional(),
});

// Hanya field tindak lanjut; pesan asli (nama, WhatsApp, jenis acara, pesan) tidak bisa diubah.
export const followUpSchema = z
  .strictObject(
    {
      status: zStatus.optional(),
      notes: zText(2000, 'Catatan tindak lanjut')
        .nullable()
        .transform((value) => value || null)
        .optional(),
      picId: z
        .number({ error: 'Penanggung jawab tidak valid.' })
        .int('Penanggung jawab tidak valid.')
        .positive('Penanggung jawab tidak valid.')
        .max(2147483647, 'Penanggung jawab tidak valid.')
        .nullable()
        .optional(),
    },
    {
      error: (issue) =>
        issue.code === 'unrecognized_keys' ? 'Pesan asli dan data kontak lead tidak bisa diubah.' : undefined,
    },
  )
  .refine((data) => Object.keys(data).length > 0, 'Tidak ada data tindak lanjut yang dikirim.');
