import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect /management routes (except /management/login)
  if (path.startsWith('/management')) {
    if (path === '/management/login') {
      // If already logged in, redirect away from login page
      if (token) {
        return NextResponse.redirect(new URL('/management', request.url));
      }
      return NextResponse.next();
    }

    // Not logged in, trying to access protected route
    if (!token) {
      return NextResponse.redirect(new URL('/management/login', request.url));
    }

    let payload;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      
      const { payload: jwtPayload } = await jwtVerify(token, secret);
      payload = jwtPayload;
    } catch (e) {
      // Invalid token or signature
      return NextResponse.redirect(new URL('/management/login', request.url));
    }

    if (!payload || !payload.role) {
       return NextResponse.redirect(new URL('/management/login', request.url));
    }

    const role = payload.role as string;

    // RBAC logic
    // owner: Semua modul
    // superadmin: Semua modul operasional, kecuali Setting Login
    // admin: Master + Galeri + Workspace Event (kelola isi/gambar/event), tanpa Salary/Database/Setting
    // staff / tester: Hanya lihat Workspace Event

    if (role === 'owner') {
       return NextResponse.next();
    }

    if (role === 'superadmin') {
       if (path.startsWith('/management/setting/login')) {
          return NextResponse.redirect(new URL('/management', request.url));
       }
       return NextResponse.next();
    }

    if (role === 'admin') {
       if (
         path.startsWith('/management/workspace/salary') || 
         path.startsWith('/management/database') || 
         path.startsWith('/management/setting')
       ) {
         return NextResponse.redirect(new URL('/management', request.url));
       }
       return NextResponse.next();
    }

    if (role === 'staff' || role === 'tester') {
       if (!path.startsWith('/management/workspace/event') && path !== '/management') {
         return NextResponse.redirect(new URL('/management/workspace/event', request.url));
       }
       return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/management/:path*'],
};
