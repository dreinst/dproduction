import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const MESSAGES = { P2025: 'Video tidak ditemukan.' };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriVideo', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID video tidak valid.');
    const video = await prisma.galeriVideo.findUnique({ where: { id } });
    return video ? NextResponse.json(video) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriVideo', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID video tidak valid.');
    const video = await prisma.galeriVideo.update({ where: { id }, data: updateSchema.parse(await readJson(req)) });
    await audit(auth.user, 'ubah', 'GaleriVideo', id, video.title);
    revalidateLanding();
    return NextResponse.json(video);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriVideo', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID video tidak valid.');
    const video = await prisma.galeriVideo.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'GaleriVideo', id, video.title);
    revalidateLanding();
    return NextResponse.json({ message: 'Video dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
