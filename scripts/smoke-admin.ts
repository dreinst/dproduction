// Uji cepat hak akses dan sesi dashboard terhadap server yang sedang jalan.
// Jalankan: SEED_PASSWORD=... JWT_SECRET=... BASE_URL=http://localhost:3000 npx tsx scripts/smoke-admin.ts
// SEED_PASSWORD harus sama dengan password akun seed, JWT_SECRET sama dengan milik server.
import { SignJWT } from 'jose';
import { API_ACCESS, ROLES, type Resource, type Role } from '../src/lib/rbac';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.SEED_PASSWORD;
const SECRET = process.env.JWT_SECRET;

if (!['localhost', '127.0.0.1'].includes(new URL(BASE_URL).hostname)) {
  throw new Error('BASE_URL hanya boleh localhost atau 127.0.0.1, karena skrip ini membuat dan menghapus user uji.');
}
if (!PASSWORD || !SECRET) throw new Error('Isi SEED_PASSWORD dan JWT_SECRET yang sama dengan server.');

const ENDPOINTS: Record<Resource, string> = {
  dashboard: '/api/dashboard',
  workspaceEvents: '/api/workspace-events',
  workspaceReports: '/api/workspace-reports',
  workspaceSalary: '/api/workspace-salary',
  events: '/api/events',
  weddings: '/api/weddings',
  rentals: '/api/rentals',
  gradeEvents: '/api/grade-events',
  jobdescs: '/api/jobdescs',
  galeriFoto: '/api/galeri-foto',
  galeriFotoAlbums: '/api/galeri-foto-albums',
  galeriVideo: '/api/galeri-video',
  headHome: '/api/head-home',
  kantorSettings: '/api/kantor-settings',
  database: '/api/database',
  leads: '/api/clients',
  users: '/api/users',
};

// Route yang belum memakai requireAccess dan masih menolak role yang sudah diizinkan API_ACCESS.
// Hapus entri begitu route-nya diperbaiki; skrip gagal kalau entri di sini ternyata sudah sesuai.
const PENDING = new Set<Resource>([]);

const runId = Date.now().toString(36);
let ipCount = 0;
let failures = 0;

function check(ok: boolean, label: string) {
  console.log(`${ok ? 'OK   ' : 'GAGAL'} ${label}`);
  if (!ok) failures++;
}

function get(path: string, cookie = '') {
  return fetch(BASE_URL + path, { headers: cookie ? { cookie } : {}, redirect: 'manual' });
}

function send(method: string, path: string, cookie: string, body?: unknown) {
  return fetch(BASE_URL + path, {
    method,
    headers: { cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function login(username: string, password: string) {
  // IP berbeda per percobaan supaya batas login per IP tidak ikut teruji di sini.
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-real-ip': `smoke-${runId}-${ipCount++}` },
    body: JSON.stringify({ username, password }),
  });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith('auth_token='))?.split(';')[0] ?? '';
  return { status: res.status, cookie };
}

const clearsCookie = (res: Response) =>
  res.headers.getSetCookie().some((c) => c.startsWith('auth_token=;') && /max-age=0/i.test(c));

const redirectsTo = (res: Response, path: string) =>
  [307, 308].includes(res.status) && new URL(res.headers.get('location') ?? '', BASE_URL).pathname === path;

async function accessMatrix() {
  const entries = Object.entries(ENDPOINTS) as [Resource, string][];
  for (const [, path] of entries) check((await get(path)).status === 401, `anonim GET ${path} -> 401`);

  const cookies = {} as Record<Role, string>;
  for (const role of ROLES) {
    const { status, cookie } = await login(role, PASSWORD!);
    check(status === 200 && !!cookie, `login ${role}`);
    cookies[role] = cookie;
  }

  const stillPending = new Set<Resource>();
  for (const role of ROLES) {
    for (const [resource, path] of entries) {
      const expected = (API_ACCESS[resource].read as readonly Role[]).includes(role) ? 200 : 403;
      const got = (await get(path, cookies[role])).status;
      if (PENDING.has(resource) && expected === 200 && got === 403) {
        console.log(`TUNDA ${role} GET ${path} -> 403, target 200 (route belum memakai requireAccess)`);
        stillPending.add(resource);
        continue;
      }
      check(got === expected, `${role} GET ${path} -> ${got} (harus ${expected})`);
    }
  }
  for (const resource of PENDING) {
    if (!stillPending.has(resource)) check(false, `${resource} sudah sesuai API_ACCESS, hapus dari PENDING di scripts/smoke-admin.ts`);
  }
  return cookies;
}

async function revocationAndLockout(owner: string) {
  const username = `smoke_${runId}`;
  const password = `Smoke-${runId}-Password`;
  const created = await send('POST', '/api/users', owner, { username, password, role: 'staff' });
  check(created.status === 201, 'owner membuat user uji');
  if (created.status !== 201) return;
  const { id } = (await created.json()) as { id: number };

  try {
    let session = await login(username, password);
    await send('POST', '/api/auth/logout', session.cookie);
    const afterLogout = await get('/api/auth/me', session.cookie);
    check(afterLogout.status === 401 && clearsCookie(afterLogout), 'token lama 401 setelah logout, dan cookie-nya dihapus');

    session = await login(username, password);
    check((await get('/api/dashboard', session.cookie)).status === 200, 'login ulang berhasil');
    await send('PUT', `/api/users/${id}`, owner, { active: false });
    check((await get('/api/dashboard', session.cookie)).status === 401, 'token lama 401 setelah user dinonaktifkan');

    await send('PUT', `/api/users/${id}`, owner, { active: true });
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) statuses.push((await login(username, 'password-yang-salah')).status);
    check(statuses.join(' ') === '401 401 401 401 429', `5 gagal berturut mengunci akun (${statuses.join(' ')})`);
    check((await login(username, password)).status === 429, 'password benar tetap ditolak selama terkunci');
  } finally {
    check((await send('DELETE', `/api/users/${id}`, owner)).status === 200, 'user uji dihapus');
  }
}

async function proxyChecks(owner: string) {
  const forged = await new SignJWT({ id: 1, role: 'Superuser', tokenVersion: 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(SECRET));
  for (const path of ['/management', '/management/setting/login', '/management/workspace/salary']) {
    const res = await get(path, `auth_token=${forged}`);
    check(redirectsTo(res, '/management/login') && clearsCookie(res), `role tidak dikenal di ${path} diarahkan ke login`);
  }
  check((await get('/api/users', `auth_token=${forged}`)).status === 401, 'role tidak dikenal ditolak API (401)');

  check(redirectsTo(await get('/management/tidak-terdaftar', owner), '/management'), 'halaman tidak terdaftar ditolak (default deny)');

  const broken = await get('/management/master/event', 'auth_token=abc');
  check(redirectsTo(broken, '/management/login') && clearsCookie(broken), 'cookie rusak dialihkan ke login dan dihapus');
  const loginPage = await get('/management/login', 'auth_token=abc');
  check(loginPage.status === 200, `halaman login tampil dengan cookie rusak, tanpa loop (${loginPage.status})`);
}

async function main() {
  const cookies = await accessMatrix();
  if (!cookies.owner) throw new Error('Login owner gagal, uji berikutnya dilewati.');
  await revocationAndLockout(cookies.owner);
  await proxyChecks(cookies.owner);
  console.log(failures ? `\n${failures} pemeriksaan gagal.` : '\nSemua pemeriksaan lolos.');
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
