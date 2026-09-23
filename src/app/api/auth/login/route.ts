import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, readJson } from '@/lib/api';
import { setSessionCookie, signSession } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isRole } from '@/lib/rbac';

const loginSchema = z.object({
  username: z.string({ error: 'Username wajib diisi.' }).trim().toLowerCase().min(1, 'Username wajib diisi.').max(100),
  password: z.string({ error: 'Password wajib diisi.' }).min(1, 'Password wajib diisi.').max(200),
});

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
const IP_LIMIT = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;
const FAILED_MESSAGE = 'Username atau password salah.';
const LOCKED_MESSAGE = 'Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.';
// Hash bcrypt (cost 10) dari string acak, dipakai saat user tidak ada supaya waktu respons tetap setara.
const DUMMY_HASH = '$2b$10$si907M1wzpEuH1H8NAF6r.zq/OwVCiu3LBddqZuNhEboOaORQutai';

export async function POST(req: Request) {
  try {
    if (!rateLimit(`login:${clientIp(req)}`, IP_LIMIT, IP_WINDOW_MS)) {
      return apiError(429, 'Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam 15 menit.');
    }

    const { username, password } = loginSchema.parse(await readJson(req));
    const user = await prisma.user.findUnique({ where: { username } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) return apiError(429, LOCKED_MESSAGE);

    const usable = !!user && user.active && isRole(user.role);
    const match = await bcrypt.compare(password, usable ? user.passwordHash : DUMMY_HASH);

    if (!user) return apiError(401, FAILED_MESSAGE);

    if (!usable || !match) {
      const { failedLogins } = await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: { increment: 1 } },
        select: { failedLogins: true },
      });
      if (failedLogins < MAX_FAILED) return apiError(401, FAILED_MESSAGE);
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) },
      });
      return apiError(429, LOCKED_MESSAGE);
    }

    if (user.failedLogins || user.lockedUntil) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    }

    const token = await signSession(user);
    const res = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
    return setSessionCookie(res, token);
  } catch (error) {
    return handleRouteError(error);
  }
}
