import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';

type Params = { params: Promise<{ id: string }> };

// Melepas crew dari event. Penugasan yang sudah dibayar hanya boleh dihapus Pemilik atau Super Admin.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID penugasan tidak valid.');

    // Syarat paid ikut di WHERE supaya tanda bayar yang masuk bersamaan tidak terlewat.
    const where = can(auth.user.role, 'salary', 'write') ? { id } : { id, paid: false };
    const { count } = await prisma.assignment.deleteMany({ where });
    if (!count) {
      const exists = await prisma.assignment.findUnique({ where: { id }, select: { id: true } });
      return exists
        ? apiError(403, 'Penugasan yang sudah dibayar hanya bisa dihapus Pemilik atau Super Admin.')
        : apiError(404, 'Penugasan tidak ditemukan.');
    }
    await audit(auth.user, 'hapus', 'Assignment', id);
    return NextResponse.json({ message: 'Crew dilepas dari event.' });
  } catch (error) {
    return handleRouteError(error);
  }
}
