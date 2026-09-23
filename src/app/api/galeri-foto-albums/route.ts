import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { MESSAGES, createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.galeriFotoAlbum.findMany({ orderBy: { sortIndex: 'asc' } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('galeriFotoAlbums', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    const { _max } = await prisma.galeriFotoAlbum.aggregate({ _max: { sortIndex: true } });
    const item = await prisma.galeriFotoAlbum.create({ data: { ...data, sortIndex: (_max.sortIndex ?? 0) + 1 } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
