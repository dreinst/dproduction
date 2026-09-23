import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { KANTOR_ID, kantorSchema } from './schema';

const EMPTY = { id: KANTOR_ID, ...Object.fromEntries(Object.keys(kantorSchema.shape).map((key) => [key, null])) };

export async function GET() {
  try {
    const auth = await requireAccess('kantorSettings', 'read');
    if (!auth.authorized) return auth.response;
    const settings = await prisma.kantorSetting.findUnique({ where: { id: KANTOR_ID } });
    return NextResponse.json([settings ?? EMPTY]);
  } catch (error) {
    return handleRouteError(error);
  }
}
