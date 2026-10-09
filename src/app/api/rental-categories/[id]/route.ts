import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, assertNameFree, includeCount, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID kategori tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentalCategories', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const category = await prisma.rentalCategory.findUnique({ where: { id }, include: includeCount });
    return category ? NextResponse.json(category) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentalCategories', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const data = updateSchema.parse(await readJson(req));
    await assertNameFree(data.name, id);
    const category = await prisma.rentalCategory.update({ where: { id }, data, include: includeCount });
    await audit(auth.user, 'ubah', 'RentalCategory', id, category.name);
    revalidateLanding();
    return NextResponse.json(category);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

// Kategori yang masih dipakai item ditolak. Relasinya onDelete SetNull, jadi tanpa cek ini item akan diam-diam
// kehilangan kategorinya.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentalCategories', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const category = await prisma.rentalCategory.findUnique({ where: { id }, select: { name: true, ...includeCount } });
    if (!category) return apiError(404, MESSAGES.P2025);
    const used = category._count.rentals;
    if (used) {
      return apiError(
        409,
        `Kategori ini masih dipakai ${used} item katalog. Pindahkan item itu ke kategori lain atau hapus dulu, lalu coba lagi.`,
      );
    }
    // Syarat "tanpa item" ikut di WHERE supaya item yang dipasang bersamaan tidak ikut kehilangan kategorinya.
    const { count } = await prisma.rentalCategory.deleteMany({ where: { id, rentals: { none: {} } } });
    if (!count) return apiError(409, 'Kategori ini baru saja berubah. Muat ulang halaman lalu coba lagi.');
    await audit(auth.user, 'hapus', 'RentalCategory', id, category.name);
    revalidateLanding();
    return NextResponse.json({ message: 'Kategori dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
