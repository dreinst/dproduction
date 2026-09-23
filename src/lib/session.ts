import { SignJWT, jwtVerify } from 'jose';
import type { NextResponse } from 'next/server';
import { isRole, type Role } from '@/lib/rbac';

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
