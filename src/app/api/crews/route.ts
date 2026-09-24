import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { MESSAGES, createSchema, crewSelect } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('crews', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.crew.findMany({ select: crewSelect, orderBy: [{ name: 'asc' }, { id: 'asc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('crews', 'write');
    if (!auth.authorized) return auth.response;
    const crew = await prisma.crew.create({ data: createSchema.parse(await readJson(req)), select: crewSelect });
    await audit(auth.user, 'tambah', 'Crew', crew.id, crew.active ? 'aktif' : 'nonaktif');
    return NextResponse.json(crew, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
