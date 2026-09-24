import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { patchSchema, salarySelect } from '../schema';

type Params = { params: Promise<{ id: string }> };
const NOT_FOUND = 'Penugasan tidak ditemukan.';

// id = Assignment. Mengubah honor dan menandai sudah atau belum dibayar.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('salary', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID penugasan tidak valid.');
    const { honor, paid } = patchSchema.parse(await readJson(req));
    const current = await prisma.assignment.findUnique({ where: { id }, select: { honor: true, paid: true, paidAt: true } });
    if (!current) return apiError(404, NOT_FOUND);

    // Tanggal bayar pertama dipertahankan kalau ditandai dibayar lagi.
    const paidAt = paid === undefined ? undefined : paid ? (current.paidAt ?? new Date()) : null;
    const item = await prisma.assignment.update({ where: { id }, data: { honor, paid, paidAt }, select: salarySelect });

    const summary = [
      honor !== undefined && honor !== current.honor ? `honor ${current.honor} menjadi ${honor}` : null,
      paid !== undefined && paid !== current.paid ? (paid ? 'ditandai dibayar' : 'tanda bayar dibatalkan') : null,
    ].filter(Boolean);
    await audit(auth.user, 'ubah', 'Assignment', id, summary.length ? summary.join('; ') : 'tanpa perubahan');
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error, { P2025: NOT_FOUND });
  }
}
