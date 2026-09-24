import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { ADMIN_STATUS, type AdminStatus } from '@/lib/rbac';
import { reportSelect } from './schema';

const isAdminStatus = (value: string): value is AdminStatus => (ADMIN_STATUS as readonly string[]).includes(value);

// Report = status administrasi per Workspace Event.
export async function GET(req: Request) {
  try {
    const auth = await requireAccess('reports', 'read');
    if (!auth.authorized) return auth.response;
    const adminStatus = new URL(req.url).searchParams.get('adminStatus');
    if (adminStatus !== null && !isAdminStatus(adminStatus)) {
      return apiError(400, 'Status administrasi harus belum, invoice_terkirim, lunas, atau selesai.');
    }
    const items = await prisma.workspaceEvent.findMany({
      where: adminStatus === null ? undefined : { adminStatus },
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      select: reportSelect,
    });
    return NextResponse.json(items);
  } catch (error) {
    return handleRouteError(error);
  }
}
