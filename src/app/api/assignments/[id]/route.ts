import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';

type Params = { params: Promise<{ id: string }> };

// Melepas crew dari event. Penugasan yang sudah dibayar, atau yang honornya tidak lagi sama dengan tarif (misalnya diubah
// manual oleh Pemilik), hanya boleh dihapus Pemilik atau Super Admin. Tanpa syarat honor, role lain bisa mengembalikan
// honor manual ke tarif dengan melepas lalu menugaskan ulang crew.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID penugasan tidak valid.');

    const current = await prisma.assignment.findUnique({
      where: { id },
      select: { jobDescId: true, workspaceEvent: { select: { gradeEventId: true } } },
    });
    if (!current) return apiError(404, 'Penugasan tidak ditemukan.');
    const ownsSalary = can(auth.user.role, 'salary', 'write');
    let where: Prisma.AssignmentWhereInput = { id };
    if (!ownsSalary) {
      const { gradeEventId } = current.workspaceEvent;
      const tarif = gradeEventId
        ? await prisma.tarif.findUnique({
            where: { jobDescId_gradeEventId: { jobDescId: current.jobDescId, gradeEventId } },
            select: { amount: true },
          })
        : null;
      // Syarat paid dan honor ikut di WHERE supaya tanda bayar atau honor yang diubah bersamaan tidak terlewat.
      where = { id, paid: false, honor: tarif?.amount ?? 0 };
    }
    const { count } = await prisma.assignment.deleteMany({ where });
    if (!count) {
      return ownsSalary
        ? apiError(404, 'Penugasan tidak ditemukan.')
        : apiError(
            403,
            'Penugasan yang sudah dibayar atau honornya berbeda dari tarif saat ini hanya bisa dilepas Pemilik atau Super Admin.',
          );
    }
    await audit(auth.user, 'hapus', 'Assignment', id);
    return NextResponse.json({ message: 'Crew dilepas dari event.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
