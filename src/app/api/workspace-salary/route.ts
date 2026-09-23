import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('workspaceSalary', 'read');
    if (!auth.authorized) return auth.response;
    const items = await prisma.workspaceSalary.findMany({ where: { deletedAt: null }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    return NextResponse.json(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('workspaceSalary', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    return NextResponse.json(await prisma.workspaceSalary.create({ data }), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
