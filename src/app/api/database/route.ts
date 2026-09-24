import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';
import { requireAccess } from '@/lib/auth';
import { canAccessPath } from '@/lib/rbac';

// href null berarti tabel tidak punya halaman sendiri (hanya ditampilkan jumlahnya).
const TABLES: readonly (readonly [table: string, name: string, href: string | null])[] = [
  ['Client', 'Lead Masuk', '/management/leads'],
  ['Event', 'Master Event', '/management/master/event'],
  ['Wedding', 'Master Wedding', '/management/master/wedding'],
  ['Rental', 'Master Rental', '/management/master/rental'],
  ['GradeEvent', 'Master Grade Event', '/management/master/grade-event'],
  ['JobDesc', 'Master JobDesc', '/management/master/jobdesc'],
  ['Tarif', 'Master Tarif', '/management/master/tarif'],
  ['GaleriAlbum', 'Galeri Album', '/management/galeri/foto'],
  ['GaleriFoto', 'Galeri Foto', '/management/galeri/foto'],
  ['GaleriVideo', 'Galeri Video', '/management/galeri/video'],
  ['HeadHome', 'Setting Head Home', '/management/setting/head-home'],
  ['KantorSetting', 'Setting Kantor', '/management/setting/kantor'],
  ['User', 'Setting Login', '/management/setting/login'],
  ['WorkspaceEvent', 'Workspace Event', '/management/workspace/event'],
  ['Crew', 'Workspace Crew', '/management/workspace/crew'],
  ['Assignment', 'Penugasan Crew', '/management/workspace/salary'],
  ['AuditLog', 'Riwayat Perubahan', null],
];

type Row = { t: string; records: number; last: Date | null };

export async function GET() {
  try {
    const auth = await requireAccess('database', 'read');
    if (!auth.authorized) return auth.response;

    // Semua penghapusan permanen, jadi count(*) sudah jumlah data aktif. AuditLog tidak punya updatedAt.
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT 'Client' AS t, count(*)::int AS records, max("updatedAt") AS last FROM "Client"
      UNION ALL SELECT 'Event', count(*)::int, max("updatedAt") FROM "Event"
      UNION ALL SELECT 'Wedding', count(*)::int, max("updatedAt") FROM "Wedding"
      UNION ALL SELECT 'Rental', count(*)::int, max("updatedAt") FROM "Rental"
      UNION ALL SELECT 'GradeEvent', count(*)::int, max("updatedAt") FROM "GradeEvent"
      UNION ALL SELECT 'JobDesc', count(*)::int, max("updatedAt") FROM "JobDesc"
      UNION ALL SELECT 'Tarif', count(*)::int, max("updatedAt") FROM "Tarif"
      UNION ALL SELECT 'GaleriAlbum', count(*)::int, max("updatedAt") FROM "GaleriAlbum"
      UNION ALL SELECT 'GaleriFoto', count(*)::int, max("updatedAt") FROM "GaleriFoto"
      UNION ALL SELECT 'GaleriVideo', count(*)::int, max("updatedAt") FROM "GaleriVideo"
      UNION ALL SELECT 'HeadHome', count(*)::int, max("updatedAt") FROM "HeadHome"
      UNION ALL SELECT 'KantorSetting', count(*)::int, max("updatedAt") FROM "KantorSetting"
      UNION ALL SELECT 'User', count(*)::int, max("updatedAt") FROM "User"
      UNION ALL SELECT 'WorkspaceEvent', count(*)::int, max("updatedAt") FROM "WorkspaceEvent"
      UNION ALL SELECT 'Crew', count(*)::int, max("updatedAt") FROM "Crew"
      UNION ALL SELECT 'Assignment', count(*)::int, max("updatedAt") FROM "Assignment"
      UNION ALL SELECT 'AuditLog', count(*)::int, max("createdAt") FROM "AuditLog"
    `;
    const byTable = new Map(rows.map((row) => [row.t, row]));

    const data = TABLES.filter(([, , href]) => !href || canAccessPath(auth.user.role, href)).map(
      ([table, name, href], i) => {
        const row = byTable.get(table);
        return { id: i + 1, table, name, href, records: row?.records ?? 0, lastUpdated: row?.last ?? null };
      },
    );
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
