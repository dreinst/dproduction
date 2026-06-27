import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const items = await prisma.wedding.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.wedding.create({
      data: validatedData,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
