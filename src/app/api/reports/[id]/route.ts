import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { patchSchema, reportSelect } from '../schema';

type Params = { params: Promise<{ id: string }> };
const NOT_FOUND = 'Event tidak ditemukan.';

// id = WorkspaceEvent. Hanya status administrasi dan catatannya yang bisa diubah di sini.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('reports', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');
    const data = patchSchema.parse(await readJson(req));
    const current = await prisma.workspaceEvent.findUnique({
      where: { id },
      select: { adminStatus: true, adminNote: true },
    });
    if (!current) return apiError(404, NOT_FOUND);
    const item = await prisma.workspaceEvent.update({ where: { id }, data, select: reportSelect });

    const summary = [
      data.adminStatus && data.adminStatus !== current.adminStatus
        ? `status administrasi ${current.adminStatus} menjadi ${data.adminStatus}`
        : null,
      data.adminNote !== undefined && (data.adminNote ?? null) !== current.adminNote ? 'catatan administrasi diubah' : null,
    ].filter(Boolean);
    await audit(auth.user, 'ubah', 'WorkspaceEvent', id, summary.length ? summary.join('; ') : 'tanpa perubahan');
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error, { P2025: NOT_FOUND });
  }
}
