import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { audit } from '@/lib/audit';
import { requireAccess, userFields, userSelect } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { OWNERS } from '@/lib/rbac';
import { setSessionCookie, signSession } from '@/lib/session';

const updateSchema = z.object(userFields).partial();
const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable };
const MESSAGES = { P2002: 'Username sudah dipakai akun lain.', P2025: 'User tidak ditemukan.' };

type Params = { params: Promise<{ id: string }> };

// Owner (Pemilik) dan Super Admin setara, jadi yang dijaga adalah jumlah gabungan keduanya.
async function ensureTopAccountLeft(tx: Prisma.TransactionClient) {
  if ((await tx.user.count({ where: { role: { in: [...OWNERS] }, active: true } })) === 0) {
    throw new HttpError(409, 'Harus tersisa minimal satu akun Pemilik atau Super Admin yang aktif.');
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
      return apiError(403, 'Anda tidak bisa mengubah level atau menonaktifkan akun sendiri. Minta Pemilik atau Super Admin lain.');
    }
    const passwordHash = password === undefined ? undefined : await hashPassword(password);

    const { user, changes } = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id },
        select: { username: true, alias: true, role: true, active: true, lockedUntil: true },
      });
      if (!current) throw new HttpError(404, 'User tidak ditemukan.');
      const unlock = passwordHash !== undefined || data.active === true;
      const changes = [
        data.username !== undefined && data.username !== current.username && `username ${current.username} menjadi ${data.username}`,
        data.alias !== undefined && data.alias !== current.alias && 'nama lengkap diubah',
        data.role !== undefined && data.role !== current.role && `level ${current.role} menjadi ${data.role}`,
        data.active !== undefined && data.active !== current.active && (data.active ? 'diaktifkan' : 'dinonaktifkan'),
        passwordHash !== undefined && 'password diganti',
        unlock && current.lockedUntil && current.lockedUntil > new Date() && 'kunci login dibuka',
      ].filter((change): change is string => !!change);
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
          // Pemilik atau Super Admin membuka kunci akun dengan mengganti password atau mengaktifkan ulang user.
          ...(unlock && { failedLogins: 0, lockedUntil: null }),
        },
        select: { ...userSelect, tokenVersion: true },
      });
      if ((OWNERS as readonly string[]).includes(current.role) && current.active) await ensureTopAccountLeft(tx);
      return { user: updated, changes };
    }, SERIALIZABLE);

    if (changes.length) await audit(auth.user, 'ubah', 'User', id, changes.join(', '));
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

    const deleted = await prisma.$transaction(async (tx) => {
      const user = await tx.user.delete({ where: { id }, select: { username: true, role: true } });
      await ensureTopAccountLeft(tx);
      return user;
    }, SERIALIZABLE);
    await audit(auth.user, 'hapus', 'User', id, `akun ${deleted.username} level ${deleted.role}`);
    return NextResponse.json({ message: 'User dihapus.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
