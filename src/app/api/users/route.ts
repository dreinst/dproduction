import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserFromToken, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcrypt';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(6), // Required on create
  alias: z.string().nullable().optional(),
  role: z.string().default('admin'),
  active: z.boolean().default(true),
});

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();
  // Only superusers or admin can view users? Let's just let authenticated users view for now.
  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        alias: true,
        role: true,
        active: true,
        createdAt: true,
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return unauthorizedResponse();

  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
    }

    const { password, ...rest } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const data = await prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        alias: true,
        role: true,
        active: true,
      }
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
