import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, zPassword, zText, zUsername } from '@/lib/api';
import { API_ACCESS, ROLES, isRole, type Action, type Resource, type Role } from '@/lib/rbac';

export const AUTH_COOKIE = 'auth_token';
const SESSION_SECONDS = 60 * 60 * 24;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

// Dibaca saat dipakai, supaya build tanpa JWT_SECRET tetap jalan.
function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET belum diisi atau kurang dari 32 karakter. Isi dengan string acak minimal 32 byte.');
  }
  return new TextEncoder().encode(secret);
}

export type SessionClaims = { id: number; role: Role; tokenVersion: number };

export function signSession(user: { id: number; role: string; tokenVersion: number }) {
  return new SignJWT({ id: user.id, role: user.role, tokenVersion: user.tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'], requiredClaims: ['exp'] });
    const { id, role, tokenVersion } = payload;
    if (!Number.isInteger(id) || !isRole(role) || !Number.isInteger(tokenVersion)) return null;
    return { id: id as number, role, tokenVersion: tokenVersion as number };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(AUTH_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: SESSION_SECONDS });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}

export async function getSessionUser() {
  const claims = await verifySession((await cookies()).get(AUTH_COOKIE)?.value);
  if (!claims) return null;
  const user = await prisma.user.findUnique({
    where: { id: claims.id },
    select: { id: true, username: true, alias: true, role: true, active: true, tokenVersion: true },
  });
  if (!user || !user.active || user.tokenVersion !== claims.tokenVersion || !isRole(user.role)) return null;
  return { id: user.id, username: user.username, alias: user.alias, role: user.role, tokenVersion: user.tokenVersion };
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export function unauthorizedResponse() {
  return clearSessionCookie(apiError(401, 'Sesi Anda sudah berakhir. Silakan masuk lagi.'));
}

export function forbiddenResponse() {
  return apiError(403, 'Anda tidak punya akses untuk tindakan ini.');
}

export type AuthResult =
  | { authorized: true; response: null; user: SessionUser }
  | { authorized: false; response: NextResponse; user: SessionUser | null };

export async function requireRole(allowedRoles: readonly string[]): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) return { authorized: false, response: unauthorizedResponse(), user: null };
  if (!allowedRoles.includes(user.role)) return { authorized: false, response: forbiddenResponse(), user };
  return { authorized: true, response: null, user };
}

export function requireAccess(resource: Resource, action: Action) {
  return requireRole(API_ACCESS[resource][action]);
}

export const userSelect = { id: true, username: true, alias: true, role: true, active: true, createdAt: true } as const;

export const userFields = {
  username: zUsername,
  password: zPassword,
  alias: zText(100, 'Alias').nullable().optional(),
  role: z.enum(ROLES, { error: 'Level harus salah satu dari: owner, superadmin, admin, staff, tester.' }),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};
