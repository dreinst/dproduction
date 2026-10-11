// Tanda proses hidup: dijawab selama server bisa melayani request. Sengaja tidak menyentuh database dan cache, supaya
// gangguan database tidak membuat semua instance dianggap mati. Dipakai cek "server terjangkau" di browser
// (HEAD dari src/lib/jaringan.ts, dijawab Next lewat handler GET ini) dan health check aktif load balancer.
// Kesiapan database dicek /api/health, yang hanya untuk pemantauan. Cache-Control: no-store dipasang next.config.ts
// untuk semua /api.
export function GET() {
  return Response.json({ ok: true });
}
