import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { MESSAGES, jobDescSchema, jobDescSelect } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('jobdescs', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(
      await prisma.jobDesc.findMany({ select: jobDescSelect, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('jobdescs', 'write');
    if (!auth.authorized) return auth.response;
    const jobdesc = await prisma.jobDesc.create({ data: jobDescSchema.parse(await readJson(req)), select: jobDescSelect });
    await audit(auth.user, 'tambah', 'JobDesc', jobdesc.id, jobdesc.name);
    return NextResponse.json(jobdesc, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
