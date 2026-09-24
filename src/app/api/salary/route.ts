import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { WIB_OFFSET_MS, wibMonthRange } from '@/lib/workspace';
import { salarySelect } from './schema';

// Penugasan crew di bulan (WIB) menurut tanggal mulai event, plus rekap honor per crew.
export async function GET(req: Request) {
  try {
    const auth = await requireAccess('salary', 'read');
    if (!auth.authorized) return auth.response;
    const month =
      new URL(req.url).searchParams.get('month') ?? new Date(Date.now() + WIB_OFFSET_MS).toISOString().slice(0, 7);
    const assignments = await prisma.assignment.findMany({
      where: { workspaceEvent: { startAt: wibMonthRange(month) } },
      orderBy: [{ workspaceEvent: { startAt: 'asc' } }, { id: 'asc' }],
      select: salarySelect,
    });

    const byCrew = new Map<number, { crewId: number; crewName: string; count: number; total: number; paidTotal: number; unpaidTotal: number }>();
    for (const a of assignments) {
      const row = byCrew.get(a.crew.id) ?? {
        crewId: a.crew.id,
        crewName: a.crew.name,
        count: 0,
        total: 0,
        paidTotal: 0,
        unpaidTotal: 0,
      };
      row.count++;
      row.total += a.honor;
      if (a.paid) row.paidTotal += a.honor;
      else row.unpaidTotal += a.honor;
      byCrew.set(a.crew.id, row);
    }
    const recap = [...byCrew.values()].sort((a, b) => a.crewName.localeCompare(b.crewName, 'id') || a.crewId - b.crewId);
    return NextResponse.json({ month, assignments, recap });
  } catch (error) {
    return handleRouteError(error);
  }
}
