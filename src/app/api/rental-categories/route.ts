import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { INT4_MAX, handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, assertNameFree, createSchema, includeCount } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('rentalCategories', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(
      await prisma.rentalCategory.findMany({ include: includeCount, orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }] }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('rentalCategories', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    await assertNameFree(data.name);
    // Kategori baru masuk di urutan paling akhir, kecuali urutannya dikirim.
    const last = (await prisma.rentalCategory.aggregate({ _max: { sortIndex: true } }))._max.sortIndex ?? 0;
    const category = await prisma.rentalCategory.create({
      data: { ...data, sortIndex: data.sortIndex ?? Math.min(last + 1, INT4_MAX) },
      include: includeCount,
    });
    await audit(auth.user, 'tambah', 'RentalCategory', category.id, category.name);
    revalidateLanding();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
