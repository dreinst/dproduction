import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { removeUnusedImages } from '@/lib/upload';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Rental tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentals', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID rental tidak valid.');
    const rental = await prisma.rental.findUnique({ where: { id } });
    return rental ? NextResponse.json(rental) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentals', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID rental tidak valid.');
    const data = updateSchema.parse(await readJson(req));
    const before = await prisma.rental.findUnique({ where: { id }, select: { photo: true } });
    const rental = await prisma.rental.update({ where: { id }, data });
    await audit(auth.user, 'ubah', 'Rental', id, rental.name);
    revalidateLanding();
    await removeUnusedImages(before?.photo);
    return NextResponse.json(rental);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('rentals', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID rental tidak valid.');
    const rental = await prisma.rental.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'Rental', id, rental.name);
    revalidateLanding();
    await removeUnusedImages(rental.photo);
    return NextResponse.json({ message: 'Rental dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
