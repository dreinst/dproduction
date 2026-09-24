import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    const album = await prisma.galeriAlbum.findUnique({ where: { id } });
    return album ? NextResponse.json(album) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    const album = await prisma.galeriAlbum.update({ where: { id }, data: updateSchema.parse(await readJson(req)) });
    await audit(auth.user, 'ubah', 'GaleriAlbum', id, album.name);
    revalidateLanding();
    return NextResponse.json(album);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

// Foto memakai onDelete Restrict, jadi album yang masih berisi foto ditolak dengan 409 (MESSAGES.P2003).
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    const album = await prisma.galeriAlbum.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'GaleriAlbum', id, album.name);
    revalidateLanding();
    return NextResponse.json({ message: 'Album dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
