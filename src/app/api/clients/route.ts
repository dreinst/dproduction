import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAccess('leads', 'read');
    if (!auth.authorized) return auth.response;
    const leads = await prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      omit: { deletedAt: true },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return handleRouteError(error);
  }
}
