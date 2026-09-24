import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { removeUnusedImages } from '@/lib/upload';
import { MESSAGES, assertAlbumExists, includeAlbum, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFoto', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID foto tidak valid.');
    const foto = await prisma.galeriFoto.findUnique({ where: { id }, include: includeAlbum });
    return foto ? NextResponse.json(foto) : apiError(404, MESSAGES.P2025);
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
    await assertAlbumExists(data.albumId);
    const before = await prisma.galeriFoto.findUnique({ where: { id }, select: { image: true } });
    const foto = await prisma.galeriFoto.update({ where: { id }, data, include: includeAlbum });
    await audit(auth.user, 'ubah', 'GaleriFoto', id, `album: ${foto.album.name}`);
    revalidateLanding();
    await removeUnusedImages(before?.image);
    return NextResponse.json(foto);
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
    const foto = await prisma.galeriFoto.delete({ where: { id }, include: includeAlbum });
    await audit(auth.user, 'hapus', 'GaleriFoto', id, `album: ${foto.album.name}`);
    revalidateLanding();
    await removeUnusedImages(foto.image);
    return NextResponse.json({ message: 'Foto dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
