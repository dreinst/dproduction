import { z } from 'zod';
import { zName, zText, zWhatsapp } from '@/lib/api';
import { can } from '@/lib/rbac';

const fields = {
  name: zName('Nama crew'),
  whatsapp: zWhatsapp('Nomor WhatsApp').nullable().optional(),
  notes: zText(1000, 'Catatan').nullable().optional(),
  bankAccount: zText(100, 'Nomor rekening').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
// Tanpa default supaya PUT yang tidak mengirim active tidak diam-diam mengaktifkan crew.
export const updateSchema = z.object(fields).partial();

export const crewSelect = { id: true, name: true, whatsapp: true, notes: true, active: true } as const;

// Nomor rekening termasuk data gaji, jadi hanya untuk role yang boleh membuka Salary (owner dan superadmin).
export const canSeeBank = (role: unknown) => can(role, 'salary', 'read');
export const selectFor = (role: unknown) => (canSeeBank(role) ? { ...crewSelect, bankAccount: true } : crewSelect);
export function stripBank<T extends { bankAccount?: string | null }>(data: T, role: unknown) {
  if (canSeeBank(role)) return data;
  return { ...data, bankAccount: undefined };
}
export const MESSAGES = {
  P2025: 'Crew tidak ditemukan.',
  P2003: 'Crew masih punya riwayat penugasan. Nonaktifkan saja.',
};
