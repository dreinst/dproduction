import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcrypt';

const updateSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional().or(z.literal('')), // Optional on update
  alias: z.string().nullable().optional(),
  role: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await requireRole(['owner']);
  if (!authorized) return response;

  try {
    const json = await req.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
    }

    const { password, ...rest } = parsed.data;
    const updateData: typeof rest & { passwordHash?: string } = { ...rest };

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const { id } = await params;
    const data = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        alias: true,
        role: true,
        active: true,
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { authorized, response } = await requireRole(['owner']);
  if (!authorized) return response;

  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
