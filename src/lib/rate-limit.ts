const hits = new Map<string, number[]>();

// Hitungan disimpan di memori proses, jadi berlaku per instance server.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const since = now - windowMs;
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times[times.length - 1] <= since) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => t > since);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

// x-real-ip diisi reverse proxy (Traefik di VPS, Vercel); entri pertama x-forwarded-for dipakai kalau tidak ada.
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
