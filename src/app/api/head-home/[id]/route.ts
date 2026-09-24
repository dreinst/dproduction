import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { removeUnusedImages } from '@/lib/upload';
import { MESSAGES, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('headHome', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID gambar tidak valid.');
    const item = await prisma.headHome.findUnique({ where: { id } });
    return item ? NextResponse.json(item) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('headHome', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID gambar tidak valid.');
    const { sortIndex, ...data } = updateSchema.parse(await readJson(req));

    const [before, item] = await prisma.$transaction(async (tx) => {
      const current = await tx.headHome.findUnique({ where: { id } });
      if (sortIndex !== undefined) {
        const other = await tx.headHome.findUnique({ where: { sortIndex }, select: { id: true } });
        // Urutan hanya ditukar dengan pemiliknya. Karena unik, id terkecil diparkir di -id dulu; kunci berurutan id mencegah deadlock.
        if (current && !other) throw new HttpError(409, 'Urutan sudah berubah. Muat ulang halaman lalu coba lagi.');
        if (current && other && other.id !== id) {
          const [a, b] = [
            { id, sortIndex },
            { id: other.id, sortIndex: current.sortIndex },
          ].sort((x, y) => x.id - y.id);
          await tx.headHome.update({ where: { id: a.id }, data: { sortIndex: -a.id } });
          await tx.headHome.update({ where: { id: b.id }, data: { sortIndex: b.sortIndex } });
          await tx.headHome.update({ where: { id: a.id }, data: { sortIndex: a.sortIndex } });
        }
      }
      return [current, await tx.headHome.update({ where: { id }, data: { ...data, sortIndex } })] as const;
    }, SERIALIZABLE);
    const keys = ['image', 'title', 'caption', 'active', 'sortIndex'] as const;
    const changed = keys.filter((key) => before?.[key] !== item[key]);
    await audit(auth.user, 'ubah', 'HeadHome', id, changed.length ? changed.join(', ') : 'tanpa perubahan');
    revalidateLanding();
    await removeUnusedImages(before?.image);
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('headHome', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID gambar tidak valid.');
    const deleted = await prisma.headHome.delete({ where: { id } });
    await audit(auth.user, 'hapus', 'HeadHome', id, deleted.title ?? deleted.image);
    revalidateLanding();
    await removeUnusedImages(deleted.image);
    return NextResponse.json({ message: 'Gambar dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
