import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess, userFields, userSelect } from '@/lib/auth';

const createSchema = z.object({ ...userFields, active: userFields.active.default(true) });

export async function GET() {
  try {
    const auth = await requireAccess('users', 'read');
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await prisma.user.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: userSelect }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('users', 'write');
    if (!auth.authorized) return auth.response;
    const { password, ...data } = createSchema.parse(await readJson(req));
    const user = await prisma.user.create({
      data: { ...data, passwordHash: await bcrypt.hash(password, 10) },
      select: userSelect,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleRouteError(error, { P2002: 'Username sudah dipakai akun lain.' });
  }
}
