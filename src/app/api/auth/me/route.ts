import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api';
import { getSessionUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    return NextResponse.json({ user: { id: user.id, username: user.username, alias: user.alias, role: user.role } });
  } catch (error) {
    return handleRouteError(error);
  }
}
