import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { removeUnusedImages } from '@/lib/upload';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Wedding tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    const wedding = await prisma.wedding.findUnique({ where: { id } });
    return wedding ? NextResponse.json(wedding) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    const data = updateSchema.parse(await readJson(req));
    const before = await prisma.wedding.findUnique({ where: { id }, select: { photo: true } });
    const wedding = await prisma.wedding.update({ where: { id }, data });
    await audit(auth.user, 'ubah', 'Wedding', id, wedding.name);
    revalidateLanding();
    await removeUnusedImages(before?.photo);
    return NextResponse.json(wedding);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('weddings', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID wedding tidak valid.');
    const wedding = await prisma.wedding.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'Wedding', id, wedding.name);
    revalidateLanding();
    await removeUnusedImages(wedding.photo);
    return NextResponse.json({ message: 'Wedding dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
