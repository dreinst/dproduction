import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';
import { MESSAGES, jobDescSchema, jobDescSelect } from '../schema';

type Params = { params: Promise<{ id: string }> };
const INVALID_ID = 'ID JobDesc tidak valid.';

export async function GET(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'read');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const jobdesc = await prisma.jobDesc.findUnique({ where: { id }, select: jobDescSelect });
    return jobdesc ? NextResponse.json(jobdesc) : apiError(404, MESSAGES.P2025);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const jobdesc = await prisma.jobDesc.update({
      where: { id },
      data: jobDescSchema.parse(await readJson(req)),
      select: jobDescSelect,
    });
    await audit(auth.user, 'ubah', 'JobDesc', id, jobdesc.name);
    return NextResponse.json(jobdesc);
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}

// Tarif JobDesc ini ikut terhapus (cascade); penugasan crew yang memakainya membuat hapus ditolak 409.
// Tarif khusus Pemilik dan Super Admin, jadi role lain hanya bisa menghapus JobDesc yang belum punya tarif.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('jobdescs', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, INVALID_ID);
    const jobdesc = await prisma.jobDesc.findUnique({
      where: { id },
      select: { name: true, _count: { select: { tarif: true } } },
    });
    if (!jobdesc) return apiError(404, MESSAGES.P2025);
    const ownsTarif = can(auth.user.role, 'tarif', 'write');
    // Syarat tarif ikut di WHERE supaya tarif yang diisi bersamaan tidak ikut terhapus.
    const { count } = await prisma.jobDesc.deleteMany({ where: ownsTarif ? { id } : { id, tarif: { none: {} } } });
    if (!count) {
      return ownsTarif
        ? apiError(404, MESSAGES.P2025)
        : apiError(409, 'Masih ada tarif untuk JobDesc ini. Minta Pemilik atau Super Admin menghapus tarifnya dulu di Master Tarif.');
    }
    const tarif = jobdesc._count.tarif;
    await audit(auth.user, 'hapus', 'JobDesc', id, tarif ? `${jobdesc.name}, ${tarif} tarif ikut terhapus` : jobdesc.name);
    return NextResponse.json({ message: 'JobDesc dihapus permanen.' });
  } catch (error) {
    return handleRouteError(error, MESSAGES);
  }
}
