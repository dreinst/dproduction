import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, readJson } from '@/lib/api';
import { setSessionCookie, signSession } from '@/lib/session';
import { clientIp, forgetHits, loginFailKey, rateLimit } from '@/lib/rate-limit';
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
    // Tanpa IP (tidak di balik proxy) semua klien akan berbagi satu hitungan, jadi batas IP dilewati; kunci per username
    // tetap berlaku. Hit IP dibatalkan lagi kalau login berhasil, jadi yang dihitung hanya percobaan gagal (sama dengan Produksia).
    const ip = clientIp(req);
    const ipKey = ip === 'unknown' ? null : `login:${ip}`;
    if (ipKey && rateLimit(ipKey, IP_LIMIT, IP_WINDOW_MS) < 0) {
      return apiError(429, 'Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam 15 menit.');
    }

    const { username, password } = loginSchema.parse(await readJson(req));

    // Username yang ada dan yang tidak ada memakai hitungan yang sama (memori, 15 menit): 401 empat kali lalu 429,
    // termasuk setelah jendela lewat atau server restart, supaya keberadaan akun tidak bisa ditebak.
    // Jatah dipesan sebelum password dicek, sehingga request paralel tidak bisa melewati MAX_FAILED.
    const failKey = loginFailKey(username);
    const left = rateLimit(failKey, MAX_FAILED, LOCK_MS);
    if (left < 0) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return apiError(429, LOCKED_MESSAGE);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    const usable = !!user && user.active && isRole(user.role);
    const match = await verifyPassword(password, usable ? user.passwordHash : DUMMY_PASSWORD_HASH);
    if (!usable || !match) return left === 0 ? apiError(429, LOCKED_MESSAGE) : apiError(401, FAILED_MESSAGE);

    forgetHits(failKey, true);
    if (ipKey) forgetHits(ipKey);

    const token = await signSession(user);
    const res = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
    return setSessionCookie(res, token);
  } catch (error) {
    return handleRouteError(error);
  }
}
