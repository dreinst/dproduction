import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { canAccessPath } from '@/lib/rbac';

const TABLES = [
  ['Client', 'Lead Masuk', '/management/leads'],
  ['Event', 'Master Event', '/management/master/event'],
  ['Wedding', 'Master Wedding', '/management/master/wedding'],
  ['Rental', 'Master Rental', '/management/master/rental'],
  ['GradeEvent', 'Master Grade Event', '/management/master/grade-event'],
  ['JobDesc', 'Master JobDesc', '/management/master/jobdesc'],
  ['GaleriFoto', 'Master Foto', '/management/master/foto'],
  ['GaleriFotoAlbum', 'Galeri Foto', '/management/galeri/foto'],
  ['GaleriVideo', 'Galeri Video', '/management/galeri/video'],
  ['HeadHome', 'Setting Head Home', '/management/setting/head-home'],
  ['KantorSetting', 'Setting Kantor', '/management/setting/kantor'],
  ['User', 'Setting Login', '/management/setting/login'],
  ['WorkspaceEvent', 'Workspace Event', '/management/workspace/event'],
  ['WorkspaceReport', 'Workspace Report', '/management/workspace/report'],
  ['WorkspaceSalary', 'Workspace Salary', '/management/workspace/salary'],
] as const;

type Row = { t: string; records: number; last: Date | null };

export async function GET() {
  try {
    const auth = await requireAccess('database', 'read');
    if (!auth.authorized) return auth.response;

    // Baris yang di-soft-delete tidak dihitung, tetapi waktu hapusnya tetap tercatat sebagai update terakhir.
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT 'Client' AS t, (count(*) FILTER (WHERE "deletedAt" IS NULL))::int AS records, max("createdAt") AS last FROM "Client"
      UNION ALL SELECT 'Event', (count(*) FILTER (WHERE "deletedAt" IS NULL))::int, max("updatedAt") FROM "Event"
      UNION ALL SELECT 'Wedding', (count(*) FILTER (WHERE "deletedAt" IS NULL))::int, max("updatedAt") FROM "Wedding"
      UNION ALL SELECT 'Rental', count(*)::int, max("updatedAt") FROM "Rental"
      UNION ALL SELECT 'GradeEvent', count(*)::int, max("updatedAt") FROM "GradeEvent"
      UNION ALL SELECT 'JobDesc', count(*)::int, max("updatedAt") FROM "JobDesc"
      UNION ALL SELECT 'GaleriFoto', count(*)::int, max("createdAt") FROM "GaleriFoto"
      UNION ALL SELECT 'GaleriFotoAlbum', count(*)::int, max("updatedAt") FROM "GaleriFotoAlbum"
      UNION ALL SELECT 'GaleriVideo', count(*)::int, max("createdAt") FROM "GaleriVideo"
      UNION ALL SELECT 'HeadHome', count(*)::int, max("updatedAt") FROM "HeadHome"
      UNION ALL SELECT 'KantorSetting', count(*)::int, max("updatedAt") FROM "KantorSetting"
      UNION ALL SELECT 'User', count(*)::int, max("updatedAt") FROM "User"
      UNION ALL SELECT 'WorkspaceEvent', (count(*) FILTER (WHERE "deletedAt" IS NULL))::int, max("updatedAt") FROM "WorkspaceEvent"
      UNION ALL SELECT 'WorkspaceReport', count(*)::int, max("updatedAt") FROM "WorkspaceReport"
      UNION ALL SELECT 'WorkspaceSalary', (count(*) FILTER (WHERE "deletedAt" IS NULL))::int, max("updatedAt") FROM "WorkspaceSalary"
    `;
    const byTable = new Map(rows.map((row) => [row.t, row]));

    const data = TABLES.filter(([, , href]) => canAccessPath(auth.user.role, href)).map(([table, name, href], i) => {
      const row = byTable.get(table);
      return { id: i + 1, table, name, href, records: row?.records ?? 0, lastUpdated: row?.last ?? null };
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
