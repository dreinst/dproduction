import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      // If already logged in, redirect away from login page
      if (token) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Not logged in, trying to access protected route
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.role) {
       // Invalid token format
       return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const role = payload.role;

    // RBAC logic
    // owner: Semua modul
    // superadmin: Semua modul operasional, kecuali Setting Login
    // admin: Master + Galeri + Workspace Event (kelola isi/gambar/event), tanpa Salary/Database/Setting
    // staff / tester: Hanya lihat Workspace Event

    if (role === 'owner') {
       return NextResponse.next();
    }

    if (role === 'superadmin') {
       if (path.startsWith('/admin/setting/login')) {
          return NextResponse.redirect(new URL('/admin', request.url));
       }
       return NextResponse.next();
    }

    if (role === 'admin') {
       if (
         path.startsWith('/admin/workspace/salary') || 
         path.startsWith('/admin/database') || 
         path.startsWith('/admin/setting')
       ) {
         return NextResponse.redirect(new URL('/admin', request.url));
       }
       return NextResponse.next();
    }

    if (role === 'staff' || role === 'tester') {
       if (!path.startsWith('/admin/workspace/event') && path !== '/admin') {
         return NextResponse.redirect(new URL('/admin/workspace/event', request.url));
       }
       return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
