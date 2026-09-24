import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { changedFields } from '../../workspace-events/shared';
import { MESSAGES, crewSelect, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID crew tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('crews', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const crew = await prisma.crew.findUnique({ where: { id }, select: crewSelect });
    return crew ? NextResponse.json(crew) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('crews', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const data = updateSchema.parse(await readJson(req));
    const current = await prisma.crew.findUnique({ where: { id }, select: crewSelect });
    if (!current) return apiError(404, MESSAGES.P2025);
    const crew = await prisma.crew.update({ where: { id }, data, select: crewSelect });
    // Hanya nama field, tanpa isinya, karena nama dan nomor WhatsApp crew termasuk data pribadi.
    const changed = changedFields(data, current);
    await audit(auth.user, 'ubah', 'Crew', id, changed.length ? `field diubah: ${changed.join(', ')}` : 'tanpa perubahan');
    return NextResponse.json(crew);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('crews', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await prisma.crew.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'Crew', id);
    return NextResponse.json({ message: 'Crew dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
