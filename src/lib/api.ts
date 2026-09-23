import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Pesan bawaan zod untuk skema tanpa pesan sendiri.
z.config(z.locales.id());

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function apiError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ message, ...extra }, { status });
}

const INT4_MAX = 2147483647;

export function parseId(raw: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id <= INT4_MAX ? id : null;
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Data yang dikirim bukan JSON yang valid.');
  }
}

type PrismaMessages = Partial<Record<'P2002' | 'P2025', string>>;

export function handleRouteError(error: unknown, messages: PrismaMessages = {}) {
  if (error instanceof HttpError) return apiError(error.status, error.message);
  if (error instanceof z.ZodError) {
    return apiError(400, error.issues[0]?.message ?? 'Data tidak valid.', { issues: error.issues });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return apiError(404, messages.P2025 ?? 'Data tidak ditemukan.');
    if (error.code === 'P2002') return apiError(409, messages.P2002 ?? 'Data dengan nilai yang sama sudah ada.');
  }
  const writeConflict =
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') ||
    (error as { cause?: { kind?: unknown } } | null)?.cause?.kind === 'TransactionWriteConflict';
  if (writeConflict) return apiError(409, 'Data sedang diubah bersamaan. Coba lagi.');
  console.error(error);
  return apiError(500, 'Terjadi kesalahan di server. Coba lagi nanti.');
}

// Postgres menolak karakter NUL di kolom teks, jadi ditolak di sini supaya tidak jadi error 500.
const NO_NUL = /^[^\u0000]*$/;

export const zName = (label = 'Nama') =>
  z
    .string({ error: `${label} wajib diisi.` })
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(200, `${label} maksimal 200 karakter.`)
    .regex(NO_NUL, `${label} berisi karakter yang tidak valid.`);

export const zText = (max: number, label = 'Teks') =>
  z
    .string({ error: `${label} harus berupa teks.` })
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .regex(NO_NUL, `${label} berisi karakter yang tidak valid.`);

// Kolom harga dan tarif di DB masih teks, jadi format lama seperti "Rp 1.500.000" tetap diterima.
export const zAmount = (label: string) =>
  zText(30, label).regex(
    /^(rp\.?\s*)?\d[\d.,]*$/i,
    `${label} harus berupa angka rupiah yang tidak negatif, misalnya 1500000 atau Rp 1.500.000.`,
  );

function isSafeUrl(value: string) {
  if (/\s|\\/.test(value)) return false;
  if (value.startsWith('/')) {
    if (value.startsWith('//')) return false;
    try {
      decodeURI(value);
      return true;
    } catch {
      return false;
    }
  }
  if (!value.startsWith('https://')) return false;
  try {
    return new URL(value).hostname.includes('.');
  } catch {
    return false;
  }
}

export const zUrl = (label = 'URL') =>
  z
    .string({ error: `${label} wajib diisi.` })
    .trim()
    .max(2000, `${label} maksimal 2000 karakter.`)
    .refine(isSafeUrl, `${label} harus diawali https:// atau / (path di situs ini).`);

export const zIsoDate = (label = 'Tanggal') =>
  z.iso.date({ error: `${label} harus berupa tanggal yang valid dengan format TTTT-BB-HH.` });

export const zUsername = z
  .string({ error: 'Username wajib diisi.' })
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9._-]{3,50}$/,
    'Username 3 sampai 50 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.',
  );

export const zPassword = z
  .string({ error: 'Password wajib diisi.' })
  .refine((v) => v.trim().length >= 12, 'Password minimal 12 karakter dan tidak boleh hanya berisi spasi.')
  .refine((v) => new TextEncoder().encode(v).length <= 72, 'Password maksimal 72 karakter.');

type SoftDeletable<D> = {
  updateMany(args: { where: { id: number; deletedAt: null }; data: D }): PromiseLike<{ count: number }>;
};

export async function updateActive<D>(model: SoftDeletable<D>, id: number, data: D) {
  const { count } = await model.updateMany({ where: { id, deletedAt: null }, data });
  if (!count) throw new HttpError(404, 'Data tidak ditemukan atau sudah dihapus.');
}

export const softDelete = (model: SoftDeletable<{ deletedAt: Date }>, id: number) =>
  updateActive(model, id, { deletedAt: new Date() });
