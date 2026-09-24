import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HttpError, apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { forbiddenResponse, requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';
import { assertEventRange, assertGradeExists, workspaceEventCreateSchema } from '@/lib/workspace';
import { MESSAGES } from '../../schema';

type Params = { params: Promise<{ id: string }> };

const ALREADY_CONVERTED = 'Lead ini sudah dijadikan Workspace Event.';

// Menjadikan lead Workspace Event: event dibuat, lead ditautkan dan berstatus deal dalam satu transaksi.
export async function POST(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('leads', 'write');
    if (!auth.authorized) return auth.response;
    if (!can(auth.user.role, 'workspaceEvents', 'write')) return forbiddenResponse();
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID lead tidak valid.');
    const data = workspaceEventCreateSchema.parse(await readJson(req));
    assertEventRange(data.startAt, data.endAt);

    const { workspaceEventId, previousStatus } = await prisma.$transaction(async (tx) => {
      const lead = await tx.client.findUnique({ where: { id }, select: { status: true, workspaceEventId: true } });
      if (!lead) throw new HttpError(404, MESSAGES.P2025);
      if (lead.workspaceEventId) throw new HttpError(409, ALREADY_CONVERTED);
      await assertGradeExists(tx, data.gradeEventId);
      const event = await tx.workspaceEvent.create({ data, select: { id: true } });
      // Syarat workspaceEventId null diulang di UPDATE supaya dua konversi bersamaan tidak sama-sama lolos.
      const { count } = await tx.client.updateMany({
        where: { id, workspaceEventId: null },
        data: { workspaceEventId: event.id, status: 'deal' },
      });
      if (count === 0) throw new HttpError(409, ALREADY_CONVERTED);
      return { workspaceEventId: event.id, previousStatus: lead.status };
    });

    await audit(auth.user, 'tambah', 'WorkspaceEvent', workspaceEventId, `dibuat dari lead #${id}`);
    await audit(
      auth.user,
      'ubah',
      'Client',
      id,
      `dijadikan Workspace Event #${workspaceEventId}, status ${previousStatus} menjadi deal`,
    );
    return NextResponse.json({ workspaceEventId }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
