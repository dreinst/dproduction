import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, softDelete } from '@/lib/api';
import { requireAccess } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');

    const lead = await prisma.client.findFirst({ where: { id, deletedAt: null }, omit: { deletedAt: true } });
    if (!lead) return apiError(404, 'Lead tidak ditemukan atau sudah dihapus.');
    return NextResponse.json(lead);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');

    await softDelete(prisma.client, id);
    return NextResponse.json({ message: 'Lead dihapus.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
