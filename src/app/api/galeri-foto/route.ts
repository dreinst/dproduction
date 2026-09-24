import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, assertAlbumExists, createSchema, includeAlbum } from './schema';

// ?albumId=... membatasi daftar ke satu album.
export async function GET(req: Request) {
  try {
    const auth = await requireAccess('galeriFoto', 'read');
    if (!auth.authorized) return auth.response;
    const rawAlbumId = new URL(req.url).searchParams.get('albumId');
    const albumId = rawAlbumId === null ? undefined : parseId(rawAlbumId);
    if (albumId === null) return apiError(400, 'ID album tidak valid.');
    return NextResponse.json(
      await prisma.galeriFoto.findMany({
        where: { albumId },
        include: includeAlbum,
        orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }],
      }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    await assertAlbumExists(data.albumId);
    const foto = await prisma.galeriFoto.create({ data, include: includeAlbum });
    await audit(auth.user, 'tambah', 'GaleriFoto', foto.id, `album: ${foto.album.name}`);
    revalidateLanding();
    return NextResponse.json(foto, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
