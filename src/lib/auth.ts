import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
}

export async function requireRole(allowedRoles: string[]): Promise<
  | { authorized: true; response: null; user: NonNullable<Awaited<ReturnType<typeof getUserFromToken>>> }
  | { authorized: false; response: NextResponse; user: Awaited<ReturnType<typeof getUserFromToken>> }
> {
  const user = await getUserFromToken();
  if (!user) {
    return { authorized: false, response: unauthorizedResponse(), user: null };
  }

  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, response: forbiddenResponse(), user };
  }

  return { authorized: true, response: null, user };
}
