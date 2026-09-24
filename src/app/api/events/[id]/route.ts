import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Event tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('events', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    const event = await prisma.event.findUnique({ where: { id } });
    return event ? NextResponse.json(event) : apiError(404, MESSAGES.P2025);
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
    const event = await prisma.event.update({ where: { id }, data: updateSchema.parse(await readJson(req)) });
    await audit(auth.user, 'ubah', 'Event', id, event.name);
    revalidateLanding();
    return NextResponse.json(event);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('events', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    const event = await prisma.event.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'Event', id, event.name);
    revalidateLanding();
    return NextResponse.json({ message: 'Event dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
