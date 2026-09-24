import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError, parseId, readJson, zRupiah } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/rbac';
import { assignmentSelect, zRefId } from '../../shared';

type Params = { params: Promise<{ id: string }> };

const schema = z
  .object({
    crewId: zRefId('Crew'),
    jobDescId: zRefId('JobDesc'),
    honor: zRupiah('Honor').nullable().optional(),
  })
  .strict();

// Menugaskan crew ke event. Honor diisi dari Tarif JobDesc untuk level event, kecuali Pemilik atau Super Admin mengisinya sendiri.
export async function POST(req: Request, { params }: Params) {
  try {
    const auth = await requireAccess('workspaceEvents', 'write');
    if (!auth.authorized) return auth.response;
    const id = parseId((await params).id);
    if (!id) return apiError(400, 'ID event tidak valid.');

    const body = await readJson(req);
    if ((body as { honor?: unknown } | null)?.honor != null && !can(auth.user.role, 'salary', 'write')) {
      return apiError(403, 'Honor hanya bisa diisi Pemilik atau Super Admin.');
    }
    const { crewId, jobDescId, honor } = schema.parse(body);

    const [event, crew, jobDesc] = await Promise.all([
      prisma.workspaceEvent.findUnique({ where: { id }, select: { gradeEventId: true } }),
      prisma.crew.findFirst({ where: { id: crewId, active: true }, select: { id: true } }),
      prisma.jobDesc.findUnique({ where: { id: jobDescId }, select: { id: true } }),
    ]);
    if (!event) return apiError(404, 'Event tidak ditemukan.');
    if (!crew) return apiError(400, 'Crew tidak ditemukan atau sudah nonaktif.');
    if (!jobDesc) return apiError(400, 'JobDesc tidak ditemukan.');

    let amount = honor ?? null;
    if (amount === null && event.gradeEventId !== null) {
      const tarif = await prisma.tarif.findUnique({
        where: { jobDescId_gradeEventId: { jobDescId, gradeEventId: event.gradeEventId } },
        select: { amount: true },
      });
      amount = tarif?.amount ?? null;
    }

    const item = await prisma.assignment.create({
      data: { workspaceEventId: id, crewId, jobDescId, honor: amount ?? 0 },
      select: assignmentSelect(auth.user.role),
    });
    await audit(
      auth.user,
      'tambah',
      'Assignment',
      item.id,
      `event ${id}, crew ${crewId}, jobdesc ${jobDescId}, honor ${honor == null ? 'dari tarif' : 'diisi manual'}`,
    );
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      P2002: 'Crew ini sudah ditugaskan dengan JobDesc yang sama di event ini.',
      P2003: 'Event, crew, atau JobDesc sudah dihapus. Muat ulang halaman lalu coba lagi.',
    });
  }
}
