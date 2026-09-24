import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, clearSessionCookie, verifySession } from '@/lib/session';
import { canAccessPath, safeNextPath } from '@/lib/rbac';

const LOGIN_PATH = '/management/login';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_BODY_BYTES = 1_000_000;
// Satu-satunya API yang menerima multipart: unggah gambar, MAX_IMAGE_BYTES (5 MB) plus ruang untuk pembungkus form.
const UPLOAD_PATH = '/api/uploads';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 + 100 * 1024;

// Bentuk sama dengan respons API (success + message), termasuk untuk /api/contact publik.
const reject = (status: number, message: string) => NextResponse.json({ success: false, message }, { status });

function guardApi(request: NextRequest) {
  if (!MUTATING.has(request.method)) return NextResponse.next();

  const origin = request.headers.get('origin');
  if (origin !== null) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== request.headers.get('host')) {
      return reject(403, 'Permintaan dari situs lain ditolak.');
    }
  }

  const upload = request.nextUrl.pathname === UPLOAD_PATH;
  const lengthHeader = request.headers.get('content-length');
  const length = Number(lengthHeader ?? 0);
  // Body chunked tanpa Content-Length tidak bisa dicek ukurannya di sini; fetch dari browser selalu mengirim ukurannya.
  const tooLarge = length > (upload ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES);
  if (tooLarge || (lengthHeader === null && request.headers.has('transfer-encoding'))) {
    return reject(
      413,
      upload && tooLarge ? 'Ukuran gambar maksimal 5 MB.' : 'Data yang dikirim terlalu besar atau ukurannya tidak diketahui.',
    );
  }
  const hasBody = length > 0;
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (hasBody && type !== (upload ? 'multipart/form-data' : 'application/json')) {
    return reject(415, upload ? 'Gambar harus dikirim sebagai form multipart.' : 'Format data harus JSON.');
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
