import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('workspaceReports', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.workspaceReport.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('workspaceReports', 'write');
    if (!auth.authorized) return auth.response;
    const data = createSchema.parse(await readJson(req));
    return NextResponse.json(await prisma.workspaceReport.create({ data }), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
