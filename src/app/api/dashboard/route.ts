import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { WIB_OFFSET_MS, wibYearRange } from '@/lib/workspace';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

// Dihitung dari tanggal mulai event dalam kalender WIB. Batal dan ditunda hanya masuk total, tidak ke grafik bulanan.
export async function GET(req: Request) {
  try {
    const auth = await requireAccess('dashboard', 'read');
    if (!auth.authorized) return auth.response;

    const raw = new URL(req.url).searchParams.get('year');
    if (raw !== null && !/^\d{4}$/.test(raw)) return apiError(400, 'Tahun harus berupa angka 2000 sampai 2100.');
    const year = raw === null ? new Date(Date.now() + WIB_OFFSET_MS).getUTCFullYear() : Number(raw);

    const events = await prisma.workspaceEvent.findMany({
      where: { startAt: wibYearRange(year) },
      select: { startAt: true, status: true },
    });

    const totals = { berjalan: 0, selesai: 0, batal: 0, ditunda: 0 };
    const monthly = MONTHS.map((month) => ({ month, berjalan: 0, selesai: 0 }));
    for (const { startAt, status } of events) {
      totals[status]++;
      if (status === 'berjalan' || status === 'selesai') {
        monthly[new Date(startAt.getTime() + WIB_OFFSET_MS).getUTCMonth()][status]++;
      }
    }
    return NextResponse.json({ year, totals, monthly });
  } catch (error) {
    return handleRouteError(error);
  }
}
