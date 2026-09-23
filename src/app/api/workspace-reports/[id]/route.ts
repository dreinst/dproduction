import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID report tidak valid.';
const MESSAGES = { P2025: 'Report tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceReports', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const item = await prisma.workspaceReport.findUnique({ where: { id } });
    return item ? NextResponse.json(item) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceReports', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const data = updateSchema.parse(await readJson(req));
    return NextResponse.json(await prisma.workspaceReport.update({ where: { id }, data }));
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

// Tabel report belum punya deletedAt, jadi hapus di sini permanen.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceReports', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    await prisma.workspaceReport.delete({ where: { id } });
    return NextResponse.json({ message: 'Report dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
