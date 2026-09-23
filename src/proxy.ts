import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, clearSessionCookie, verifySession } from '@/lib/session';
import { canAccessPath, safeNextPath } from '@/lib/rbac';

const LOGIN_PATH = '/management/login';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_BODY_BYTES = 1_000_000;

function guardApi(request: NextRequest) {
  if (!MUTATING.has(request.method)) return NextResponse.next();

  const origin = request.headers.get('origin');
  if (origin !== null) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== request.headers.get('host')) {
      return NextResponse.json({ message: 'Permintaan dari situs lain ditolak.' }, { status: 403 });
    }
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ message: 'Data yang dikirim terlalu besar.' }, { status: 413 });
  }
  const hasBody = length > 0 || request.headers.has('transfer-encoding');
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (hasBody && type !== 'application/json') {
    return NextResponse.json({ message: 'Format data harus JSON.' }, { status: 415 });
  }
  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/api/')) return guardApi(request);

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = await verifySession(token);

  if (pathname === LOGIN_PATH) {
    if (session) {
      const next = safeNextPath(request.nextUrl.searchParams.get('next')) ?? '/management';
      return NextResponse.redirect(new URL(next, request.url));
    }
    return token ? clearSessionCookie(NextResponse.next()) : NextResponse.next();
  }

  if (!session) {
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set('next', pathname + search);
    if (token) login.searchParams.set('expired', '1');
    const res = NextResponse.redirect(login);
    return token ? clearSessionCookie(res) : res;
  }

  if (!canAccessPath(session.role, pathname)) {
    return NextResponse.redirect(new URL('/management', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/management/:path*', '/api/:path*'],
};
