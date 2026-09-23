import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Jobdesc tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID jobdesc tidak valid.');
    const jobdesc = await prisma.jobDesc.findUnique({ where: { id } });
    return jobdesc ? NextResponse.json(jobdesc) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID jobdesc tidak valid.');
    const jobdesc = await prisma.jobDesc.update({ where: { id }, data: updateSchema.parse(await readJson(req)) });
    return NextResponse.json(jobdesc);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID jobdesc tidak valid.');
    await prisma.jobDesc.delete({ where: { id } });
    return NextResponse.json({ message: 'Jobdesc dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
