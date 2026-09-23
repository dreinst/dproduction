import { z } from 'zod';
import { zUrl } from '@/lib/api';

const fields = {
  url: zUrl('URL video'),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({ ...fields, active: fields.active.default(true) });
export const updateSchema = z.object(fields).partial();
