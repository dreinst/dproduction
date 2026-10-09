import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { removeUnusedImages } from '@/lib/upload';
import { changedFields } from '../../workspace-events/shared';
import { MESSAGES, assertNameFree, klienSelect, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID klien tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('klien', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const klien = await prisma.klien.findUnique({ where: { id }, select: klienSelect });
    return klien ? NextResponse.json(klien) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('klien', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const data = updateSchema.parse(await readJson(req));
    const current = await prisma.klien.findUnique({ where: { id }, select: klienSelect });
    if (!current) return apiError(404, MESSAGES.P2025);
    await assertNameFree(data.name, id);
    const klien = await prisma.klien.update({ where: { id }, data, select: klienSelect });
    // Hanya nama field, tanpa isinya: sebagian klien adalah perorangan, jadi namanya termasuk data pribadi.
    const changed = changedFields(data, current);
    await audit(auth.user, 'ubah', 'Klien', id, changed.length ? `field diubah: ${changed.join(', ')}` : 'tanpa perubahan');
    revalidateLanding();
    await removeUnusedImages(current.logo);
    return NextResponse.json(klien);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('klien', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const klien = await prisma.klien.delete({ where: { id }, select: { logo: true } });
    await audit(auth.user, 'hapus', 'Klien', id);
    revalidateLanding();
    await removeUnusedImages(klien.logo);
    return NextResponse.json({ message: 'Klien dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
