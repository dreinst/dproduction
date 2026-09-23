import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson, softDelete, updateActive } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('events', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    const event = await prisma.event.findFirst({ where: { id, deletedAt: null } });
    return event ? NextResponse.json(event) : apiError(404, 'Event tidak ditemukan atau sudah dihapus.');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('events', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    await updateActive(prisma.event, id, updateSchema.parse(await readJson(req)));
    return NextResponse.json(await prisma.event.findUnique({ where: { id } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('events', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    await softDelete(prisma.event, id);
    return NextResponse.json({ message: 'Event dihapus.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
