import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
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

    const item = await prisma.$transaction(async (tx) => {
      if (sortIndex !== undefined) {
        const current = await tx.headHome.findUnique({ where: { id }, select: { sortIndex: true } });
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
      return tx.headHome.update({ where: { id }, data: { ...data, sortIndex } });
    }, SERIALIZABLE);
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
    await prisma.headHome.delete({ where: { id } });
    return NextResponse.json({ message: 'Gambar dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
