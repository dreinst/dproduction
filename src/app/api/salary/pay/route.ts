import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError, readJson } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { wibMonthRange } from '@/lib/workspace';
import { paySchema } from '../schema';

// Menandai semua penugasan crew ini yang belum dibayar di bulan itu (menurut tanggal mulai event, WIB).
export async function POST(req: Request) {
  try {
    const auth = await requireAccess('salary', 'write');
    if (!auth.authorized) return auth.response;
    const { crewId, month } = paySchema.parse(await readJson(req));
    const { count } = await prisma.assignment.updateMany({
      where: { crewId, paid: false, workspaceEvent: { startAt: wibMonthRange(month) } },
      data: { paid: true, paidAt: new Date() },
    });
    await audit(auth.user, 'ubah', 'Assignment', null, `crew ${crewId} bulan ${month}: ${count} penugasan ditandai dibayar`);
    return NextResponse.json({ count });
  } catch (error) {
    return handleRouteError(error);
  }
}
