import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';

// Pilihan penanggung jawab lead: user aktif, label alias atau username.
export async function GET() {
  try {
    const auth = await requireAccess('leads', 'read');
    if (!auth.authorized) return auth.response;
    const users = await prisma.user.findMany({
      where: { active: true },
      select: { id: true, alias: true, username: true },
    });
    const options = users
      .map((user) => ({ id: user.id, label: user.alias?.trim() || user.username }))
      .sort((a, b) => a.label.localeCompare(b.label, 'id') || a.id - b.id);
    return NextResponse.json(options);
  } catch (error) {
    return handleRouteError(error);
  }
}
