import { z } from 'zod';
import { zName } from '@/lib/api';
import { zAmount } from '@/lib/api';

export const createSchema = z.object({
  name: zName('Nama jobdesc'),
  levelA: zAmount('Tarif level A').nullable().optional(),
  levelB: zAmount('Tarif level B').nullable().optional(),
  levelC: zAmount('Tarif level C').nullable().optional(),
});
export const updateSchema = createSchema.partial();
