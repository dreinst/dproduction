import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { WORKSPACE_EVENT_STATUS, type WorkspaceEventStatus } from '@/lib/rbac';
import { assertEventRange, assertGradeExists, workspaceEventCreateSchema } from '@/lib/workspace';
import { eventSelect } from './shared';

const isStatus = (value: string): value is WorkspaceEventStatus =>
  (WORKSPACE_EVENT_STATUS as readonly string[]).includes(value);

export async function GET(req: Request) {
  try {
    const auth = await requireAccess('workspaceEvents', 'read');
    if (!auth.authorized) return auth.response;
    const status = new URL(req.url).searchParams.get('status');
    if (status !== null && !isStatus(status)) {
      return apiError(400, 'Status harus berjalan, selesai, batal, atau ditunda.');
    }
    const items = await prisma.workspaceEvent.findMany({
      where: status === null ? undefined : { status },
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      select: eventSelect(auth.user.role),
    });
    return NextResponse.json(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const data = workspaceEventCreateSchema.parse(await readJson(req));
    assertEventRange(data.startAt, data.endAt);
    await assertGradeExists(prisma, data.gradeEventId);
    const item = await prisma.workspaceEvent.create({ data, select: eventSelect(auth.user.role) });
    await audit(auth.user, 'tambah', 'WorkspaceEvent', item.id, `status ${item.status}`);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    // Satu-satunya rujukan saat membuat event adalah level; kalau grade terhapus bersamaan, pesannya sama dengan cek di atas.
    return handleRouteError(error, { P2003: 'Level event (Grade Event) tidak ditemukan.' });
  }
}
