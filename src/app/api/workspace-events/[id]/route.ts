import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  jobDesc: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  client: z.string().min(1),
  status: z.string().default('running'),
  waktu: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  deskripsi: z.string().nullable().optional(),
  linkFoto: z.string().nullable().optional(),
  linkVideo: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    const item = await prisma.workspaceEvent.findUnique({
      where: { id },
    });
    
    if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    const item = await prisma.workspaceEvent.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  const id = parseInt((await params).id);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.workspaceEvent.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
