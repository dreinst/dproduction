import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(1),
  date: z.number().int(),
  month: z.string().min(1),
  time: z.string().min(1),
  client: z.string().min(1),
  status: z.string().default('admin'),
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
    const item = await prisma.workspaceReport.findUnique({
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

    const item = await prisma.workspaceReport.update({
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
    await prisma.workspaceReport.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
