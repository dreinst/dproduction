import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';
import { assertEventRange, assertGradeExists, workspaceEventUpdateSchema } from '@/lib/workspace';
import { changedFields, eventSelect } from '../shared';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID event tidak valid.';
const NOT_FOUND = 'Event tidak ditemukan.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const item = await prisma.workspaceEvent.findUnique({ where: { id }, select: eventSelect(auth.user.role) });
    return item ? NextResponse.json(item) : apiError(404, NOT_FOUND);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const data = workspaceEventUpdateSchema.parse(await readJson(req));
    const current = await prisma.workspaceEvent.findUnique({ where: { id } });
    if (!current) return apiError(404, NOT_FOUND);
    assertEventRange(data.startAt ?? current.startAt, data.endAt === undefined ? current.endAt : data.endAt);
    await assertGradeExists(prisma, data.gradeEventId);
    const item = await prisma.workspaceEvent.update({ where: { id }, data, select: eventSelect(auth.user.role) });
    const changed = changedFields(data, current);
    const summary = [
      data.status && data.status !== current.status ? `status ${current.status} menjadi ${data.status}` : null,
      changed.length ? `field diubah: ${changed.join(', ')}` : 'tanpa perubahan',
    ];
    await audit(auth.user, 'ubah', 'WorkspaceEvent', id, summary.filter(Boolean).join('; '));
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error, { P2025: NOT_FOUND, P2003: 'Level event (Grade Event) tidak ditemukan.' });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const current = await prisma.workspaceEvent.findUnique({ where: { id }, select: { adminStatus: true } });
    if (!current) return apiError(404, NOT_FOUND);
    // Report (status administrasi dan catatannya) khusus Pemilik dan Super Admin, jadi role lain hanya bisa menghapus
    // event yang Report-nya masih kosong. Syaratnya ikut di WHERE supaya Report yang diisi bersamaan tidak ikut terhapus.
    const ownsReport = can(auth.user.role, 'reports', 'write');
    const { count } = await prisma.workspaceEvent.deleteMany({
      where: ownsReport ? { id } : { id, adminStatus: 'belum', OR: [{ adminNote: null }, { adminNote: '' }] },
    });
    if (!count) {
      return ownsReport
        ? apiError(404, NOT_FOUND)
        : apiError(
            403,
            'Event ini sudah punya status administrasi atau catatan di Report, jadi hanya Pemilik atau Super Admin yang bisa menghapusnya.',
          );
    }
    await audit(auth.user, 'hapus', 'WorkspaceEvent', id, `status administrasi ${current.adminStatus}`);
    return NextResponse.json({ message: 'Event dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, {
      P2025: NOT_FOUND,
      P2003: 'Event masih punya crew bertugas. Lepas crew-nya dulu atau ubah status menjadi Batal.',
    });
  }
}
