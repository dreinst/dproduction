import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess, userFields, userSelect } from '@/lib/auth';
import { setSessionCookie, signSession } from '@/lib/session';

const updateSchema = z.object(userFields).partial();
const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };
const MESSAGES = { P2002: 'Username sudah dipakai akun lain.', P2025: 'User tidak ditemukan.' };

type Params = { params: Promise<{ id: string }> };

async function ensureActiveOwnerLeft(tx: Prisma.TransactionClient) {
  if ((await tx.user.count({ where: { role: 'owner', active: true } })) === 0) {
    throw new HttpError(409, 'Harus ada minimal satu owner aktif. Tambahkan owner lain lebih dulu.');
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('users', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID user tidak valid.');

    const { password, ...data } = updateSchema.parse(await readJson(req));
    const self = id === auth.user.id;
    if (self && ((data.role && data.role !== auth.user.role) || data.active === false)) {
      return apiError(403, 'Anda tidak bisa menurunkan level atau menonaktifkan akun sendiri.');
    }
    const passwordHash = password === undefined ? undefined : await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id }, select: { role: true, active: true } });
      if (!current) throw new HttpError(404, 'User tidak ditemukan.');
      const revoke =
        passwordHash !== undefined ||
        (data.role !== undefined && data.role !== current.role) ||
        (data.active !== undefined && data.active !== current.active);
      const updated = await tx.user.update({
        where: { id },
        data: {
          ...data,
          passwordHash,
          ...(revoke && { tokenVersion: { increment: 1 } }),
          // Owner membuka kunci akun dengan mengganti password atau mengaktifkan ulang user.
          ...((passwordHash !== undefined || data.active === true) && { failedLogins: 0, lockedUntil: null }),
        },
        select: { ...userSelect, tokenVersion: true },
      });
      if (current.role === 'owner' && current.active) await ensureActiveOwnerLeft(tx);
      return updated;
    }, SERIALIZABLE);

    const { tokenVersion, ...body } = user;
    const res = NextResponse.json(body);
    // Ganti password sendiri memutus sesi lain, sesi yang sedang dipakai diberi token baru.
    return self && passwordHash ? setSessionCookie(res, await signSession({ id, role: user.role, tokenVersion })) : res;
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('users', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID user tidak valid.');
    if (id === auth.user.id) return apiError(403, 'Anda tidak bisa menghapus akun sendiri.');

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id } });
      await ensureActiveOwnerLeft(tx);
    }, SERIALIZABLE);
    return NextResponse.json({ message: 'User dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
