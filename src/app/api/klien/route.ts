import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, assertNameFree, createSchema, klienSelect } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('klien', 'read');
    if (!auth.authorized) return auth.response;
    // Urutan sama dengan pita logo di beranda.
    return NextResponse.json(await prisma.klien.findMany({ select: klienSelect, orderBy: { id: 'asc' } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('klien', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    await assertNameFree(data.name);
    const klien = await prisma.klien.create({ data, select: klienSelect });
    // Tanpa nama: sebagian klien adalah perorangan, jadi namanya termasuk data pribadi.
    await audit(auth.user, 'tambah', 'Klien', klien.id, klien.active ? 'aktif' : 'nonaktif');
    revalidateLanding();
    return NextResponse.json(klien, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
