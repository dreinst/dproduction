import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { MESSAGES, updateSchema } from '../schema';

type Params = { params: Promise<{ id: string }> };
const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    const item = await prisma.galeriFotoAlbum.findUnique({ where: { id } });
    return item ? NextResponse.json(item) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    const { sortIndex, ...data } = updateSchema.parse(await readJson(req));

    const item = await prisma.$transaction(async (tx) => {
      if (sortIndex !== undefined) {
        const current = await tx.galeriFotoAlbum.findUnique({ where: { id }, select: { sortIndex: true } });
        const other = await tx.galeriFotoAlbum.findUnique({ where: { sortIndex }, select: { id: true } });
        // sortIndex unik: item ini diparkir di -1 dulu, lalu bertukar urutan dengan pemilik urutan tujuan.
        if (current && other && other.id !== id) {
          await tx.galeriFotoAlbum.update({ where: { id }, data: { sortIndex: -1 } });
          await tx.galeriFotoAlbum.update({ where: { id: other.id }, data: { sortIndex: current.sortIndex } });
        }
      }
      return tx.galeriFotoAlbum.update({ where: { id }, data: { ...data, sortIndex } });
    }, SERIALIZABLE);
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID album tidak valid.');
    await prisma.galeriFotoAlbum.delete({ where: { id } });
    return NextResponse.json({ message: 'Album dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
