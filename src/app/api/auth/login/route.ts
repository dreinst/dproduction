import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, readJson } from '@/lib/api';
import { setSessionCookie, signSession } from '@/lib/session';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isRole } from '@/lib/rbac';
import { DUMMY_PASSWORD_HASH, verifyPassword } from '@/lib/password';

const loginSchema = z.object({
  username: z.string({ error: 'Username wajib diisi.' }).trim().toLowerCase().min(1, 'Username wajib diisi.').max(100),
  // Di-trim sama dengan Produksia, karena password juga di-trim saat di-hash.
  password: z.string({ error: 'Password wajib diisi.' }).trim().min(1, 'Password wajib diisi.').max(200),
});

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
const IP_LIMIT = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;
const FAILED_MESSAGE = 'Username atau password salah.';
const LOCKED_MESSAGE = 'Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.';

export async function POST(req: Request) {
  try {
    // Tanpa IP (tidak di balik proxy) semua klien akan berbagi satu hitungan; kunci per akun tetap berlaku.
    const ip = clientIp(req);
    if (ip !== 'unknown' && !rateLimit(`login:${ip}`, IP_LIMIT, IP_WINDOW_MS)) {
      return apiError(429, 'Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam 15 menit.');
    }

    const { username, password } = loginSchema.parse(await readJson(req));
    const user = await prisma.user.findUnique({ where: { username } });

    // Username yang tidak ada diperlakukan sama: 401 empat kali lalu 429, supaya keberadaan akun tidak bisa ditebak.
    if (!user) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return rateLimit(`login-fail:${username}`, MAX_FAILED - 1, LOCK_MS)
        ? apiError(401, FAILED_MESSAGE)
        : apiError(429, LOCKED_MESSAGE);
    }

    // Jatah percobaan dipesan secara atomik sebelum password dicek, sehingga request paralel tidak bisa melewati MAX_FAILED.
    const reserved = await prisma.user.updateMany({
      where: {
        id: user.id,
        failedLogins: { lt: MAX_FAILED },
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: new Date() } }],
      },
      data: { failedLogins: { increment: 1 } },
    });
    if (reserved.count === 0) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return apiError(429, LOCKED_MESSAGE);
    }

    const usable = user.active && isRole(user.role);
    const match = await verifyPassword(password, usable ? user.passwordHash : DUMMY_PASSWORD_HASH);

    if (!usable || !match) {
      const locked = await prisma.user.updateMany({
        where: { id: user.id, failedLogins: { gte: MAX_FAILED } },
        data: { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) },
      });
      return locked.count ? apiError(429, LOCKED_MESSAGE) : apiError(401, FAILED_MESSAGE);
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });

    const token = await signSession(user);
    const res = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
    return setSessionCookie(res, token);
  } catch (error) {
    return handleRouteError(error);
  }
}
