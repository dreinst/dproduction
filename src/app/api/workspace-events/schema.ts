import { z } from 'zod';
import { zName, zText, zUrl } from '@/lib/api';
import { WORKSPACE_EVENT_STATUS } from '@/lib/rbac';

const fields = {
  jobDesc: zName('JobDesc'),
  date: z.iso
    .datetime({ offset: true, error: 'Tanggal dan jam wajib diisi dengan waktu yang valid beserta zona waktunya.' })
    .transform((value) => new Date(value)),
  client: zName('Klien'),
  status: z.enum(WORKSPACE_EVENT_STATUS, { error: 'Status harus salah satu dari: running, selesai.' }),
  event: zText(200, 'Nama event').nullable().optional(),
  deskripsi: zText(2000, 'Deskripsi').nullable().optional(),
  linkFoto: zUrl('Link foto').nullable().optional(),
  linkVideo: zUrl('Link video').nullable().optional(),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};

export const createSchema = z.object({
  ...fields,
  status: fields.status.default('running'),
  active: fields.active.default(true),
});

export const updateSchema = z.object(fields).partial();
