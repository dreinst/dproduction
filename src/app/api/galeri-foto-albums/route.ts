import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { MESSAGES, createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.galeriFotoAlbum.findMany({ orderBy: [{ sortIndex: 'asc' }, { id: 'asc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    // POST bersamaan bisa menghitung urutan yang sama; yang kalah di unique index mengulang dengan urutan terbaru.
    for (let attempt = 1; ; attempt++) {
      const { _max } = await prisma.galeriFotoAlbum.aggregate({ _max: { sortIndex: true } });
      try {
        const item = await prisma.galeriFotoAlbum.create({ data: { ...data, sortIndex: (_max.sortIndex ?? 0) + 1 } });
        return NextResponse.json(item, { status: 201 });
      } catch (error) {
        const conflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!conflict || attempt === 20) throw error;
      }
    }
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
