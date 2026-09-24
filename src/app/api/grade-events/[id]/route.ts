import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
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
    await audit(auth.user, 'ubah', 'GradeEvent', id, grade.grade);
    return NextResponse.json(grade);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

// Tarif grade ini ikut terhapus (cascade); Workspace Event yang memakai grade ini membuat hapus ditolak 409.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('gradeEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID grade tidak valid.');
    const grade = await prisma.gradeEvent.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'GradeEvent', id, grade.grade);
    return NextResponse.json({ message: 'Grade dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
