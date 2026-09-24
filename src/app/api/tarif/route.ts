import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, readJson, zRupiah } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { zRefId } from '../workspace-events/shared';

const NOT_FOUND = 'JobDesc atau Grade tidak ditemukan. Muat ulang halaman lalu coba lagi.';

// amount null menghapus tarif, angka menyimpan atau mengganti tarif.
const putSchema = z
  .object({
    jobDescId: zRefId('JobDesc'),
    gradeEventId: zRefId('Grade'),
    amount: zRupiah('Tarif').nullable(),
  })
  .strict();

export async function GET() {
  try {
    const auth = await requireAccess('tarif', 'read');
    if (!auth.authorized) return auth.response;
    const [jobdescs, grades, tarif] = await Promise.all([
      prisma.jobDesc.findMany({ select: { id: true, name: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
      prisma.gradeEvent.findMany({ select: { id: true, grade: true }, orderBy: [{ grade: 'asc' }, { id: 'asc' }] }),
      prisma.tarif.findMany({ select: { jobDescId: true, gradeEventId: true, amount: true } }),
    ]);
    return NextResponse.json({ jobdescs, grades, tarif });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAccess('tarif', 'write');
    if (!auth.authorized) return auth.response;
    const { jobDescId, gradeEventId, amount } = putSchema.parse(await readJson(req));
    const [jobDesc, grade, current] = await Promise.all([
      prisma.jobDesc.findUnique({ where: { id: jobDescId }, select: { id: true } }),
      prisma.gradeEvent.findUnique({ where: { id: gradeEventId }, select: { id: true } }),
      prisma.tarif.findUnique({ where: { jobDescId_gradeEventId: { jobDescId, gradeEventId } }, select: { amount: true } }),
    ]);
    if (!jobDesc || !grade) return apiError(400, NOT_FOUND);

    if (amount === null) {
      await prisma.tarif.deleteMany({ where: { jobDescId, gradeEventId } });
    } else {
      await prisma.tarif.upsert({
        where: { jobDescId_gradeEventId: { jobDescId, gradeEventId } },
        create: { jobDescId, gradeEventId, amount },
        update: { amount },
      });
    }
    const before = current ? String(current.amount) : 'belum diatur';
    const after = amount === null ? 'dihapus' : String(amount);
    await audit(auth.user, 'ubah', 'Tarif', null, `jobdesc ${jobDescId}, grade ${gradeEventId}: tarif ${before} menjadi ${after}`);
    return NextResponse.json({ jobDescId, gradeEventId, amount });
  } catch (error) {
    // JobDesc atau grade terhapus bersamaan: FK gagal saat upsert.
    return handleRouteError(error, { P2003: NOT_FOUND });
  }
}
