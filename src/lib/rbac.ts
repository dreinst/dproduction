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
const OWNERS: readonly Role[] = ['owner', 'superadmin'];
const MANAGERS: readonly Role[] = ['owner', 'superadmin', 'admin'];
const both = (roles: readonly Role[]) => ({ read: roles, write: roles });

export const API_ACCESS = {
  dashboard: { read: ALL, write: [] },
  workspaceEvents: { read: ALL, write: MANAGERS },
  workspaceReports: both(OWNERS),
  workspaceSalary: both(OWNERS),
  events: both(MANAGERS),
  weddings: both(MANAGERS),
  rentals: both(MANAGERS),
  gradeEvents: both(MANAGERS),
  jobdescs: both(MANAGERS),
  galeriFoto: both(MANAGERS),
  galeriFotoAlbums: both(MANAGERS),
  galeriVideo: both(MANAGERS),
  headHome: both(OWNERS),
  kantorSettings: both(OWNERS),
  database: both(OWNERS),
  leads: both(MANAGERS),
  users: both(['owner']),
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
  { ...page('Dashboard', '/management', 'dashboard'), icon: 'dashboard' },
  { ...page('Lead Masuk', '/management/leads', 'leads'), icon: 'leads' },
  { ...page('Database', '/management/database', 'database'), icon: 'database' },
  {
    name: 'Galeri',
    icon: 'galeri',
    children: [
      page('Foto', '/management/galeri/foto', 'galeriFotoAlbums'),
      page('Video', '/management/galeri/video', 'galeriVideo'),
    ],
  },
  {
    name: 'Master',
    icon: 'master',
    children: [
      page('Master Foto', '/management/master/foto', 'galeriFoto'),
      page('Master Event', '/management/master/event', 'events'),
      page('Master Wedding', '/management/master/wedding', 'weddings'),
      page('Master Rental', '/management/master/rental', 'rentals'),
      page('Master Grade Event', '/management/master/grade-event', 'gradeEvents'),
      page('Master JobDesc', '/management/master/jobdesc', 'jobdescs'),
    ],
  },
  {
    name: 'Setting',
    icon: 'setting',
    children: [
      page('Kantor', '/management/setting/kantor', 'kantorSettings'),
      page('Login', '/management/setting/login', 'users'),
      page('Head Home', '/management/setting/head-home', 'headHome'),
    ],
  },
  {
    name: 'Workspace',
    icon: 'workspace',
    children: [
      page('Event', '/management/workspace/event', 'workspaceEvents'),
      page('Report', '/management/workspace/report', 'workspaceReports'),
      page('Salary', '/management/workspace/salary', 'workspaceSalary'),
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
    l.href === '/management' ? path === l.href : path === l.href || path.startsWith(`${l.href}/`),
  );
  return !!link && link.roles.includes(role);
}

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !/^\/management(?:[/?#]|$)/.test(raw) || /[\\\s]|\/\//.test(raw)) return null;
  return /^\/management\/login(?:[/?#]|$)/.test(raw) ? null : raw;
}

export const WORKSPACE_EVENT_STATUS = ['running', 'selesai'] as const;
export type WorkspaceEventStatus = (typeof WORKSPACE_EVENT_STATUS)[number];
export const WORKSPACE_EVENT_STATUS_LABELS: Record<WorkspaceEventStatus, string> = {
  running: 'Berjalan',
  selesai: 'Selesai',
};

export const REPORT_STATUS = ['admin', 'selesai', 'performance'] as const;
export type ReportStatus = (typeof REPORT_STATUS)[number];
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  admin: 'Administrasi',
  selesai: 'Administrasi Selesai',
  performance: 'Team Performance',
};
