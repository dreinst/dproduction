import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE, KNOWN_COOKIE, clearSessionCookie, verifyKnown, verifySession } from '@/lib/session';
import { canAccessPath, safeNextPath } from '@/lib/rbac';
import { ADMIN_BASE, ADMIN_DALAM, ADMIN_LOGIN, isAdminPath, isInnerPath } from '@/lib/admin-path';

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

// Halaman admin tinggal di folder dalam (ADMIN_DALAM), sedangkan alamat yang diketik admin (ADMIN_BASE) tidak punya
// folder rute. Alamat itu baru hidup lewat rewrite di bawah, dan rewrite hanya diberikan kepada sesi yang sah serta
// halaman login. Untuk orang lain permintaan diteruskan apa adanya, jadi Next menjawab dengan 404 biasa: status,
// header, dan isinya sama dengan alamat mana pun yang memang tidak ada, baik untuk dokumen, RSC, maupun prefetch.
// Jangan menukar arah ini menjadi "rewrite orang asing ke path kosong": Next menambahkan header x-middleware-rewrite
// (dan x-nextjs-rewritten-path untuk RSC) pada setiap rewrite, sehingga alamat admin bisa dikenali.
function bukaAdmin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = ADMIN_DALAM + url.pathname.slice(ADMIN_BASE.length);
  const res = NextResponse.rewrite(url);
  // Dipasang di sini, bukan di headers() next.config.ts: aturan header per path di sana ikut terkirim pada jawaban 404.
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  // Kerangka halaman admin di-prerender, jadi tanpa ini Next mengirim s-maxage dan cache bersama boleh menyimpannya.
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/api/')) return guardApi(request);
  // Folder dalam tidak boleh dibuka lewat alamatnya sendiri oleh siapa pun, juga oleh sesi yang sah.
  if (isInnerPath(pathname)) return NextResponse.rewrite(new URL('/_tidak-ada', request.url));
  if (!isAdminPath(pathname)) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = await verifySession(token);

  if (pathname === ADMIN_LOGIN) {
    if (session) {
      const next = safeNextPath(request.nextUrl.searchParams.get('next')) ?? ADMIN_BASE;
      return NextResponse.redirect(new URL(next, request.url));
    }
    const res = bukaAdmin(request);
    return token ? clearSessionCookie(res) : res;
  }

  if (!session) {
    // Orang asing: diteruskan tanpa diubah. Jangan memasang header atau cookie apa pun pada jawaban ini.
    if (!(await verifyKnown(request.cookies.get(KNOWN_COOKIE)?.value))) return NextResponse.next();
    // Peramban yang pernah masuk (cookie kenal sah) dialihkan ke login, supaya sesi yang habis tidak berujung di 404.
    const login = new URL(ADMIN_LOGIN, request.url);
    login.searchParams.set('next', pathname + search);
    login.searchParams.set('expired', '1');
    const res = NextResponse.redirect(login);
    return token ? clearSessionCookie(res) : res;
  }

  if (!canAccessPath(session.role, pathname)) return NextResponse.redirect(new URL(ADMIN_BASE, request.url));
  return bukaAdmin(request);
}

export const config = {
  // Sengaja tidak menyebut alamat admin: isi matcher ikut terbit di berkas publik
  // /_next/static/<buildId>/_clientMiddlewareManifest.js. Yang dikecualikan hanya berkas statis Next dan berkas
  // metadata di akar situs (anjuran dokumentasi Next untuk proxy). Kalau daftar pengecualian ini diubah, salin juga ke
  // SKIPPED_BY_PROXY di src/lib/admin-path.ts.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|opengraph-image|twitter-image|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};
