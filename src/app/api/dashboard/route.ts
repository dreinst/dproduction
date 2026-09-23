import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { WORKSPACE_EVENT_STATUS, type WorkspaceEventStatus } from '@/lib/rbac';

// WIB selalu UTC+7 tanpa jam musim panas, jadi batas tahun dan bulan cukup digeser 7 jam.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

const zero = (): Record<WorkspaceEventStatus, number> => ({ running: 0, selesai: 0 });

export async function GET(req: Request) {
  try {
    const auth = await requireAccess('dashboard', 'read');
    if (!auth.authorized) return auth.response;

    const raw = new URL(req.url).searchParams.get('year');
    const year = raw === null ? new Date(Date.now() + WIB_OFFSET_MS).getUTCFullYear() : Number(raw);
    if (raw !== null && !(/^\d{4}$/.test(raw) && year >= 2000 && year <= 2100)) {
      return apiError(400, 'Tahun harus berupa angka 2000 sampai 2100.');
    }

    const events = await prisma.workspaceEvent.findMany({
      where: {
        deletedAt: null,
        status: { in: [...WORKSPACE_EVENT_STATUS] },
        date: { gte: new Date(Date.UTC(year, 0) - WIB_OFFSET_MS), lt: new Date(Date.UTC(year + 1, 0) - WIB_OFFSET_MS) },
      },
      select: { date: true, status: true },
    });

    const totals = zero();
    const monthly = MONTHS.map((month) => ({ month, ...zero() }));
    for (const { date, status } of events) {
      const key = status as WorkspaceEventStatus;
      totals[key]++;
      monthly[new Date(date.getTime() + WIB_OFFSET_MS).getUTCMonth()][key]++;
    }
    return NextResponse.json({ year, totals, monthly });
  } catch (error) {
    return handleRouteError(error);
  }
}
