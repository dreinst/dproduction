// Satu-satunya tempat nama path admin ditulis.
// ADMIN_BASE  : alamat yang diketik admin. Di alamat ini tidak ada folder rute, jadi tanpa sesi hasilnya 404 asli.
// ADMIN_DALAM : folder asli halaman admin (src/app/dproadmin/dalam). Hanya dicapai lewat rewrite di src/proxy.ts;
//               diminta langsung selalu 404. Jangan membuat halaman admin yang namanya diawali "dalam".
// Berkas ini diimpor komponen klien admin dan proxy: jangan impor modul khusus server di sini, dan jangan diimpor
// komponen situs publik (nilainya akan ikut ke berkas JS yang diunduh semua pengunjung).
export const ADMIN_DALAM = '/dproadmin/dalam';

// Dibandingkan setelah di-decode dan dikecilkan supaya variasi huruf besar dan %xx ikut tertutup.
export function isInnerPath(pathname: string) {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {}
  return path.toLowerCase().startsWith(ADMIN_DALAM);
}

export const ADMIN_BASE = '/dproadmin';
export const ADMIN_LOGIN = `${ADMIN_BASE}/login`;

export function isAdminPath(pathname: string) {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}

// Alamat login untuk klien admin saat API membalas 401: kembali ke halaman semula setelah masuk lagi.
export function expiredLoginUrl(here: string) {
  return `${ADMIN_LOGIN}?next=${encodeURIComponent(here)}&expired=1`;
}
