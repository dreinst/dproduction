import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  album: z.string().min(1),
  keterangan: z.string().nullable().optional(),
  tanggal: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortIndex: z.number().int().default(0),
});

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const items = await prisma.galeriFotoAlbum.findMany({
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

    const item = await prisma.galeriFotoAlbum.create({
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
