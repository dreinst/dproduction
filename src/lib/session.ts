import { SignJWT, jwtVerify } from 'jose';
import type { NextResponse } from 'next/server';
import { isRole, type Role } from '@/lib/rbac';
import { ADMIN_BASE } from '@/lib/admin-path';

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

// Cookie "kenal": penanda peramban ini pernah berhasil masuk. Tidak memberi hak apa pun. Proxy memakainya hanya untuk
// memilih antara mengalihkan ke login (peramban admin yang sesinya habis) dan 404 (orang asing).
export const KNOWN_COOKIE = 'dpro_kenal';
const KNOWN_SECONDS = 60 * 60 * 24 * 180;

export async function setKnownCookie(res: NextResponse) {
  const token = await new SignJWT({ kenal: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${KNOWN_SECONDS}s`)
    .sign(secretKey());
  // Path dibatasi ke alamat admin supaya cookie ini tidak ikut terkirim ke halaman publik dan API.
  res.cookies.set(KNOWN_COOKIE, token, { ...COOKIE_OPTIONS, path: ADMIN_BASE, maxAge: KNOWN_SECONDS });
  return res;
}

export async function verifyKnown(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'], requiredClaims: ['exp'] });
    return payload.kenal === true;
  } catch {
    return false;
  }
}
