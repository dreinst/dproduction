import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('rentals', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.rental.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('rentals', 'write');
    if (!auth.authorized) return auth.response;
    const rental = await prisma.rental.create({ data: createSchema.parse(await readJson(req)) });
    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
