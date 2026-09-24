// Khusus server: skema dan aturan bersama Workspace Event.
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { HttpError, zDateTime, zName, zText, zUrl } from '@/lib/api';
import { WORKSPACE_EVENT_STATUS } from '@/lib/rbac';

export const workspaceEventFields = {
  name: zName('Nama acara'),
  client: zName('Klien'),
  location: zText(300, 'Lokasi').nullable().optional(),
  startAt: zDateTime('Tanggal mulai'),
  endAt: zDateTime('Tanggal selesai').nullable().optional(),
  gradeEventId: z
    .number({ error: 'Level event (Grade Event) tidak valid.' })
    .int('Level event (Grade Event) tidak valid.')
    .positive('Level event (Grade Event) tidak valid.')
    .max(2147483647, 'Level event (Grade Event) tidak valid.')
    .nullable()
    .optional(),
  status: z.enum(WORKSPACE_EVENT_STATUS, { error: 'Status harus Berjalan, Selesai, Batal, atau Ditunda.' }),
  photoUrl: zUrl('Link foto').nullable().optional(),
  videoUrl: zUrl('Link video').nullable().optional(),
  notes: zText(2000, 'Catatan').nullable().optional(),
};

export const workspaceEventCreateSchema = z.object({
  ...workspaceEventFields,
  status: workspaceEventFields.status.default('berjalan'),
});

export const workspaceEventUpdateSchema = z.object(workspaceEventFields).partial();

// Untuk update, panggil dengan nilai gabungan (isian baru atau nilai lama dari DB).
export function assertEventRange(startAt: Date, endAt: Date | null | undefined) {
  if (endAt && endAt.getTime() < startAt.getTime()) {
    throw new HttpError(400, 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
  }
}

export async function assertGradeExists(db: Prisma.TransactionClient, gradeEventId: number | null | undefined) {
  if (gradeEventId == null) return;
  const grade = await db.gradeEvent.findUnique({ where: { id: gradeEventId }, select: { id: true } });
  if (!grade) throw new HttpError(400, 'Level event (Grade Event) tidak ditemukan.');
}

// Tanggal disimpan UTC; dashboard dan salary menghitung per tahun atau bulan kalender WIB (UTC+7, tanpa DST).
export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const wibStart = (year: number, monthIndex: number) => new Date(Date.UTC(year, monthIndex, 1) - WIB_OFFSET_MS);

export function wibYearRange(year: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new HttpError(400, 'Tahun harus antara 2000 dan 2100.');
  return { gte: wibStart(year, 0), lt: wibStart(year + 1, 0) };
}

export function wibMonthRange(month: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  const year = Number(match?.[1]);
  if (!match || year < 2000 || year > 2100) {
    throw new HttpError(400, 'Bulan harus berformat TTTT-BB antara 2000 dan 2100, misalnya 2026-09.');
  }
  const monthIndex = Number(match[2]) - 1;
  return { gte: wibStart(year, monthIndex), lt: wibStart(year, monthIndex + 1) };
}
