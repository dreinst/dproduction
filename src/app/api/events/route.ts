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

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: validatedData,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
