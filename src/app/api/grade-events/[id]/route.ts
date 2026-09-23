import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { MESSAGES, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('gradeEvents', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID grade tidak valid.');
    const grade = await prisma.gradeEvent.findUnique({ where: { id } });
    return grade ? NextResponse.json(grade) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('gradeEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID grade tidak valid.');
    const grade = await prisma.gradeEvent.update({ where: { id }, data: updateSchema.parse(await readJson(req)) });
    return NextResponse.json(grade);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('gradeEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID grade tidak valid.');
    await prisma.gradeEvent.delete({ where: { id } });
    return NextResponse.json({ message: 'Grade dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
