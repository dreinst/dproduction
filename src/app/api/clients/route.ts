import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(1),
  whatsapp: z.string().min(1),
  eventType: z.string().min(1),
  message: z.string().min(1),
});

export async function GET() {
  const { authorized, response } = await requireRole(['owner','superadmin','admin']);
  if (!authorized) return response;

  try {
    const items = await prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { authorized, response } = await requireRole(['owner','superadmin','admin']);
  if (!authorized) return response;

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.client.create({
      data: validatedData,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
