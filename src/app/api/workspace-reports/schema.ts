import { z } from 'zod';
import { zName } from '@/lib/api';
import { REPORT_STATUS } from '@/lib/rbac';
import { MONTHS } from './months';

const fields = {
  title: zName('Judul'),
  date: z
    .number({ error: 'Tanggal harus berupa angka.' })
    .int('Tanggal harus bilangan bulat.')
    .min(1, 'Tanggal harus antara 1 dan 31.')
    .max(31, 'Tanggal harus antara 1 dan 31.'),
  month: z.enum(MONTHS, { error: 'Bulan harus dipilih dari daftar Januari sampai Desember.' }),
  time: z
    .string({ error: 'Jam wajib diisi.' })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jam harus berformat JJ:MM, misalnya 17:00.'),
  client: zName('Klien'),
  status: z.enum(REPORT_STATUS, { error: 'Status harus salah satu dari: admin, selesai, performance.' }),
};

export const createSchema = z.object({ ...fields, status: fields.status.default('admin') });

export const updateSchema = z.object(fields).partial();
