import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { audit } from '@/lib/audit';
import { requireAccess, userFields, userSelect } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

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
      data: { ...data, passwordHash: await hashPassword(password) },
      select: userSelect,
    });
    await audit(auth.user, 'tambah', 'User', user.id, `akun ${user.username} level ${user.role}${user.active ? '' : ', nonaktif'}`);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleRouteError(error, { P2002: 'Username sudah dipakai akun lain.' });
  }
}
