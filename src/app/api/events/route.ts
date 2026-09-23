import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('events', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(
      await prisma.event.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('events', 'write');
    if (!auth.authorized) return auth.response;
    const event = await prisma.event.create({ data: createSchema.parse(await readJson(req)) });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
