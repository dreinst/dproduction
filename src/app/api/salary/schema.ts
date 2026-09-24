import { z } from 'zod';
import { zRupiah } from '@/lib/api';
import { zRefId } from '../workspace-events/shared';

export const salarySelect = {
  id: true,
  honor: true,
  paid: true,
  paidAt: true,
  crew: { select: { id: true, name: true } },
  jobDesc: { select: { id: true, name: true } },
  workspaceEvent: { select: { id: true, name: true, startAt: true } },
} as const;

export const patchSchema = z
  .object({
    honor: zRupiah('Honor'),
    paid: z.boolean({ error: 'Status bayar harus ya atau tidak.' }),
  })
  .partial()
  .strict();

export const paySchema = z
  .object({
    crewId: zRefId('Crew'),
    month: z.string({ error: 'Bulan wajib diisi.' }),
  })
  .strict();
