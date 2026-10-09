// Uji cepat hak akses dan sesi dashboard terhadap server yang sedang jalan.
// Jalankan: SEED_PASSWORD=... JWT_SECRET=... BASE_URL=http://localhost:3000 npx tsx scripts/smoke-admin.ts
// SEED_PASSWORD harus sama dengan password akun seed, JWT_SECRET sama dengan milik server.
// Kalau server dibangun dengan NEXT_PUBLIC_ADMIN_BASE, pasang nilai yang sama saat menjalankan skrip ini.
import { SignJWT } from 'jose';
import { API_ACCESS, ROLES, type Resource, type Role } from '../src/lib/rbac';
import { ADMIN_BASE, ADMIN_DALAM, ADMIN_LOGIN } from '../src/lib/admin-path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.SEED_PASSWORD;
const SECRET = process.env.JWT_SECRET;

if (!['localhost', '127.0.0.1'].includes(new URL(BASE_URL).hostname)) {
  throw new Error('BASE_URL hanya boleh localhost atau 127.0.0.1, karena skrip ini membuat dan menghapus user uji.');
}
if (!PASSWORD || !SECRET) throw new Error('Isi SEED_PASSWORD dan JWT_SECRET yang sama dengan server.');

type ReadResource = Exclude<Resource, 'uploads'>;

const ENDPOINTS: Record<ReadResource, string> = {
  dashboard: '/api/dashboard',
  workspaceEvents: '/api/workspace-events',
  crews: '/api/crews',
  reports: '/api/reports',
  salary: `/api/salary?month=${new Date().toISOString().slice(0, 7)}`,
  tarif: '/api/tarif',
  events: '/api/events',
  weddings: '/api/weddings',
  rentals: '/api/rentals',
  gradeEvents: '/api/grade-events',
  jobdescs: '/api/jobdescs',
  galeriFoto: '/api/galeri-albums',
  galeriVideo: '/api/galeri-video',
  headHome: '/api/head-home',
  kantorSettings: '/api/kantor-settings',
  database: '/api/database',
  leads: '/api/clients',
  users: '/api/users',
};

// Route yang belum memakai requireAccess dan masih menolak role yang sudah diizinkan API_ACCESS.
// Hapus entri begitu route-nya diperbaiki; skrip gagal kalau entri di sini ternyata sudah sesuai.
const PENDING = new Set<ReadResource>([]);

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
  const pick = (name: string) => res.headers.getSetCookie().find((c) => c.startsWith(`${name}=`))?.split(';')[0] ?? '';
  return { status: res.status, cookie: pick('auth_token'), known: pick('dpro_kenal') };
}

const clearsCookie = (res: Response) =>
  res.headers.getSetCookie().some((c) => c.startsWith('auth_token=;') && /max-age=0/i.test(c));

const redirectsTo = (res: Response, path: string) =>
  [307, 308].includes(res.status) && new URL(res.headers.get('location') ?? '', BASE_URL).pathname === path;

async function accessMatrix() {
  const entries = Object.entries(ENDPOINTS) as [ReadResource, string][];
  for (const [, path] of entries) check((await get(path)).status === 401, `anonim GET ${path} -> 401`);

  const cookies = {} as Record<Role, string>;
  for (const role of ROLES) {
    const { status, cookie } = await login(role, PASSWORD!);
    check(status === 200 && !!cookie, `login ${role}`);
    cookies[role] = cookie;
  }

  const stillPending = new Set<ReadResource>();
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
  const password = `Smoke1-${runId}-Password`;
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

    const newPassword = `${password}-baru`;
    await send('PUT', `/api/users/${id}`, owner, { password: newPassword });
    check((await login(username, newPassword)).status === 200, 'owner membuka kunci dengan mengganti password');
  } finally {
    check((await send('DELETE', `/api/users/${id}`, owner)).status === 200, 'user uji dihapus');
  }
}

async function proxyChecks(owner: string, known: string) {
  const forged = await new SignJWT({ id: 1, role: 'Superuser', tokenVersion: 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(SECRET));
  const acak = await get(`/acak-${runId}`);
  const sama = async (res: Response) => res.status === 404 && (await res.text()) === acakBody && !res.headers.has('set-cookie') && !res.headers.has('location');
  const acakBody = await acak.text();
  check(acak.status === 404, 'alamat acak 404');

  // Tanpa sesi sah dan tanpa cookie kenal, alamat admin harus sama dengan alamat yang tidak ada.
  for (const path of [ADMIN_BASE, `${ADMIN_BASE}/setting/login`, `${ADMIN_BASE}/workspace/salary`]) {
    check(await sama(await get(path)), `tanpa cookie, ${path} sama dengan 404 biasa`);
    check(await sama(await get(path, `auth_token=${forged}`)), `role tidak dikenal di ${path} sama dengan 404 biasa`);
    check(await sama(await get(path, 'auth_token=abc')), `cookie rusak di ${path} sama dengan 404 biasa`);
  }
  check(await sama(await get('/login')), '/login sama dengan 404 biasa');
  check((await get('/api/users', `auth_token=${forged}`)).status === 401, 'role tidak dikenal ditolak API (401)');

  // Folder dalam tidak pernah terbuka lewat alamatnya sendiri, juga untuk sesi sah.
  for (const path of [ADMIN_DALAM, `${ADMIN_DALAM}/login`, `${ADMIN_DALAM}/master/event`]) {
    check((await get(path, owner)).status === 404, `${path} 404 walau sesi sah`);
  }

  check(redirectsTo(await get(`${ADMIN_BASE}/tidak-terdaftar`, owner), ADMIN_BASE), 'halaman tidak terdaftar ditolak (default deny)');
  check((await get(`${ADMIN_BASE}/master/event`, owner)).status === 200, 'sesi sah membuka halaman admin (200)');
  check(redirectsTo(await get(ADMIN_LOGIN, owner), ADMIN_BASE), 'halaman login dengan sesi sah dialihkan ke dashboard');
  const next = (path: string) => get(`${ADMIN_LOGIN}?next=${encodeURIComponent(path)}`, owner);
  check(redirectsTo(await next(`${ADMIN_BASE}/master/event`), `${ADMIN_BASE}/master/event`), 'next ke halaman admin diikuti');
  check(redirectsTo(await next(`${ADMIN_DALAM}/master/event`), ADMIN_BASE), 'next ke folder dalam ditolak');

  // Peramban yang pernah masuk (cookie kenal sah) dialihkan ke login, bukan 404.
  const dikenal = await get(`${ADMIN_BASE}/master/event`, known);
  check(redirectsTo(dikenal, ADMIN_LOGIN) && dikenal.headers.get('location')!.includes('expired=1'), 'cookie kenal tanpa sesi dialihkan ke login');
  const habis = await get(`${ADMIN_BASE}/master/event`, `${known}; auth_token=abc`);
  check(redirectsTo(habis, ADMIN_LOGIN) && clearsCookie(habis), 'cookie kenal dengan sesi rusak dialihkan ke login dan cookie sesi dihapus');

  // Halaman 404 tidak boleh dibuat ulang saat server berjalan: Next menyimpan alamat permintaan pemicunya di dalam HTML
  // 404 yang lalu disajikan ke semua orang. Simpan konten (memanggil revalidateLanding), minta alamat admin tanpa sesi,
  // lalu pastikan 404 untuk alamat lain tidak berubah.
  const kantor = ((await (await get('/api/kantor-settings', owner)).json()) as Record<string, unknown>[])[0];
  if (kantor) {
    const data = { ...kantor };
    for (const key of ['id', 'createdAt', 'updatedAt']) delete data[key];
    check((await send('PUT', '/api/kantor-settings/1', owner, data)).status === 200, 'simpan ulang Setting Kantor (memicu revalidateLanding)');
    await (await get(`${ADMIN_BASE}/setting/kantor`)).text();
    const sesudah = await (await get(`/acak-sesudah-${runId}`)).text();
    check(sesudah === acakBody && !sesudah.includes(ADMIN_BASE.slice(1)), 'halaman 404 tidak dibuat ulang dan tidak memuat alamat admin setelah konten disimpan');
  } else {
    console.log('LEWAT cek 404 setelah revalidasi: belum ada baris Setting Kantor');
  }

  // nofollow hanya dipasang proxy; noindex saja juga datang dari next.config.ts untuk host selain domain resmi.
  const loginPage = await get(ADMIN_LOGIN, 'auth_token=abc');
  check(loginPage.status === 200 && /nofollow/.test(loginPage.headers.get('x-robots-tag') ?? ''), `halaman login tampil dengan cookie rusak dan membawa noindex, nofollow (${loginPage.status})`);
}

async function main() {
  const cookies = await accessMatrix();
  if (!cookies.owner) throw new Error('Login owner gagal, uji berikutnya dilewati.');
  check((await get('/api/users', cookies.superadmin)).status === 200, 'superadmin GET /api/users -> 200 (setara owner)');
  await revocationAndLockout(cookies.owner);
  const { known } = await login('owner', PASSWORD!);
  check(!!known, 'login memasang cookie kenal');
  await proxyChecks(cookies.owner, known);
  console.log(failures ? `\n${failures} pemeriksaan gagal.` : '\nSemua pemeriksaan lolos.');
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
