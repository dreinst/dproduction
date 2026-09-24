import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkPasswordStrength } from '@/lib/password';
import { WHATSAPP_PATTERN, normalizeWhatsapp } from '@/lib/site';

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

type PrismaMessages = Partial<Record<'P2002' | 'P2003' | 'P2025', string>>;

const IN_USE_MESSAGE =
  'Data ini masih dipakai data lain sehingga tidak bisa dihapus. Nonaktifkan saja atau lepaskan hubungannya dulu.';

export function handleRouteError(error: unknown, messages: PrismaMessages = {}) {
  if (error instanceof HttpError) return apiError(error.status, error.message);
  if (error instanceof z.ZodError) {
    return apiError(400, error.issues[0]?.message ?? 'Data tidak valid.', { issues: error.issues });
  }
  const known = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;
  // Error dari adapter pg yang tidak diterjemahkan Prisma membawa SQLSTATE Postgres di cause.code.
  const cause = (error as { cause?: { kind?: unknown; code?: unknown } } | null)?.cause;
  if (known === 'P2025') return apiError(404, messages.P2025 ?? 'Data tidak ditemukan.');
  if (known === 'P2002') return apiError(409, messages.P2002 ?? 'Data dengan nilai yang sama sudah ada.');
  // Postgres 18 melaporkan pelanggaran ON DELETE RESTRICT sebagai 23001, yang tidak diubah adapter menjadi P2003.
  if (known === 'P2003' || known === 'P2014' || cause?.code === '23503' || cause?.code === '23001') {
    return apiError(409, messages.P2003 ?? IN_USE_MESSAGE);
  }
  if (known === 'P2034' || cause?.kind === 'TransactionWriteConflict') {
    return apiError(409, 'Data sedang diubah bersamaan. Coba lagi.');
  }
  // Error Prisma bisa memuat nilai isian (data pribadi), jadi hanya nama dan kodenya yang dicatat.
  // Pesan lengkap hanya untuk Error biasa yang dilempar kode sendiri.
  const { name, code } = (error ?? {}) as { name?: unknown; code?: unknown };
  const errorCode = code ?? cause?.code;
  const detail = errorCode ? String(errorCode) : error instanceof Error && name === 'Error' ? error.message : '';
  console.error(`Error tak terduga di route API: ${typeof name === 'string' ? name : 'tidak diketahui'} ${detail}`.trim());
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

export const zRupiah = (label: string) => {
  const message = `${label} harus berupa angka rupiah bulat yang tidak negatif.`;
  return z
    .number({ error: message })
    .int(message)
    .min(0, message)
    .max(2_000_000_000, `${label} maksimal Rp 2.000.000.000.`);
};

export const zSortIndex = z
  .number({ error: 'Urutan harus berupa angka bulat.' })
  .int('Urutan harus berupa angka bulat.')
  .min(0, 'Urutan tidak boleh negatif.')
  .max(INT4_MAX, 'Urutan terlalu besar.');

export const zWhatsapp = (label: string) => {
  const message = `${label} harus nomor Indonesia yang diawali 08 atau +62, misalnya 08123456789.`;
  return z.string({ error: message }).overwrite(normalizeWhatsapp).regex(WHATSAPP_PATTERN, message);
};

// Tanggal dan jam wajib membawa zona waktu (Z atau +07:00) supaya tersimpan benar sebagai UTC.
export const zDateTime = (label: string) =>
  z.iso
    .datetime({ offset: true, error: `${label} wajib diisi dengan tanggal dan jam yang valid beserta zona waktunya.` })
    .transform((value) => new Date(value));

function isSafeUrl(value: string) {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
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

export const zUsername = z
  .string({ error: 'Username wajib diisi.' })
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9][a-z0-9._-]{2,31}$/,
    'Username 3 sampai 32 karakter: huruf kecil, angka, titik, garis bawah, atau strip, dan diawali huruf atau angka.',
  );

export const zPassword = z
  .string({ error: 'Password wajib diisi.' })
  .trim()
  .superRefine((value, ctx) => {
    const message = checkPasswordStrength(value);
    if (message) ctx.addIssue({ code: 'custom', message });
  });
