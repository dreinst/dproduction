const hits = new Map<string, number[]>();

// Hitungan disimpan di memori proses, jadi berlaku per instance server dan kosong lagi setelah restart.
// Mencatat satu hit dan membalas sisa jatah; -1 berarti batas sudah tercapai dan hit tidak dicatat.
export function rateLimit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const since = now - windowMs;
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times[times.length - 1] <= since) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => t > since);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return -1;
  }
  recent.push(now);
  hits.set(key, recent);
  return limit - recent.length;
}

// Membatalkan hit terakhir (misalnya percobaan login yang ternyata berhasil), atau semua hit key itu kalau all.
// Membalas true kalau key itu punya hit.
export function forgetHits(key: string, all = false): boolean {
  const recent = hits.get(key);
  if (!recent?.length) return false;
  if (all) hits.delete(key);
  else recent.pop();
  return true;
}

// Hitungan gagal login per username, dipakai sama untuk username yang ada maupun tidak.
export const loginFailKey = (username: string) => `login-fail:${username}`;

// x-real-ip diisi reverse proxy (Traefik di VPS, Vercel); entri pertama x-forwarded-for dipakai kalau tidak ada.
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
