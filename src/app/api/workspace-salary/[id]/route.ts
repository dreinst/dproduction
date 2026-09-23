import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson, softDelete, updateActive } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID salary tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceSalary', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const item = await prisma.workspaceSalary.findFirst({ where: { id, deletedAt: null } });
    return item ? NextResponse.json(item) : apiError(404, 'Data salary tidak ditemukan.');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceSalary', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await updateActive(prisma.workspaceSalary, id, updateSchema.parse(await readJson(req)));
    return NextResponse.json({ message: 'Perubahan salary disimpan.' });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceSalary', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await softDelete(prisma.workspaceSalary, id);
    return NextResponse.json({ message: 'Data salary dihapus.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
