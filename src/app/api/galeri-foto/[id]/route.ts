import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Foto tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID foto tidak valid.');
    const item = await prisma.galeriFoto.findUnique({ where: { id } });
    return item ? NextResponse.json(item) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID foto tidak valid.');
    const data = updateSchema.parse(await readJson(req));
    return NextResponse.json(await prisma.galeriFoto.update({ where: { id }, data }));
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID foto tidak valid.');
    await prisma.galeriFoto.delete({ where: { id } });
    return NextResponse.json({ message: 'Foto dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
