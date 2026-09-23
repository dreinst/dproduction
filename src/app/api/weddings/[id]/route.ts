import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson, softDelete, updateActive } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    const wedding = await prisma.wedding.findFirst({ where: { id, deletedAt: null } });
    return wedding ? NextResponse.json(wedding) : apiError(404, 'Wedding tidak ditemukan atau sudah dihapus.');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    await updateActive(prisma.wedding, id, updateSchema.parse(await readJson(req)));
    return NextResponse.json(await prisma.wedding.findUnique({ where: { id } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    await softDelete(prisma.wedding, id);
    return NextResponse.json({ message: 'Wedding dihapus.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
