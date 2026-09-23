import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

const schema = z.object({
  url: z.string().min(1),
  active: z.boolean().default(true),
});

export async function GET() {
  const { authorized, response } = await requireRole(['owner','superadmin','admin']);
  if (!authorized) return response;

  try {
    const items = await prisma.galeriVideo.findMany({
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

    const item = await prisma.galeriVideo.create({
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
