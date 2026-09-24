import { NextResponse, type NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { normalizeWhatsapp } from '@/lib/site';
import { leadSelect, listQuerySchema } from './schema';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAccess('leads', 'read');
    if (!auth.authorized) return auth.response;
    const { page, pageSize, status, eventType, q } = listQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );

    const where: Prisma.ClientWhereInput = { status, eventType };
    if (q) {
      const waQuery = normalizeWhatsapp(q);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        ...(/\d{4}/.test(waQuery) ? [{ whatsapp: { contains: waQuery } }] : []),
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.client.findMany({
        where,
        select: leadSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.client.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    return handleRouteError(error);
  }
}
