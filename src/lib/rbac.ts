import { ADMIN_BASE, ADMIN_LOGIN, isAdminPath, isInnerPath } from '@/lib/admin-path';

export const ROLES = ['owner', 'superadmin', 'admin', 'staff', 'tester'] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Pemilik',
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staf',
  tester: 'Penguji',
};

export type Action = 'read' | 'write';

const ALL: readonly Role[] = ROLES;
// Owner (Pemilik) dan Superadmin setara, sama dengan aturan Produksia.
export const OWNERS: readonly Role[] = ['owner', 'superadmin'];
export const MANAGERS: readonly Role[] = ['owner', 'superadmin', 'admin'];
const both = (roles: readonly Role[]) => ({ read: roles, write: roles });

export const API_ACCESS = {
  dashboard: { read: ALL, write: [] },
  workspaceEvents: { read: ALL, write: MANAGERS },
  crews: both(MANAGERS),
  reports: both(OWNERS),
  salary: both(OWNERS),
  // Tarif honor hanya untuk owner dan superadmin; JobDesc sendiri hanya berisi nama sehingga tetap MANAGERS.
  tarif: both(OWNERS),
  events: both(MANAGERS),
  weddings: both(MANAGERS),
  rentals: both(MANAGERS),
  gradeEvents: both(MANAGERS),
  jobdescs: both(MANAGERS),
  galeriFoto: both(MANAGERS),
  galeriVideo: both(MANAGERS),
  headHome: both(OWNERS),
  kantorSettings: both(OWNERS),
  database: both(OWNERS),
  leads: both(MANAGERS),
  users: both(OWNERS),
  uploads: { read: [], write: MANAGERS },
} satisfies Record<string, Record<Action, readonly Role[]>>;

export type Resource = keyof typeof API_ACCESS;

export function can(role: unknown, resource: Resource, action: Action): boolean {
  return isRole(role) && (API_ACCESS[resource][action] as readonly Role[]).includes(role);
}

export type NavIcon = 'dashboard' | 'leads' | 'database' | 'galeri' | 'master' | 'setting' | 'workspace';
export type NavLink = { name: string; href: string; roles: readonly Role[] };
export type NavItem =
  | (NavLink & { icon: NavIcon; children?: undefined })
  | { name: string; icon: NavIcon; children: NavLink[]; href?: undefined; roles?: undefined };

const page = (name: string, href: string, resource: Resource): NavLink => ({
  name,
  href,
  roles: API_ACCESS[resource].read,
});

export const NAV: NavItem[] = [
  { ...page('Dashboard', ADMIN_BASE, 'dashboard'), icon: 'dashboard' },
  { ...page('Lead Masuk', `${ADMIN_BASE}/leads`, 'leads'), icon: 'leads' },
  { ...page('Database', `${ADMIN_BASE}/database`, 'database'), icon: 'database' },
  {
    name: 'Galeri',
    icon: 'galeri',
    children: [
      page('Foto', `${ADMIN_BASE}/galeri/foto`, 'galeriFoto'),
      page('Video', `${ADMIN_BASE}/galeri/video`, 'galeriVideo'),
    ],
  },
  {
    name: 'Master',
    icon: 'master',
    children: [
      page('Master Event', `${ADMIN_BASE}/master/event`, 'events'),
      page('Master Wedding', `${ADMIN_BASE}/master/wedding`, 'weddings'),
      page('Master Rental', `${ADMIN_BASE}/master/rental`, 'rentals'),
      page('Master Grade Event', `${ADMIN_BASE}/master/grade-event`, 'gradeEvents'),
      page('Master JobDesc', `${ADMIN_BASE}/master/jobdesc`, 'jobdescs'),
      page('Master Tarif', `${ADMIN_BASE}/master/tarif`, 'tarif'),
    ],
  },
  {
    name: 'Setting',
    icon: 'setting',
    children: [
      page('Kantor', `${ADMIN_BASE}/setting/kantor`, 'kantorSettings'),
      page('Login', `${ADMIN_BASE}/setting/login`, 'users'),
      page('Head Home', `${ADMIN_BASE}/setting/head-home`, 'headHome'),
    ],
  },
  {
    name: 'Workspace',
    icon: 'workspace',
    children: [
      page('Event', `${ADMIN_BASE}/workspace/event`, 'workspaceEvents'),
      page('Crew', `${ADMIN_BASE}/workspace/crew`, 'crews'),
      page('Report', `${ADMIN_BASE}/workspace/report`, 'reports'),
      page('Salary', `${ADMIN_BASE}/workspace/salary`, 'salary'),
    ],
  },
];

const NAV_LINKS: NavLink[] = NAV.flatMap((item) => item.children ?? [item]);

export function navFor(role: unknown): NavItem[] {
  if (!isRole(role)) return [];
  return NAV.flatMap((item): NavItem[] => {
    if (!item.children) return item.roles.includes(role) ? [item] : [];
    const children = item.children.filter((child) => child.roles.includes(role));
    return children.length ? [{ ...item, children }] : [];
  });
}

export function canAccessPath(role: unknown, pathname: string): boolean {
  if (!isRole(role)) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const link = NAV_LINKS.find((l) =>
    l.href === ADMIN_BASE ? path === l.href : path === l.href || path.startsWith(`${l.href}/`),
  );
  return !!link && link.roles.includes(role);
}

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith('/') || /[\\\s]|^\/\//.test(raw)) return null;
  let url: URL;
  try {
    // Di-resolve dulu supaya segmen titik, termasuk yang ter-encode (%2e), ikut dinormalkan sebelum dicek.
    url = new URL(raw, 'http://internal.invalid');
  } catch {
    return null;
  }
  if (url.origin !== 'http://internal.invalid') return null;
  const { pathname } = url;
  if (!isAdminPath(pathname) || isInnerPath(pathname)) return null;
  if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) return null;
  return pathname + url.search + url.hash;
}

// Nilai harus sama persis dengan enum di prisma/schema.prisma. File ini diimpor komponen klien, jadi jangan impor @prisma/client.
export const WORKSPACE_EVENT_STATUS = ['berjalan', 'selesai', 'batal', 'ditunda'] as const;
export type WorkspaceEventStatus = (typeof WORKSPACE_EVENT_STATUS)[number];
export const WORKSPACE_EVENT_STATUS_LABELS: Record<WorkspaceEventStatus, string> = {
  berjalan: 'Berjalan',
  selesai: 'Selesai',
  batal: 'Batal',
  ditunda: 'Ditunda',
};

export const ADMIN_STATUS = ['belum', 'invoice_terkirim', 'lunas', 'selesai'] as const;
export type AdminStatus = (typeof ADMIN_STATUS)[number];
export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  belum: 'Belum',
  invoice_terkirim: 'Invoice Terkirim',
  lunas: 'Lunas',
  selesai: 'Selesai',
};

export const LEAD_STATUS = ['baru', 'dihubungi', 'penawaran', 'deal', 'batal'] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  penawaran: 'Penawaran',
  deal: 'Deal',
  batal: 'Batal',
};
