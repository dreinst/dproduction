import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { AUTH_COOKIE, clearSessionCookie, verifySession } from '@/lib/session';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, zPassword, zText, zUsername } from '@/lib/api';
import { API_ACCESS, ROLES, isRole, type Action, type Resource } from '@/lib/rbac';

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
  alias: zText(100, 'Nama lengkap').nullable().optional(),
  role: z.enum(ROLES, { error: 'Level harus salah satu dari: owner, superadmin, admin, staff, tester.' }),
  active: z.boolean({ error: 'Status aktif harus ya atau tidak.' }),
};
