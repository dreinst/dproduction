import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson, softDelete, updateActive } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID event tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const item = await prisma.workspaceEvent.findFirst({ where: { id, deletedAt: null } });
    return item ? NextResponse.json(item) : apiError(404, 'Event tidak ditemukan.');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await updateActive(prisma.workspaceEvent, id, updateSchema.parse(await readJson(req)));
    return NextResponse.json({ message: 'Perubahan event disimpan.' });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await softDelete(prisma.workspaceEvent, id);
    return NextResponse.json({ message: 'Event dihapus.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
