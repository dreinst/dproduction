import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { MESSAGES, createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('gradeEvents', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.gradeEvent.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('gradeEvents', 'write');
    if (!auth.authorized) return auth.response;
    const grade = await prisma.gradeEvent.create({ data: createSchema.parse(await readJson(req)) });
    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
