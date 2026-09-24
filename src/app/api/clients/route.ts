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
      // Prisma tidak meng-escape wildcard LIKE, jadi % dan _ di kata pencarian dicocokkan apa adanya lewat backslash.
      const literal = (value: string) => value.replace(/[\\%_]/g, '\\$&');
      const waQuery = normalizeWhatsapp(q);
      where.OR = [
        { name: { contains: literal(q), mode: 'insensitive' } },
        { message: { contains: literal(q), mode: 'insensitive' } },
        ...(/\d{4}/.test(waQuery) ? [{ whatsapp: { contains: literal(waQuery) } }] : []),
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
