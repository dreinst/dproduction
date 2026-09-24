import { z } from 'zod';
import { zName, zText, zWhatsapp } from '@/lib/api';

const fields = {
  name: zName('Nama crew'),
  whatsapp: zWhatsapp('Nomor WhatsApp').nullable().optional(),
  notes: zText(1000, 'Catatan').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
// Tanpa default supaya PUT yang tidak mengirim active tidak diam-diam mengaktifkan crew.
export const updateSchema = z.object(fields).partial();

export const crewSelect = { id: true, name: true, whatsapp: true, notes: true, active: true } as const;
export const MESSAGES = {
  P2025: 'Crew tidak ditemukan.',
  P2003: 'Crew masih punya riwayat penugasan. Nonaktifkan saja.',
};
