import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { INT4_MAX, handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, assertCategoryExists, createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('rentals', 'read');
    if (!auth.authorized) return auth.response;
    // Urutan sama dengan halaman katalog.
    return NextResponse.json(await prisma.rental.findMany({ orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('rentals', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    await assertCategoryExists(data.categoryId);
    // Item baru masuk di urutan paling akhir, kecuali urutannya dikirim.
    const last = (await prisma.rental.aggregate({ _max: { sortIndex: true } }))._max.sortIndex ?? 0;
    const rental = await prisma.rental.create({ data: { ...data, sortIndex: data.sortIndex ?? Math.min(last + 1, INT4_MAX) } });
    await audit(auth.user, 'tambah', 'Rental', rental.id, rental.name);
    revalidateLanding();
    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
