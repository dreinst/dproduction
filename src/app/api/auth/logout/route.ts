import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { AUTH_COOKIE, clearSessionCookie, verifySession } from '@/lib/auth';

export async function POST() {
  let res: NextResponse;
  try {
    const claims = await verifySession((await cookies()).get(AUTH_COOKIE)?.value);
    if (claims) {
      await prisma.user.updateMany({
        where: { id: claims.id, tokenVersion: claims.tokenVersion },
        data: { tokenVersion: { increment: 1 } },
      });
    }
    res = NextResponse.json({ message: 'Anda sudah keluar.' });
  } catch (error) {
    res = handleRouteError(error);
  }
  return clearSessionCookie(res);
}
