import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { revalidateLanding } from '@/lib/revalidate';
import { createSchema } from './schema';

export async function GET() {
  try {
    const auth = await requireAccess('events', 'read');
    if (!auth.authorized) return auth.response;
    // Urutan sama dengan section Masterpiece: tahun terbaru dulu, event tanpa tahun paling akhir.
    return NextResponse.json(
      await prisma.event.findMany({ orderBy: [{ year: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }] }),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('events', 'write');
    if (!auth.authorized) return auth.response;
    const event = await prisma.event.create({ data: createSchema.parse(await readJson(req)) });
    await audit(auth.user, 'tambah', 'Event', event.id, event.name);
    revalidateLanding();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
