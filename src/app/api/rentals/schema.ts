import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, INT4_MAX, NO_NUL, zName, zRupiah, zSortIndex, zText, zUrl } from '@/lib/api';

const CATEGORY_NOT_FOUND = 'Kategori tidak ditemukan. Pilih kategori dari daftar Kategori Katalog.';
const EXTRA_UNIT = 'Keterangan harga tambahan wajib diisi, misalnya "per 2 momen".';

// Harga selain harga utama, misalnya { amount: 2000000, unit: "per 2 momen" }. Keterangannya wajib supaya tiap
// tingkat harga bisa dibedakan di halaman katalog.
const extraPrice = z.object(
  {
    amount: zRupiah('Harga tambahan').min(1, 'Harga tambahan harus lebih dari Rp 0.'),
    unit: z
      .string({ error: EXTRA_UNIT })
      .trim()
      .min(1, EXTRA_UNIT)
      .max(50, 'Keterangan harga tambahan maksimal 50 karakter.')
      .regex(NO_NUL, 'Keterangan harga tambahan berisi karakter yang tidak valid.'),
  },
  { error: 'Tiap harga tambahan harus berisi nominal dan keterangan.' },
);

const fields = {
  name: zName('Nama item'),
  description: zText(2000, 'Deskripsi').nullable().optional(),
  // Harga utama. Kosong (null) tampil "Harga lewat WhatsApp" di situs.
  price: zRupiah('Harga').nullable().optional(),
  // Keterangan harga utama, tampil apa adanya di samping nominal: "per mesin", "300 sampai 400 shot".
  unit: zText(50, 'Keterangan harga').nullable().optional(),
  waCart: zUrl('Link WA Cart').nullable().optional(),
  photo: zUrl('Foto').nullable().optional(),
  active: z.boolean({ error: 'Status tampil harus ya atau tidak.' }),
  categoryId: z
    .number({ error: CATEGORY_NOT_FOUND })
    .int(CATEGORY_NOT_FOUND)
    .positive(CATEGORY_NOT_FOUND)
    .max(INT4_MAX, CATEGORY_NOT_FOUND)
    .nullable()
    .optional(),
  priceHidden: z.boolean({ error: 'Pilihan "Harga lewat WhatsApp saja" harus ya atau tidak.' }),
  priceFrom: z.boolean({ error: 'Penanda harga "Mulai" harus ya atau tidak.' }),
  // Daftar kosong disimpan sebagai NULL supaya bentuk kolomnya tetap satu.
  extraPrices: z
    .array(extraPrice, { error: 'Harga tambahan harus berupa daftar.' })
    .max(7, 'Satu item paling banyak punya 8 tingkat harga.')
    .nullable()
    .transform((value) => (value?.length ? value : Prisma.DbNull))
    .optional(),
  sortIndex: zSortIndex,
};

// Kolom katalog v2 semuanya opsional, jadi form lama yang hanya mengirim kolom lama tetap bisa menyimpan.
// sortIndex yang tidak dikirim diisi route supaya item baru masuk di urutan paling akhir.
export const createSchema = z.object({
  ...fields,
  active: fields.active.default(true),
  priceHidden: fields.priceHidden.default(false),
  priceFrom: fields.priceFrom.default(false),
  sortIndex: fields.sortIndex.optional(),
});
export const updateSchema = z.object(fields).partial();

// Kategori yang tidak ada ditolak assertCategoryExists dengan 400. Yang tersisa untuk foreign key (P2003) hanya kategori
// yang terhapus tepat di antara cek itu dan simpan. handleRouteError menjawab P2003 dengan 409 seperti benturan lain,
// jadi pesannya dibedakan supaya "Kategori tidak ditemukan" selalu berarti 400.
export const MESSAGES = {
  P2025: 'Item katalog tidak ditemukan.',
  P2003: 'Kategori yang dipilih baru saja dihapus. Muat ulang halaman, lalu pilih kategori lain.',
};

export async function assertCategoryExists(categoryId: number | null | undefined) {
  if (categoryId == null) return;
  const category = await prisma.rentalCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new HttpError(400, CATEGORY_NOT_FOUND);
}
