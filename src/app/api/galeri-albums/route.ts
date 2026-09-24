import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { MESSAGES, createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('galeriFoto', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.galeriAlbum.findMany({ orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('galeriFoto', 'write');
    if (!auth.authorized) return auth.response;
    const album = await prisma.galeriAlbum.create({ data: createSchema.parse(await readJson(req)) });
    await audit(auth.user, 'tambah', 'GaleriAlbum', album.id, album.name);
    revalidateLanding();
    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
