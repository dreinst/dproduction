import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
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
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    
    return NextResponse.json(event);
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
    const validatedData = eventSchema.parse(body);

    const event = await prisma.event.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(event);
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
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
